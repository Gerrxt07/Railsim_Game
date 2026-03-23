import type { Command } from './types';
import type { Depot } from '../model/network';
import { generateId } from '../utils/id';

export interface PlaceDepotArgs {
  nodeId: string;
  name?: string;
}

export const placeDepotCommand: Command<PlaceDepotArgs> = (ctx, args) => {
  const { nodeId, name } = args;

  // 1. Validierung: Node muss existieren
  if (!ctx.state.nodes[nodeId]) {
    return { success: false, error: 'Cannot place depot: Node does not exist.' };
  }

  // Optional: Prüfen ob bereits ein Depot an diesem Node existiert
  const existingDepot = Object.values(ctx.state.depots).find(d => d.nodeId === nodeId);
  if (existingDepot) {
    return { success: false, error: 'A depot already exists at this node.' };
  }

  // 2. Erstellen
  const depotId = `dp_${generateId()}`;
  const depot: Depot = {
    id: depotId,
    nodeId,
    name: name || `Depot ${depotId}`
  };

  ctx.state.depots[depotId] = depot;

  return { success: true };
};
