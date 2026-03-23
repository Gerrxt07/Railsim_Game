import { createEmptyNetwork, type NetworkState } from '../game/model/network';
import type { Command, Result } from '../game/commands/types';

/**
 * Dies ist der reaktive Svelte-State-Container, der die UI antreibt.
 */
export const networkStore = $state<{
  current: NetworkState;
}>({
  current: createEmptyNetwork()
});

/**
 * Der zentrale Dispatcher, um von der UI-Ebene Änderungen im puren Graph-Modell
 * kontrolliert durchzuführen. 
 */
export function dispatchCommand<TArgs>(
  command: Command<TArgs>, 
  args: TArgs
): Result {
  // Leite State-Pointer an das abstrahierende Command weiter
  const ctx = {
    state: networkStore.current
  };
  
  const result = command(ctx, args);
  
  if (!result.success) {
    console.warn("Command failed: ", result.error);
  }
  
  return result;
}

export function loadNetworkState(newState: NetworkState) {
  networkStore.current = newState;
}

export function resetNetworkState() {
  networkStore.current = createEmptyNetwork();
}
