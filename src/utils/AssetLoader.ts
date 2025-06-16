import * as THREE from 'three';
import { AssetConfig, AssetType, RideConfig } from '../types';
import EventManager from './EventManager';

export interface LoadableAsset {
  id: string;
  type: 'texture' | 'model' | 'audio';
  url: string;
}

export class AssetLoader {
  private eventManager: EventManager;
  private loadedAssets: Map<string, any> = new Map();
  private textureLoader: THREE.TextureLoader;
  private assetConfigs: AssetConfig[] = [];

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.textureLoader = new THREE.TextureLoader();
  }

  public createDefaultAssets(): void {
    // Create procedural textures
    this.createGrassTexture();
    this.createPathTexture();
    this.createWaterTexture();
    this.createConcreteTexture();
    this.createMetalTexture();
    
    console.log('Default procedural assets created');

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

  private createGrassTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create grass texture with noise
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const noise = Math.random() * 0.3;
        const green = Math.floor(60 + noise * 40);
        const red = Math.floor(20 + noise * 20);
        const blue = Math.floor(10 + noise * 15);
        
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    this.loadedAssets.set('grass-texture', texture);
  }

  private createPathTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create stone path texture
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stone pattern
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 8 + 2;
      
      ctx.fillStyle = `rgb(${120 + Math.random() * 40}, ${100 + Math.random() * 30}, ${70 + Math.random() * 20})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.loadedAssets.set('path-texture', texture);
  }

  private createWaterTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create water texture with wave pattern
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const wave = Math.sin(x * 0.05) * Math.sin(y * 0.05) * 20;
        const blue = Math.floor(100 + wave);
        const green = Math.floor(150 + wave * 0.5);
        
        ctx.fillStyle = `rgb(20, ${green}, ${blue})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.loadedAssets.set('water-texture', texture);
  }

  private createConcreteTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create concrete texture
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise and cracks
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const shade = Math.random() * 60 + 160;
      
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x, y, 1, 1);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.loadedAssets.set('concrete-texture', texture);
  }

  private createMetalTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create brushed metal texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#888888');
    gradient.addColorStop(0.5, '#BBBBBB');
    gradient.addColorStop(1, '#888888');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add vertical brush lines
    for (let x = 0; x < canvas.width; x += 2) {
      const alpha = Math.random() * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, 0, 1, canvas.height);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    this.loadedAssets.set('metal-texture', texture);
  }

  public async loadAssets(assets: LoadableAsset[]): Promise<void> {
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
              this.loadedAssets.set(config.id, texture);
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
            this.loadedAssets.set(config.id, model);
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

  public getAsset(id: string): any {
    return this.loadedAssets.get(id);
  }

  public hasAsset(id: string): boolean {
    return this.loadedAssets.has(id);
  }

  public getAssetConfigs(): AssetConfig[] {
    return this.assetConfigs;
  }

  public getAssetCount(): number {
    return this.loadedAssets.size;
  }
}