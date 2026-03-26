export type GameMode = 'BUILD' | 'DISPATCH';
export type EditorTool = 
  | 'SELECT' | 'MULTISELECT' | 'INSPECT'
  | 'TRACK' | 'STATION' | 'SIGNAL' | 'DEPOT'
  | 'DELETE' | 'MOVE' | 'SPLIT' | 'MERGE' | 'REPLACE';

export type OverlayType = 
  | 'SHOW_TRACK_ID' | 'SHOW_NODE_ID' | 'BLOCK_OVERLAY' | 'SIGNAL_INFO' | 'PATH_PREVIEW' | 'VALIDATION_OVERLAY';

// In Svelte 5 exportieren wir einfach ein Objekt, dessen Eigenschaften reaktiv sind
export const editorState = $state({
  mode: 'BUILD' as GameMode,
  activeTool: 'SELECT' as EditorTool,
  // We use an array instead of a Set because Svelte 5 deep reactivity works out of the box with arrays,
  // whereas Set mutations (add/delete) require re-assignment or explicit triggering to be reactive
  activeOverlays: [] as OverlayType[]
});

// Hilfsfunktionen machen den Code später sauberer
export const setMode = (mode: GameMode) => {
  editorState.mode = mode;
  editorState.activeTool = 'SELECT'; // Werkzeug beim Moduswechsel zurücksetzen
};

export const setTool = (tool: EditorTool) => {
  if (editorState.mode === 'BUILD') {
    editorState.activeTool = tool;
  }
};

export const toggleOverlay = (overlay: OverlayType) => {
  const index = editorState.activeOverlays.indexOf(overlay);
  if (index >= 0) {
    editorState.activeOverlays.splice(index, 1);
  } else {
    editorState.activeOverlays.push(overlay);
  }
};