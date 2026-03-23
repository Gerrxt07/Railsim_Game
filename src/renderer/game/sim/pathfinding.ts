import type { NetworkState, NodeId, TrackId } from '../model/network';

/**
 * Finds the shortest path between two nodes in the network
 */
export function findPath(state: NetworkState, startNode: NodeId, endNode: NodeId): TrackId[] | null {
  if (startNode === endNode) return [];

  const queue: { nodeId: NodeId; path: TrackId[] }[] = [{ nodeId: startNode, path: [] }];
  const visitedNodes = new Set<NodeId>([startNode]);

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;

    if (nodeId === endNode) {
      return path;
    }

    // Find all tracks connected to this node
    const connectedTracks = Object.values(state.tracks).filter((t) =>
      t.nodes.includes(nodeId)
    );

    for (const track of connectedTracks) {
      // Find the next node this track connects to
      const nextNodeId = track.nodes.find((n) => n !== nodeId);

      if (nextNodeId && !visitedNodes.has(nextNodeId)) {
        // If junction, verify we can traverse it
        const junction = state.junctions[nodeId];
        if (!junction || junction.activeTrackId === track.id || !junction.connectedTracks.includes(track.id)) {
           visitedNodes.add(nextNodeId);
           queue.push({ nodeId: nextNodeId, path: [...path, track.id] });
        }
      }
    }
  }

  // Return sequence of track IDs or null if no path exists
  return null;
}
