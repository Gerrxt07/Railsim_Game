import type { NetworkState, Block } from '../model/network';
import { generateId } from '../utils/id';

/**
 * Parst das gesamte Netzwerk und rekonstruiert alle Blockabschnitte basierend 
 * auf Tracks und Signalen. Signale fungieren als logische Trenner (Blockgrenzen),
 * während zusammenhängende Gleise ohne Signale dazwischen zu einem Block verschmelzen.
 */
export function recalculateAllBlocks(state: NetworkState) {
  interface SubTrack {
    id: string;
    trackId: string;
    start: number;
    end: number;
    connectedNodes: string[]; // Knoten, an denen dieser SubTrack keine Signalgrenze hat
  }

  const subTracks: SubTrack[] = [];

  // Schritt 1: Gleise an Signalen in "SubTracks" aufsplitten
  for (const track of Object.values(state.tracks)) {
    // Alle Signale auf dieser Trasse aufsteigend nach Distanz sortieren
    const signals = Object.values(state.signals)
      .filter(s => s.trackId === track.id)
      .sort((a, b) => a.distanceFromStart - b.distanceFromStart);

    let currentDist = 0;
    
    // SubTracks vor oder zwischen Signalen bauen
    for (const sig of signals) {
      if (sig.distanceFromStart > currentDist) {
        subTracks.push({
          id: generateId(),
          trackId: track.id,
          start: currentDist,
          end: sig.distanceFromStart,
          // Nur das allererste Teilstück verbindet sich mit dem Startknoten
          connectedNodes: currentDist === 0 ? [track.nodes[0]] : []
        });
      }
      currentDist = sig.distanceFromStart;
    }

    // Restliches Stück nach dem letzten Signal bis zum Ende des Gleises
    if (currentDist < track.length || signals.length === 0) {
      subTracks.push({
        id: generateId(),
        trackId: track.id,
        start: currentDist,
        end: track.length,
        // Wenn currentDist === 0, ist gar kein Signal auf der Strecke -> Verbindet alle Knoten
        // Ansonsten ist es das letzte Stück, es verbindet sich mit allen verbleibenden Abzweigungen (Switch)
        connectedNodes: currentDist === 0 ? [...track.nodes] : track.nodes.slice(1)
      });
    }
  }

  // Schritt 2: Graph-Traversal zur Findung zusammenhängender Blöcke
  // Ein Block ist eine zusammenhängende Komponente von SubTracks, die an mindestens einem Knoten verbunden sind.
  const unvisited = new Set(subTracks.map(st => st.id));
  const blocks: Record<string, Block> = {};

  while (unvisited.size > 0) {
    const startId = unvisited.values().next().value as string;
    const queue = [startId];
    
    const blockId = `blk_${generateId()}`;
    const block: Block = {
      id: blockId,
      trackSegments: [],
      occupiedBy: null
    };

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (!unvisited.has(currentId)) continue;
      unvisited.delete(currentId);

      const st = subTracks.find(s => s.id === currentId)!;
      block.trackSegments.push({
        trackId: st.trackId,
        start: st.start,
        end: st.end
      });

      // Nachbarn finden: Andere SubTracks, die noch unbesucht sind und einen verbundenen Knoten teilen
      const neighbors = subTracks.filter(other => 
        other.id !== currentId && 
        unvisited.has(other.id) &&
        st.connectedNodes.some(nodeId => other.connectedNodes.includes(nodeId))
      );

      for (const n of neighbors) {
        queue.push(n.id);
      }
    }

    blocks[blockId] = block;
  }

  // Schritt 3: Belegung (OccupiedBy) und Reservierungen bestmöglich wiederherstellen
  for (const train of Object.values(state.trains)) {
    const block = Object.values(blocks).find(b => 
      b.trackSegments.some(ts => 
        ts.trackId === train.trackId && 
        train.distanceOnTrack >= ts.start && 
        train.distanceOnTrack <= ts.end
      )
    );
    
    if (block) {
      block.occupiedBy = train.id;
    }
  }

  // Aktualisiere das State Object mit dem neu berechneten Block-Graph
  state.blocks = blocks;
}
