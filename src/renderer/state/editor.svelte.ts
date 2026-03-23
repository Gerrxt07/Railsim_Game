export type GameMode = 'BUILD' | 'DISPATCH';
export type EditorTool = 'SELECT' | 'TRACK' | 'STATION' | 'SIGNAL' | 'DELETE';

// In Svelte 5 exportieren wir einfach ein Objekt, dessen Eigenschaften reaktiv sind
export const editorState = $state({
  mode: 'BUILD' as GameMode,
  activeTool: 'SELECT' as EditorTool
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