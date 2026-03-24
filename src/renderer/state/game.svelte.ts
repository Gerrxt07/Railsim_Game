// Define the possible game states
export enum GameState {
  INITIALIZING = 'INITIALIZING',
  SPLASH = 'SPLASH',
  MAIN_MENU = 'MAIN_MENU',
  LOADING = 'LOADING',
  RUNNING = 'RUNNING'
}

// Track the current game state using a Svelte 5 rune
export const currentGameState = $state({
  value: GameState.INITIALIZING
});

const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('railsim-theme') as 'light' | 'dark' : 'light';
const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('railsim-lang') as 'en' | 'de' : 'en';
const savedPopups = typeof localStorage !== 'undefined' ? localStorage.getItem('railsim-popups') !== 'false' : true;

export const uiState = $state({
  isSettingsOpen: false,
  theme: savedTheme || 'light',
  language: savedLang || 'en',
  showSpeedPopups: savedPopups,
  hasPlayedIntro: false
});

export const simState = $state({
  speed: 0,
  previousSpeed: 1
});

export const setSimSpeed = (newSpeed: number) => {
  simState.speed = newSpeed;
};

// Helper function to change the state
export const setGameState = (newState: GameState) => {
  currentGameState.value = newState;
};

export const toggleSettings = (open?: boolean) => {
  const targetState = open !== undefined ? open : !uiState.isSettingsOpen;
  
  if (targetState !== uiState.isSettingsOpen) {
    uiState.isSettingsOpen = targetState;
    if (targetState) {
      simState.previousSpeed = simState.speed;
      simState.speed = 0;
    } else {
      simState.speed = simState.previousSpeed;
    }
  }
};

export const setTheme = (newTheme: 'light' | 'dark') => {
  uiState.theme = newTheme;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('railsim-theme', newTheme);
  }
  updateThemeClass();
};

export const setLanguage = (newLang: 'en' | 'de') => {
  uiState.language = newLang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('railsim-lang', newLang);
  }
};

export const toggleSpeedPopups = () => {
  uiState.showSpeedPopups = !uiState.showSpeedPopups;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('railsim-popups', String(uiState.showSpeedPopups));
  }
};

export const updateThemeClass = () => {
  if (typeof document !== 'undefined') {
    if (uiState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};