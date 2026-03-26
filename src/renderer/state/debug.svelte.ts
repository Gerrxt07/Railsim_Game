const savedConsoleEnabled = typeof localStorage !== 'undefined' ? localStorage.getItem('railsim-console') === 'true' : false;
const savedConsoleHotkey = typeof localStorage !== 'undefined' ? localStorage.getItem('railsim-console-hotkey') || '.' : '.';

// Zentraler Store für Debug-Overlays
export const debugStore = $state({
  showNodeIds: false,
  showEdgeIds: false,
  showTrackLengths: false,
  showMaxSpeeds: false,
  showReservedBlocks: true,
  showTrainPaths: true,
  showFpsMetrics: true,
  consoleEnabled: savedConsoleEnabled,
  consoleHotkey: savedConsoleHotkey,
  isConsoleOpen: false,
  // Hier könnten auch Entwickler-Cheats oder KI-Debug-Overlays rein
});

export const toggleConsole = () => {
  debugStore.consoleEnabled = !debugStore.consoleEnabled;
  if (!debugStore.consoleEnabled) {
    debugStore.isConsoleOpen = false;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('railsim-console', debugStore.consoleEnabled.toString());
  }
};

export const setConsoleHotkey = (key: string) => {
  debugStore.consoleHotkey = key;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('railsim-console-hotkey', key);
  }
};

export const toggleConsoleVisibility = () => {
  if (debugStore.consoleEnabled) {
    debugStore.isConsoleOpen = !debugStore.isConsoleOpen;
  }
};
