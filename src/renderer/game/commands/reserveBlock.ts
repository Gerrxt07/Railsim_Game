import type { Command } from './types';

export interface ReserveBlockArgs {
  blockId: string;
  trainId: string;
}

export const reserveBlockCommand: Command<ReserveBlockArgs> = (ctx, args) => {
  const { blockId, trainId } = args;

  const block = ctx.state.blocks[blockId];
  if (!block) {
    return { success: false, error: 'Block not found.' };
  }

  if (block.occupiedBy && block.occupiedBy !== trainId) {
    return { success: false, error: `Block is already occupied by train ${block.occupiedBy}.` };
  }

  // Set the block reservation
  block.occupiedBy = trainId;

  // Add block to train's active reservations
  if (!ctx.state.reservations[trainId]) {
    ctx.state.reservations[trainId] = { trainId, blockIds: [] };
  }
  
  if (!ctx.state.reservations[trainId].blockIds.includes(blockId)) {
    ctx.state.reservations[trainId].blockIds.push(blockId);
  }

  return { success: true };
};
