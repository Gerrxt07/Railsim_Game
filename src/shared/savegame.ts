// src/shared/savegame.ts
import type { NetworkState } from '../renderer/game/model/network';
import type { SimState } from '../renderer/game/sim/tick';

// Eine versionierte Metadaten-Struktur
export interface SaveGameMeta {
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Version 1 des Savegames
export interface SaveGameV1 {
  version: 1;
  meta: SaveGameMeta;
  network: NetworkState;
  simulation: SimState;
  // Später: economy, settings, player, ...
}

export type SaveGame = SaveGameV1; // Hier können später per Union Type V2, V3 etc. angehängt werden

// Hilfsfunktion für Migrationen (aktuell noch pass-through)
export function migrateToLatest(savegame: any): SaveGame {
  if (savegame.version === 1) {
    return savegame as SaveGameV1;
  }
  
  throw new Error(`Unsupported savegame version: ${savegame.version}`);
}

export function createNewSavegame(network: NetworkState, simulation: SimState): SaveGame {
  return {
    version: 1,
    meta: {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    network,
    simulation
  };
}
