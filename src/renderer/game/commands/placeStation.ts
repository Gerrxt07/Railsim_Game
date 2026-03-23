import type { Command } from './types';
import type { Station } from '../model/network';
import { generateId } from '../utils/id';

export interface PlaceStationArgs {
  name: string;
  trackIds: string[];
}

export const placeStationCommand: Command<PlaceStationArgs> = (ctx, args) => {
  const { name, trackIds } = args;

  // 1. Validierung: Existieren alle referenzierten Gleise?
  for (const trackId of trackIds) {
    if (!ctx.state.tracks[trackId]) {
      return { success: false, error: `Cannot place station: Track ${trackId} does not exist.` };
    }
  }

  // 2. Erstellen
  const stationId = `st_${generateId()}`;
  const station: Station = {
    id: stationId,
    name: name || `Station ${stationId}`,
    trackIds: [...trackIds]
  };

  ctx.state.stations[stationId] = station;

  return { success: true };
};
