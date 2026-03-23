import type { Command } from './types';

export interface FreeBlockArgs {
  blockId: string;
  trainId: string; // Wird zur Validierung benötigt (Sicherheit)
}

export const freeBlockCommand: Command<FreeBlockArgs> = (ctx, args) => {
  const { blockId, trainId } = args;

  const block = ctx.state.blocks[blockId];
  if (!block) {
    return { success: false, error: 'Block not found.' };
  }

  if (block.occupiedBy !== trainId) {
    return { success: false, error: `Block is not occupied by train ${trainId}.` };
  }

  // Remove the block reservation
  block.occupiedBy = null;

  // Remove block from train's active reservations
  const res = ctx.state.reservations[trainId];
  if (res) {
    res.blockIds = res.blockIds.filter(id => id !== blockId);
  }

  return { success: true };
};
