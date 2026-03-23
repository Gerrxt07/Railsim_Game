export type Node = {
    id: string;
    x: number;
    y: number;
    type: 'switch' | 'endpoint' | 'waypoint';
  };
  
  export type Edge = {
    id: string;
    startNodeId: string;
    endNodeId: string;
    // Später wichtig für Zuglogik:
    length: number; 
    maxSpeed: number;
  };
  
  export type Station = {
    id: string;
    name: string;
    edgeIds: string[]; // Gleise, an denen der Bahnsteig liegt
  };
  
  // Unser globaler Graph-State
  export const networkState = $state({
    nodes: [] as Node[],
    edges: [] as Edge[],
    stations: [] as Station[]
  });