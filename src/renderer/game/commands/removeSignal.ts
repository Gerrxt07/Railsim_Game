import type { Command } from './types';
import { recalculateAllBlocks } from '../sim/blockBuilder';

export interface RemoveSignalArgs {
  signalId: string;
}

export const removeSignalCommand: Command<RemoveSignalArgs> = (ctx, args) => {
  const { signalId } = args;

  if (!ctx.state.signals[signalId]) {
    return { success: false, error: 'Signal not found' };
  }

  delete ctx.state.signals[signalId];

  // Blöcke neu berechnen (das Löschen des Signals lässt zwei Blöcke verschmelzen)
  recalculateAllBlocks(ctx.state);

  return { success: true };
};
