import type { Command } from './types';

export interface RemoveDepotArgs {
  depotId: string;
}

export const removeDepotCommand: Command<RemoveDepotArgs> = (ctx, args) => {
  const { depotId } = args;

  const depot = ctx.state.depots[depotId];
  if (!depot) {
    return { success: false, error: 'Depot not found' };
  }

  // HINWEIS: Man könnte prüfen, ob noch Züge IM Depot sind. 
  // Da unsere Züge aktuell auf der Strecke spawnen (train.trackId), 
  // ist das erst relevant, wenn Züge im State auch den Ort "Im Depot X" haben können.

  delete ctx.state.depots[depotId];

  // Optional: Wenn der Node nach Löschen des Depots verwaist ist, löschen wir ihn.
  const nodeId = depot.nodeId;
  const isReferencedByOtherTrack = Object.values(ctx.state.tracks).some(t => t.nodes.includes(nodeId));
  
  if (!isReferencedByOtherTrack) {
    delete ctx.state.nodes[nodeId];
  }

  return { success: true };
};
