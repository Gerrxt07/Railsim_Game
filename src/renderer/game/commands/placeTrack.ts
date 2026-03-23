import type { Command } from './types';
import type { Position, Node, TrackSegment } from '../model/network';
import { generateId } from '../utils/id';
import { recalculateAllBlocks } from '../sim/blockBuilder';

export interface PlaceTrackArgs {
  startPos: Position;
  endPos: Position;
}

export const placeTrackCommand: Command<PlaceTrackArgs> = (ctx, args) => {
  // 1. Validation: Are positions distinct?
  if (args.startPos.x === args.endPos.x && args.startPos.y === args.endPos.y) {
    return { success: false, error: 'Start and end positions must be different' };
  }

  // 2. Execution
  const node1Id = `n_${generateId()}`;
  const node2Id = `n_${generateId()}`;
  
  const node1: Node = { id: node1Id, position: args.startPos };
  const node2: Node = { id: node2Id, position: args.endPos };

  // Calculate length
  const dx = args.endPos.x - args.startPos.x;
  const dy = args.endPos.y - args.startPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  const trackId = `t_${generateId()}`;
  const track: TrackSegment = {
    id: trackId,
    type: 'straight',
    nodes: [node1Id, node2Id],
    length,
    maxSpeed: 100 // default max speed
  };

  // 3. Mutate State
  ctx.state.nodes[node1Id] = node1;
  ctx.state.nodes[node2Id] = node2;
  ctx.state.tracks[trackId] = track;

  // 4. Automatische Block-Rekonstruktion
  recalculateAllBlocks(ctx.state);

  return { success: true };
};
