import type { NetworkState } from '../model/network';

// Core simulation parameters
export const TICK_RATE = 20; // 20 Ticks / Sekunde für physikalische Logik ist oft ausreichend
export const MS_PER_TICK = 1000 / TICK_RATE;

// Trennung von Realzeit und Simulationszeit!
export interface SimEngineState {
  currentTick: number;       // Diskreter Ticker der Engine. Läuft nicht weiter, wenn paused.
  timeScale: number;         // 0 = Pause, 1 = Realzeit, 2 = 2x Vorspulen etc.
  accumulatedMs: number;     // Speicher für verbleibende Millisekunden aus dem Main-Loop
}

export function createSimState(): SimEngineState {
  return {
    currentTick: 0,
    timeScale: 1.0,
    accumulatedMs: 0,
  };
}

/**
 * Der Engine-Update-Loop, der z.B. aus der requestAnimationFrame/PIXI-Ticker 
 * pro Frame mit Delta-Time (realWelt Millisekunden seit letztem Frame) aufgerufen wird.
 */
export function processEngineUpdate(state: NetworkState, simState: SimEngineState, deltaMs: number): void {
  if (simState.timeScale <= 0) return; // Pausiert

  // 1. Skaliere die reale Zeit auf Simulationszeit
  const scaledDeltaMs = deltaMs * simState.timeScale;
  
  // 2. Füge die verstrichene Zeit dem Accumulator hinzu
  simState.accumulatedMs += scaledDeltaMs;

  // 3. Führe so viele Ticks aus, wie in die vergangene Zeit passen.
  // Das fängt z.B. Lags ab oder verarbeitet "Fast Forward" deterministisch.
  while (simState.accumulatedMs >= MS_PER_TICK) {
    tick(state, simState);
    simState.accumulatedMs -= MS_PER_TICK;
    simState.currentTick++;
  }
}

/**
 * The pure deterministic tick function.
 * It takes the current network state, applies exactly ONE tick of physics/logic, 
 * and mutates the current state predictably.
 */
export function tick(state: NetworkState, simState: SimEngineState): void {
  // TODO: Hier kommen als nächstes rein:
  // 1. Zuggeschwindigkeiten und Position updaten (v = a*t)
  // 2. Blockbelegung prüfen / Signale updaten
  // 3. Wenn Züge vor rotem Signal -> bremsen
}

