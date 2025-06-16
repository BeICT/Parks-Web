import * as THREE from 'three';

export interface LoadableAsset {
  id: string;
  type: 'texture' | 'model' | 'audio';
  url: string;
}

export class AssetLoader {
  private loadedAssets: Map<string, any> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  public createDefaultAssets(): void {
    // Create simple colored textures as defaults
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Grass texture
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(0, 0, 64, 64);
    const grassTexture = new THREE.CanvasTexture(canvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    this.loadedAssets.set('default-grass', grassTexture);
    
    // Path texture
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, 64, 64);
    const pathTexture = new THREE.CanvasTexture(canvas);
    this.loadedAssets.set('default-path', pathTexture);
    
    console.log('Default assets created');
  }

  public async loadAssets(assets: LoadableAsset[]): Promise<void> {
    const promises = assets.map(asset => this.loadSingleAsset(asset));
    await Promise.all(promises);
  }

  private loadSingleAsset(asset: LoadableAsset): Promise<any> {
    return new Promise((resolve, reject) => {
      switch (asset.type) {
        case 'texture':
          this.loadTexture(asset, resolve, reject);
          break;
        default:
          console.warn(`Unsupported asset type: ${asset.type}`);
          resolve(null);
      }
    });
  }

  private loadTexture(asset: LoadableAsset, resolve: Function, reject: Function): void {
    this.textureLoader.load(
      asset.url,
      (texture: THREE.Texture) => {
        this.loadedAssets.set(asset.id, texture);
        resolve(texture);
      },
      undefined,
      (error: unknown) => {
        console.warn(`Failed to load texture ${asset.id}, using fallback`);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, 64, 64);
        
        const fallbackTexture = new THREE.CanvasTexture(canvas);
        this.loadedAssets.set(asset.id, fallbackTexture);
        resolve(fallbackTexture);
      }
    );
  }

  public getAsset(id: string): any {
    return this.loadedAssets.get(id);
  }

  public hasAsset(id: string): boolean {
    return this.loadedAssets.has(id);
  }
}