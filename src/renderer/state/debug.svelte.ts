// Zentraler Store für Debug-Overlays
export const debugStore = $state({
  showNodeIds: false,
  showEdgeIds: false,
  showTrackLengths: false,
  showMaxSpeeds: false,
  showReservedBlocks: true,
  showTrainPaths: true,
  showFpsMetrics: true,
  // Hier könnten auch Entwickler-Cheats oder KI-Debug-Overlays rein
});
