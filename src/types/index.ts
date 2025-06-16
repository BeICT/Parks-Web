import * as THREE from 'three';

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

// Event types (example, can be expanded)
export type GameEvent =
  | { type: 'assetLoaded'; payload: { id: string; asset: any } }
  | { type: 'allAssetsLoaded' }
  | { type: 'loadingStarted', payload: { total: number } }
  | { type: 'assetLoadFailed', payload: { id: string, error: any } }
  | { type: 'assetLoadingCompleteWithError' }
  | { type: 'startGame' }
  | { type: 'openSettings' }
  | { type: 'closeSettings' }
  | { type: 'settingsSaved', payload: any }
  | { type: 'returnToMainMenu' }
  | { type: 'buildRide', payload: { rideId: string, position: Position } }
  | { type: 'bulldoze', payload: { position: Position } }
  | { type: 'statsUpdated', payload: GameStats }
  | { type: 'showMessage', payload: { message: string, duration?: number } }
  | { type: 'start-new-game' }
  | { type: 'load-game' }
  | { type: 'settings' }
  | { type: 'game-pause', payload?: boolean }
  | { type: 'game-speed', payload: number }
  | { type: 'tool-selected', payload: BuildTool }
  | { type: 'terrain-click', payload: { position: Position; object?: any } }
  | { type: 'camera-zoom', payload: { direction: string } }
  | { type: 'camera-rotate' }
  | { type: 'open-window', payload: { type: string } }
  | { type: 'close-window', payload: string }
  | { type: 'game-date-changed', payload: string }
  | { type: 'gameStateChanged', payload: GameStateInfo }
  | { type: 'toolChanged', payload: BuildTool }
  | { type: 'toggle-map' };

export type EventCallback = (data?: any) => void;

export enum AssetType {
  MODEL = 'model',
  TEXTURE = 'texture',
  SOUND = 'sound',
  // Add other types as needed
}

export interface AssetConfig {
  id: string;
  path: string;
  type: AssetType;
  rideDetails?: RideConfig; // Optional: If this asset is a ride, include its config
}

export interface LoadableAsset {
  id: string;
  type: 'texture' | 'model' | 'audio';
  url: string;
}

export interface GameStateInfo {
  isPaused: boolean;
  gameSpeed: number;
  currentTool: BuildTool;
  currentDate: Date;
}