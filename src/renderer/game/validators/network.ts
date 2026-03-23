import type { NetworkState } from '../model/network';

/**
 * Validiert die Invarianten des Netzwerks.
 * Wenn alles korrekt ist, wird ein leeres Array zurückgegeben.
 * Andernfalls ein Array mit Fehlermeldungen.
 */
export function validateNetwork(state: NetworkState): string[] {
  const errors: string[] = [];
  
  // Hashmap zur Berechnung der Knotengrade (wie viele Gleise treffen an einem Knoten zusammen)
  const nodeDegrees: Record<string, number> = {};
  
  for (const nodeId of Object.keys(state.nodes)) {
    nodeDegrees[nodeId] = 0;
  }

  // 1 & 2. Kanten-Checks: Referenzierte Nodes müssen existieren & dürfen nicht identisch sein
  for (const [trackId, track] of Object.entries(state.tracks)) {
    if (track.nodes.length < 2) {
      errors.push(`Track ${trackId} has less than 2 nodes.`);
      continue;
    }

    const startNode = track.nodes[0];
    const endNode = track.nodes[track.nodes.length - 1];

    if (startNode === endNode) {
      errors.push(`Track ${trackId} connects node ${startNode} to itself (self-loop).`);
    }

    for (const nodeId of track.nodes) {
      if (!state.nodes[nodeId]) {
        errors.push(`Track ${trackId} references non-existent node ${nodeId}.`);
      } else {
        nodeDegrees[nodeId]++;
      }
    }
  }

  // 3. Junctions/Switches dürfen maximal Grad 3 oder 4 haben, Endpunkte maximal 1
  for (const [nodeId, degree] of Object.entries(nodeDegrees)) {
    // Endpoint checks could be done if we explicitly typed nodes as 'endpoint'
    if (degree > 4) {
      errors.push(`Node ${nodeId} has a degree of ${degree}. Max allowed is 4 (e.g., crossing switch).`);
    }
  }

  // 4. Signale referenzieren korrekte Segmente
  for (const [signalId, signal] of Object.entries(state.signals)) {
    const track = state.tracks[signal.trackId];
    if (!track) {
      errors.push(`Signal ${signalId} references non-existent track ${signal.trackId}.`);
    } else if (signal.distanceFromStart < 0 || signal.distanceFromStart > track.length) {
      errors.push(`Signal ${signalId} distance (${signal.distanceFromStart}) is out of bounds for track ${signal.trackId} (length: ${track.length}).`);
    }
  }

  return errors;
}
