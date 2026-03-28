import type { Command } from './types';
import type { Position, Node, TrackSegment, NetworkState, TrackType, Junction } from '../model/network';
import { generateId } from '../utils/id';
import { recalculateAllBlocks } from '../sim/blockBuilder';

export interface PlaceTrackArgs {
  startPos: Position;
  endPos: Position;
  trackType?: TrackType;
  connectTolerance?: number;
}

interface TrackProjectionHit {
  trackId: string;
  startNodeId: string;
  endNodeId: string;
  projectedPos: Position;
  t: number;
  distance: number;
}

function distance(a: Position, b: Position): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function findNearestNodeId(
  nodes: Record<string, Node>,
  target: Position,
  tolerance: number
): string | null {
  let bestNodeId: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const node of Object.values(nodes)) {
    const dx = node.position.x - target.x;
    const dy = node.position.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= tolerance && distance < bestDistance) {
      bestDistance = distance;
      bestNodeId = node.id;
    }
  }

  return bestNodeId;
}

function projectPointToSegment(point: Position, a: Position, b: Position): { t: number; projectedPos: Position; distance: number } {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = point.x - a.x;
  const wy = point.y - a.y;

  const vLenSquared = vx * vx + vy * vy;
  if (vLenSquared <= Number.EPSILON) {
    return {
      t: 0,
      projectedPos: a,
      distance: distance(point, a)
    };
  }

  const unclampedT = (wx * vx + wy * vy) / vLenSquared;
  const t = Math.max(0, Math.min(1, unclampedT));
  const projectedPos = {
    x: a.x + vx * t,
    y: a.y + vy * t
  };

  return {
    t,
    projectedPos,
    distance: distance(point, projectedPos)
  };
}

function findNearestTrackProjection(
  state: NetworkState,
  target: Position,
  tolerance: number
): TrackProjectionHit | null {
  let best: TrackProjectionHit | null = null;

  for (const track of Object.values(state.tracks)) {
    if (track.nodes.length < 2) continue;
    if (track.type === 'curve') continue;

    const startNodeId = track.nodes[0];
    const endNodeId = track.nodes[track.nodes.length - 1];
    const startNode = state.nodes[startNodeId];
    const endNode = state.nodes[endNodeId];
    if (!startNode || !endNode) continue;

    const projection = projectPointToSegment(target, startNode.position, endNode.position);
    if (projection.distance > tolerance) continue;

    // Avoid snapping to segment endpoints here; node snapping is handled first.
    if (projection.t <= 0.08 || projection.t >= 0.92) continue;

    if (!best || projection.distance < best.distance) {
      best = {
        trackId: track.id,
        startNodeId,
        endNodeId,
        projectedPos: projection.projectedPos,
        t: projection.t,
        distance: projection.distance
      };
    }
  }

  return best;
}

function estimateQuadraticLength(start: Position, control: Position, end: Position): number {
  const steps = 16;
  let length = 0;
  let prev = start;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const current = {
      x: inv * inv * start.x + 2 * inv * t * control.x + t * t * end.x,
      y: inv * inv * start.y + 2 * inv * t * control.y + t * t * end.y
    };
    length += distance(prev, current);
    prev = current;
  }

  return length;
}

function buildCurveControlPoint(start: Position, end: Position): Position {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const normalX = -dy / len;
  const normalY = dx / len;
  const offset = Math.min(42, len * 0.35);

  return {
    x: midX + normalX * offset,
    y: midY + normalY * offset
  };
}

function countConnectedTracks(state: NetworkState, nodeId: string): number {
  return Object.values(state.tracks).filter((track) => track.nodes.includes(nodeId)).length;
}

function updateJunctionForNode(state: NetworkState, nodeId: string): void {
  const connectedTracks = Object.values(state.tracks)
    .filter((track) => track.nodes.includes(nodeId))
    .map((track) => track.id);

  if (connectedTracks.length >= 3) {
    const existing = state.junctions[nodeId];
    const existingActiveTrack = existing?.activeTrackId;
    const activeTrackId = existingActiveTrack && connectedTracks.includes(existingActiveTrack)
      ? existingActiveTrack
      : connectedTracks[0] ?? null;

    state.junctions[nodeId] = {
      nodeId,
      connectedTracks,
      activeTrackId
    } satisfies Junction;
    return;
  }

  delete state.junctions[nodeId];
}

function splitTrackAtProjection(state: NetworkState, hit: TrackProjectionHit, affectedNodeIds: Set<string>): string {
  const oldTrack = state.tracks[hit.trackId];
  if (!oldTrack) {
    return '';
  }

  const splitNodeId = `n_${generateId()}`;
  state.nodes[splitNodeId] = {
    id: splitNodeId,
    position: hit.projectedPos
  };

  const startNode = state.nodes[hit.startNodeId];
  const endNode = state.nodes[hit.endNodeId];
  if (!startNode || !endNode) {
    return splitNodeId;
  }

  const length1 = distance(startNode.position, hit.projectedPos);
  const length2 = distance(hit.projectedPos, endNode.position);

  const track1Id = `t_${generateId()}`;
  const track2Id = `t_${generateId()}`;

  state.tracks[track1Id] = {
    id: track1Id,
    type: 'straight',
    nodes: [hit.startNodeId, splitNodeId],
    length: length1,
    maxSpeed: oldTrack.maxSpeed
  };

  state.tracks[track2Id] = {
    id: track2Id,
    type: 'straight',
    nodes: [splitNodeId, hit.endNodeId],
    length: length2,
    maxSpeed: oldTrack.maxSpeed
  };

  for (const signal of Object.values(state.signals)) {
    if (signal.trackId !== hit.trackId) continue;

    if (signal.distanceFromStart <= length1) {
      signal.trackId = track1Id;
    } else {
      signal.trackId = track2Id;
      signal.distanceFromStart -= length1;
    }
  }

  for (const station of Object.values(state.stations)) {
    if (!station.trackIds.includes(hit.trackId)) continue;
    station.trackIds = station.trackIds.flatMap((id) => {
      if (id !== hit.trackId) return [id];
      return [track1Id, track2Id];
    });
  }

  delete state.tracks[hit.trackId];

  affectedNodeIds.add(hit.startNodeId);
  affectedNodeIds.add(hit.endNodeId);
  affectedNodeIds.add(splitNodeId);

  return splitNodeId;
}

function resolveEndpointNode(
  state: NetworkState,
  targetPos: Position,
  tolerance: number,
  affectedNodeIds: Set<string>
): string {
  const nearestNodeId = findNearestNodeId(state.nodes, targetPos, tolerance);
  if (nearestNodeId) {
    return nearestNodeId;
  }

  const projectionHit = findNearestTrackProjection(state, targetPos, tolerance);
  if (projectionHit) {
    const splitNodeId = splitTrackAtProjection(state, projectionHit, affectedNodeIds);
    if (splitNodeId) return splitNodeId;
  }

  const newNodeId = `n_${generateId()}`;
  state.nodes[newNodeId] = {
    id: newNodeId,
    position: targetPos
  };
  affectedNodeIds.add(newNodeId);
  return newNodeId;
}

function hasTrackBetweenNodes(
  tracks: Record<string, TrackSegment>,
  nodeA: string,
  nodeB: string
): boolean {
  return Object.values(tracks).some((track) => {
    if (track.nodes.length < 2) return false;
    const start = track.nodes[0];
    const end = track.nodes[track.nodes.length - 1];
    return (start === nodeA && end === nodeB) || (start === nodeB && end === nodeA);
  });
}

export const placeTrackCommand: Command<PlaceTrackArgs> = (ctx, args) => {
  // 1. Validation: Are positions distinct?
  if (args.startPos.x === args.endPos.x && args.startPos.y === args.endPos.y) {
    return { success: false, error: 'Start and end positions must be different' };
  }

  const tolerance = args.connectTolerance ?? 16;
  const affectedNodeIds = new Set<string>();

  // 2. Execution
  const node1Id = resolveEndpointNode(ctx.state, args.startPos, tolerance, affectedNodeIds);
  const node2Id = resolveEndpointNode(ctx.state, args.endPos, tolerance, affectedNodeIds);

  if (node1Id === node2Id) {
    return { success: false, error: 'Track endpoints collapse into one node' };
  }

  if (hasTrackBetweenNodes(ctx.state.tracks, node1Id, node2Id)) {
    return { success: false, error: 'Track already exists between these nodes' };
  }

  // Calculate length
  const node1 = ctx.state.nodes[node1Id];
  const node2 = ctx.state.nodes[node2Id];

  let finalTrackType: TrackType = args.trackType ?? 'straight';
  if (finalTrackType !== 'curve') {
    const degreeA = countConnectedTracks(ctx.state, node1Id) + 1;
    const degreeB = countConnectedTracks(ctx.state, node2Id) + 1;
    finalTrackType = args.trackType === 'switch' || degreeA >= 3 || degreeB >= 3 ? 'switch' : 'straight';
  }

  const controlPoint = finalTrackType === 'curve'
    ? buildCurveControlPoint(node1.position, node2.position)
    : undefined;

  const length = controlPoint
    ? estimateQuadraticLength(node1.position, controlPoint, node2.position)
    : distance(node1.position, node2.position);

  const trackId = `t_${generateId()}`;
  const track: TrackSegment = {
    id: trackId,
    type: finalTrackType,
    nodes: [node1Id, node2Id],
    controlPoint,
    length,
    maxSpeed: 100 // default max speed
  };

  // 3. Mutate State
  ctx.state.tracks[trackId] = track;
  affectedNodeIds.add(node1Id);
  affectedNodeIds.add(node2Id);

  for (const nodeId of affectedNodeIds) {
    updateJunctionForNode(ctx.state, nodeId);
  }

  // 4. Automatische Block-Rekonstruktion
  recalculateAllBlocks(ctx.state);

  return { success: true };
};
