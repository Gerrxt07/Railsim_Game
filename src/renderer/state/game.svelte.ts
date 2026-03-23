// Define the possible game states
export enum GameState {
  INITIALIZING = 'INITIALIZING',
  SPLASH = 'SPLASH',
  RUNNING = 'RUNNING'
}

// Track the current game state using a Svelte 5 rune
export const currentGameState = $state({
  value: GameState.INITIALIZING
});

// Helper function to change the state
export const setGameState = (newState: GameState) => {
  currentGameState.value = newState;
};