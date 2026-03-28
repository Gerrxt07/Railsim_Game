export type TrackId = string;
export type NodeId = string;
export type SignalId = string;
export type TrainId = string;

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: NodeId;
  position: Position;
  // A node can belong to multiple tracks, e.g., forming a junction
}

export type TrackType = 'straight' | 'curve' | 'switch';

export interface TrackSegment {
  id: TrackId;
  type: TrackType;
  nodes: NodeId[]; // Typically 2 nodes for straight/curve, 3+ for a switch
  controlPoint?: Position; // Optional control point for schematic curved rendering
  length: number;
  maxSpeed: number;
}

export interface Junction {
  nodeId: NodeId;
  connectedTracks: TrackId[];
  activeTrackId: TrackId | null; // Which way the switch is currently set
}

export interface Signal {
  id: SignalId;
  trackId: TrackId;
  distanceFromStart: number;
  state: 'red' | 'yellow' | 'green';
  direction: 'forward' | 'backward'; // Relative to track nodes array
}

export interface Block {
  id: string; // Typically between two signals
  // Tracks and their distance ranges that belong to this block
  trackSegments: { trackId: TrackId; start: number; end: number }[];
  occupiedBy: TrainId | null;
}

export interface TrainState {
  id: TrainId;
  trackId: TrackId;
  distanceOnTrack: number; // 0 to TrackSegment.length
  speed: number;
  direction: 'forward' | 'backward'; // moving from node 0 to 1, or 1 to 0
}

export interface Route {
  id: string;
  name: string;
  waypoints: NodeId[];
}

export interface TimetableEntry {
  nodeId: NodeId;
  arrivalTime: number | null; // tick time
  departureTime: number | null;
}

export interface Timetable {
  trainId: TrainId;
  entries: TimetableEntry[];
}

export interface Reservation {
  trainId: TrainId;
  blockIds: string[];
}

export interface Station {
  id: string;
  name: string;
  trackIds: TrackId[]; // Gleise, an denen ein Bahnsteig liegt
}

export interface Depot {
  id: string;
  nodeId: NodeId; // Ein Depot wird an einem offenen Node (Endpunkt) gebaut
  name: string;
}

// The core authoritative state
export interface NetworkState {
  nodes: Record<NodeId, Node>;
  tracks: Record<TrackId, TrackSegment>;
  junctions: Record<NodeId, Junction>;
  signals: Record<SignalId, Signal>;
  blocks: Record<string, Block>;
  trains: Record<TrainId, TrainState>;
  routes: Record<string, Route>;
  timetables: Record<string, Timetable>;
  reservations: Record<string, Reservation>;
  stations: Record<string, Station>;
  depots: Record<string, Depot>;
}

export function createEmptyNetwork(): NetworkState {
  return {
    nodes: {},
    tracks: {},
    junctions: {},
    signals: {},
    blocks: {},
    trains: {},
    routes: {},
    timetables: {},
    reservations: {},
    stations: {},
    depots: {},
  };
}
