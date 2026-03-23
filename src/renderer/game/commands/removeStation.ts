import type { Command } from './types';

export interface RemoveStationArgs {
  stationId: string;
}

export const removeStationCommand: Command<RemoveStationArgs> = (ctx, args) => {
  const { stationId } = args;

  if (!ctx.state.stations[stationId]) {
    return { success: false, error: 'Station not found' };
  }

  delete ctx.state.stations[stationId];

  // Züge behalten logischerweise Routen bei, aber wenn ein Zug an 'dieser Station' 
  // stoppen sollte, müsste der Fahrplan ggf. in der Zukunft als ungültig markiert werden.

  return { success: true };
};
