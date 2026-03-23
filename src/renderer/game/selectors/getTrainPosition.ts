import type { NetworkState, TrainId, Position } from '../model/network';

/**
 * Given the pure network state, derive the continuous [x, y] coordinates of a train.
 */
export function getTrainPosition(state: NetworkState, trainId: TrainId): Position | null {
  const train = state.trains[trainId];
  if (!train) return null;

  const track = state.tracks[train.trackId];
  if (!track) return null;

  const nodeA = state.nodes[track.nodes[0]];
  const nodeB = state.nodes[track.nodes[track.nodes.length - 1]];

  // Linear interpolation for a straight track
  // For curves, this would need bezier calculations based on the track type
  const t = Math.max(0, Math.min(1, train.distanceOnTrack / track.length));
  
  return {
    x: nodeA.position.x + (nodeB.position.x - nodeA.position.x) * t,
    y: nodeA.position.y + (nodeB.position.y - nodeA.position.y) * t,
  };
}
