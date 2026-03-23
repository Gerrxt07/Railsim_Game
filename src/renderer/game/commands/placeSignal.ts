// Defines how state mutations should happen
import type { Command } from './types';
import type { Signal } from '../model/network';
import { generateId } from '../utils/id';
import { recalculateAllBlocks } from '../sim/blockBuilder';

export interface PlaceSignalArgs {
  trackId: string;
  distanceFromStart: number;
  direction: 'forward' | 'backward';
}

export const placeSignalCommand: Command<PlaceSignalArgs> = (ctx, args) => {
  const { trackId, distanceFromStart, direction } = args;
  const track = ctx.state.tracks[trackId];

  // 1. Validation
  if (!track) {
    return { success: false, error: 'Track not found' };
  }
  
  if (distanceFromStart < 0 || distanceFromStart > track.length) {
    return { success: false, error: 'Signal distance is outside the track segment bounds' };
  }

  // 2. Execution
  const signalId = `s_${generateId()}`;
  const signal: Signal = {
    id: signalId,
    trackId,
    distanceFromStart,
    state: 'red', // Safest default state
    direction
  };

  // 3. Mutate State
  ctx.state.signals[signalId] = signal;

  // 4. Update Blöcke (Signal teilt bestehenden Block)
  recalculateAllBlocks(ctx.state);

  return { success: true };
};
