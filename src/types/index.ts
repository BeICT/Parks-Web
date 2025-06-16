export interface ParkData {
    name: string;
    rides: RideData[];
    visitors: VisitorData[];
}

export interface RideData {
    type: string;
    capacity: number;
    status: 'operational' | 'under_maintenance' | 'closed';
}

export interface VisitorData {
    name: string;
    age: number;
    currentLocation: string;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface GameStats {
  money: number;
  visitors: number;
  happiness: number;
  reputation: number;
}

export interface BuildingCost {
  money: number;
  maintenance: number;
}

export interface RideConfig {
  id: string;
  name: string;
  type: string;
  capacity: number;
  cost: BuildingCost;
  excitement: number;
  intensity: number;
  nausea: number;
}

export interface VisitorNeed {
  hunger: number;
  thirst: number;
  toilet: number;
  fun: number;
  energy: number;
}

export enum GameState {
  MENU = 'menu',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused'
}

export enum BuildTool {
  NONE = 'none',
  RIDE = 'ride',
  SHOP = 'shop',
  PATH = 'path',
  DECORATION = 'decoration',
  DELETE = 'delete'
}

export interface GameEvent {
  type: string;
  data?: any;
}