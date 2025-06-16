import * as THREE from 'three';
import { AssetConfig, AssetType, RideConfig } from '../types';
import EventManager from './EventManager';

export class AssetLoader {
  private eventManager: EventManager;
  private textureLoader: THREE.TextureLoader;
  // In a real scenario, you'd use GLTFLoader, FBXLoader, etc.
  // For simplicity, we'll simulate model loading.
  private assets: Map<string, THREE.Texture | THREE.Object3D> = new Map();
  private assetConfigs: AssetConfig[] = [];

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.textureLoader = new THREE.TextureLoader();
  }

  public createDefaultAssets(): void {
    // Example Ride Configurations (these would typically come from a data file)
    const ferrisWheelRideConfig: RideConfig = {
      id: 'ferrisWheelRide',
      name: 'Ferris Wheel',
      assetId: 'ferrisWheelModel',
      cost: { money: 10000, maintenance: 200 },
      stats: { excitement: 60, intensity: 30, nausea: 20 },
      capacity: 20,
      ticketPrice: 8,
    };

    const rollerCoasterRideConfig: RideConfig = {
      id: 'rollerCoasterRide',
      name: 'Roller Coaster',
      assetId: 'rollerCoasterModel',
      cost: { money: 25000, maintenance: 500 },
      stats: { excitement: 90, intensity: 80, nausea: 50 },
      capacity: 16,
      ticketPrice: 15,
    };

    const carouselRideConfig: RideConfig = {
      id: 'carouselRide',
      name: 'Carousel',
      assetId: 'carouselModel',
      cost: { money: 5000, maintenance: 100 },
      stats: { excitement: 40, intensity: 10, nausea: 5 },
      capacity: 24,
      ticketPrice: 5,
    };

    this.assetConfigs = [
      { id: 'ferrisWheelModel', path: 'assets/models/ferris_wheel.glb', type: AssetType.MODEL, rideDetails: ferrisWheelRideConfig },
      { id: 'rollerCoasterModel', path: 'assets/models/roller_coaster.glb', type: AssetType.MODEL, rideDetails: rollerCoasterRideConfig },
      { id: 'carouselModel', path: 'assets/models/carousel.glb', type: AssetType.MODEL, rideDetails: carouselRideConfig },
      { id: 'grassTexture', path: 'assets/textures/grass.png', type: AssetType.TEXTURE },
      { id: 'pathTexture', path: 'assets/textures/path.png', type: AssetType.TEXTURE },
      // Add more assets here
    ];
  }

  public async loadAssets(): Promise<void> {
    const promises: Promise<void>[] = [];
    if (this.assetConfigs.length === 0) {
        console.warn("No asset configs defined. Call createDefaultAssets() first or add configs.");
        return Promise.resolve();
    }

    this.eventManager.emit('loadingStarted', { total: this.assetConfigs.length });

    for (const config of this.assetConfigs) {
      const promise = new Promise<void>((resolve, reject) => {
        if (config.type === AssetType.TEXTURE) {
          this.textureLoader.load(
            config.path,
            (texture) => {
              this.assets.set(config.id, texture);
              this.eventManager.emit('assetLoaded', { id: config.id, asset: texture });
              resolve();
            },
            undefined, // onProgress callback (optional)
            (error) => {
              console.error(`Failed to load texture ${config.id}:`, error);
              this.eventManager.emit('assetLoadFailed', { id: config.id, error });
              reject(error);
            }
          );
        } else if (config.type === AssetType.MODEL) {
          // Simulate model loading
          setTimeout(() => {
            const geometry = new THREE.BoxGeometry(5, 5, 5); // Placeholder geometry
            let material;
            // Basic color differentiation for placeholder models
            if (config.id.includes('ferrisWheel')) material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green
            else if (config.id.includes('rollerCoaster')) material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
            else if (config.id.includes('carousel')) material = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue
            else material = new THREE.MeshStandardMaterial({ color: 0xcccccc });


            const model = new THREE.Mesh(geometry, material);
            model.name = config.id; // Store id in name for easier identification
            this.assets.set(config.id, model);
            this.eventManager.emit('assetLoaded', { id: config.id, asset: model });
            resolve();
          }, Math.random() * 1000 + 500); // Simulate variable load time
        } else {
          console.warn(`Unsupported asset type for ${config.id}`);
          resolve(); // Resolve to not block other assets
        }
      });
      promises.push(promise);
    }
    
    try {
        await Promise.all(promises);
        this.eventManager.emit('allAssetsLoaded');
        console.log('All assets loaded successfully.');
    } catch (error) {
        console.error('Failed to load one or more assets:', error);
        // Optionally emit a more general failure event
        this.eventManager.emit('assetLoadingCompleteWithError');
    }
  }

  public getAsset(id: string): THREE.Texture | THREE.Object3D | undefined {
    return this.assets.get(id);
  }

  public getAssetConfigs(): AssetConfig[] {
    return this.assetConfigs;
  }

  public getAssetCount(): number {
    return this.assetConfigs.length;
  }
}