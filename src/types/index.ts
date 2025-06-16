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

export interface RideCost {
  money: number;
  maintenance: number; // Per minute or per tick, define consistently
}

export interface RideStats {
  excitement: number;
  intensity: number;
  nausea: number;
}

export interface RideConfig {
  id: string;
  name: string;
  assetId: string; // ID of the 3D model/asset to use
  cost: RideCost;
  stats: RideStats;
  capacity?: number; // Optional: Max number of visitors per ride cycle
  ticketPrice?: number; // Optional: Cost for a visitor to use the ride
  // footprint: { width: number; depth: number }; // For placement logic
  // entryPoint: Position; // Relative to ride origin
  // exitPoint: Position; // Relative to ride origin
}

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

export interface VisitorNeeds {
  hunger: number;
  thirst: number;
  energy: number;
  bathroom: number;
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
  | { type: 'showMessage', payload: { message: string, duration?: number } };

export type EventCallback = (data?: any) => void;