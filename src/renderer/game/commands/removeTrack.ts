import type { Command } from './types';
import { recalculateAllBlocks } from '../sim/blockBuilder';

export interface RemoveTrackArgs {
  trackId: string;
}

export const removeTrackCommand: Command<RemoveTrackArgs> = (ctx, args) => {
  const { trackId } = args;
  const track = ctx.state.tracks[trackId];

  if (!track) {
    return { success: false, error: 'Track not found' };
  }

  // 1. Validierung: Sind Züge auf diesem Gleis?
  // Wenn ja, dürfen wir das Gleis (vorerst) nicht löschen.
  for (const train of Object.values(ctx.state.trains)) {
    if (train.trackId === trackId) {
      return { success: false, error: 'Cannot remove track: A train is currently on it.' };
    }
  }

  // 2. Cleanup: Signale auf diesem Gleis löschen
  for (const [signalId, signal] of Object.entries(ctx.state.signals)) {
    if (signal.trackId === trackId) {
      delete ctx.state.signals[signalId];
    }
  }

  // 3. Cleanup: Stationen anpassen (Gleisreferenz entfernen)
  for (const station of Object.values(ctx.state.stations)) {
    station.trackIds = station.trackIds.filter(id => id !== trackId);
  }

  // TODO: Evtl Junctions updaten, wenn ein Knoten nun keine Abzweigung mehr ist
  
  // 4. Track löschen
  delete ctx.state.tracks[trackId];

  // 5. Cleanup: Nodes löschen, falls sie nun "orphaned" (verwaist) sind
  // Ein Knoten ist verwaist, wenn kein anderes Gleis ihn referenziert und kein Depot an ihm ist
  for (const nodeId of track.nodes) {
    const isReferencedByOtherTrack = Object.values(ctx.state.tracks).some(t => t.nodes.includes(nodeId));
    const hasDepot = Object.values(ctx.state.depots).some(d => d.nodeId === nodeId);
    
    if (!isReferencedByOtherTrack && !hasDepot) {
      delete ctx.state.nodes[nodeId];
    }
  }

  // 6. Blöcke updaten
  recalculateAllBlocks(ctx.state);

  return { success: true };
};
