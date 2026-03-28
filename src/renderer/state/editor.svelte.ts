export type GameMode = 'BUILD' | 'DISPATCH';
export type EditorTool = 
  | 'SELECT' | 'MULTISELECT' | 'INSPECT'
  | 'TRACK_STRAIGHT' | 'TRACK_CURVE' | 'TRACK_SWITCH' | 'STATION' | 'SIGNAL' | 'DEPOT'
  | 'DELETE' | 'MOVE' | 'SPLIT' | 'MERGE' | 'REPLACE';

export type OverlayType = 
  | 'SHOW_TRACK_ID' | 'SHOW_NODE_ID' | 'BLOCK_OVERLAY' | 'SIGNAL_INFO' | 'PATH_PREVIEW' | 'VALIDATION_OVERLAY';

import type { Position } from '../game/model/network';

export interface TrackPlacementDraft {
  isActive: boolean;
  startPos: Position | null;
  currentPos: Position | null;
}

export function isTrackTool(tool: EditorTool): boolean {
  return tool === 'TRACK_STRAIGHT' || tool === 'TRACK_CURVE' || tool === 'TRACK_SWITCH';
}

// In Svelte 5 exportieren wir einfach ein Objekt, dessen Eigenschaften reaktiv sind
export const editorState = $state({
  mode: 'BUILD' as GameMode,
  activeTool: 'SELECT' as EditorTool,
  // We use an array instead of a Set because Svelte 5 deep reactivity works out of the box with arrays,
  // whereas Set mutations (add/delete) require re-assignment or explicit triggering to be reactive
  activeOverlays: [] as OverlayType[],
  trackPlacement: {
    isActive: false,
    startPos: null,
    currentPos: null
  } as TrackPlacementDraft
});

// Hilfsfunktionen machen den Code später sauberer
export const setMode = (mode: GameMode) => {
  editorState.mode = mode;
  editorState.activeTool = 'SELECT'; // Werkzeug beim Moduswechsel zurücksetzen
  cancelTrackPlacement();
};

export const setTool = (tool: EditorTool) => {
  if (editorState.mode === 'BUILD') {
    editorState.activeTool = tool;
    if (!isTrackTool(tool)) {
      cancelTrackPlacement();
    }
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

export const startTrackPlacement = (startPos: Position) => {
  editorState.trackPlacement.isActive = true;
  editorState.trackPlacement.startPos = startPos;
  editorState.trackPlacement.currentPos = startPos;
};

export const updateTrackPlacement = (currentPos: Position) => {
  if (!editorState.trackPlacement.isActive) return;
  editorState.trackPlacement.currentPos = currentPos;
};

export const cancelTrackPlacement = () => {
  editorState.trackPlacement.isActive = false;
  editorState.trackPlacement.startPos = null;
  editorState.trackPlacement.currentPos = null;
};

export const commitTrackPlacement = (): { startPos: Position; endPos: Position } | null => {
  if (!editorState.trackPlacement.isActive || !editorState.trackPlacement.startPos || !editorState.trackPlacement.currentPos) {
    cancelTrackPlacement();
    return null;
  }

  const { startPos, currentPos } = editorState.trackPlacement;
  cancelTrackPlacement();

  if (startPos.x === currentPos.x && startPos.y === currentPos.y) {
    return null;
  }

  return {
    startPos,
    endPos: currentPos
  };
};