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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tick(state: NetworkState, _simState: SimEngineState): void {
  const deltaSecs = MS_PER_TICK / 1000;

  // 1. Züge bewegen
  for (const train of Object.values(state.trains)) {
    const track = state.tracks[train.trackId];
    if (!track) continue;

    // Finde das nächste Signal auf dem aktuellen Track in Fahrtrichtung
    const upcomingSignals = Object.values(state.signals).filter(s => 
      s.trackId === train.trackId && 
      s.direction === train.direction
    );

    let nextSignal = null;
    let distanceToSignal = Infinity;
    
    for (const signal of upcomingSignals) {
      const dist = train.direction === 'forward' 
        ? signal.distanceFromStart - train.distanceOnTrack
        : train.distanceOnTrack - signal.distanceFromStart;
        
      if (dist >= 0 && dist < distanceToSignal) {
        distanceToSignal = dist;
        nextSignal = signal;
      }
    }

    // Distanz zum Bewegen berechnen
    const distanceMoved = train.speed * deltaSecs;

    // Halte an Rotem Signal an
    if (nextSignal && nextSignal.state === 'red' && distanceToSignal <= distanceMoved + 2) {
      train.speed = 0;
      // Stopp-Position knapp vor dem Signal einrasten
      train.distanceOnTrack = train.direction === 'forward' 
        ? nextSignal.distanceFromStart - 0.1
        : nextSignal.distanceFromStart + 0.1;
    } else {
      // Normale Fahrt fortsetzen
      train.distanceOnTrack += train.direction === 'forward' ? distanceMoved : -distanceMoved;
    }

    // Bereichsgrenzen (Gleisende/-anfang) überschritten?
    if (train.distanceOnTrack > track.length || train.distanceOnTrack < 0) {
      // TODO: Übergang zum nächsten Track laut Route, momentan nur Stop am Track-Ende
      train.speed = 0;
      train.distanceOnTrack = Math.max(0, Math.min(track.length, train.distanceOnTrack));
    }
  }

  // 2. Blockbelegung (sehr naiv, basiert auf Zügen pro ID)
  // Lösche alte Occupation
  for (const block of Object.values(state.blocks)) {
    block.occupiedBy = null;
  }
  
  // Setze Occupation
  for (const train of Object.values(state.trains)) {
    for (const block of Object.values(state.blocks)) {
      const aufBlock = block.trackSegments.find(ts => ts.trackId === train.trackId && 
          train.distanceOnTrack >= ts.start && train.distanceOnTrack <= ts.end);
      if (aufBlock) {
        block.occupiedBy = train.id;
        break; // Sobald Block gefunden
      }
    }
  }

  // 3. Signale (naiv: Wenn Block davor belegt -> Red)
  // Hier werden wir später Blockbelegung in Signalzustände ummünzen
}

