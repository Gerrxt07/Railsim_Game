// Defines how state mutations should happen
import type { NetworkState } from '../model/network';

export interface CommandContext {
  state: NetworkState;
  // Could include a validation service, pathfinding cache warning system, etc.
}

export interface Result {
  success: boolean;
  error?: string;
}

export type Command<TArgs> = (context: CommandContext, args: TArgs) => Result;
