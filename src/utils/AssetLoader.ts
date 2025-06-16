import * as THREE from 'three';

export interface LoadableAsset {
  id: string;
  type: 'texture' | 'model' | 'audio';
  url: string;
}

export class AssetLoader {
  private loadedAssets: Map<string, any> = new Map();
  private textureLoader: THREE.TextureLoader;
  private loadingManager: THREE.LoadingManager;

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    
    this.setupLoadingCallbacks();
  }

  private setupLoadingCallbacks(): void {
    this.loadingManager.onLoad = () => {
      console.log('All assets loaded');
    };

    this.loadingManager.onProgress = (url: string, itemsLoaded: number, itemsTotal: number) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      console.log(`Loading progress: ${progress.toFixed(1)}% (${url})`);
    };

    this.loadingManager.onError = (url: string) => {
      console.error('Failed to load asset:', url);
    };
  }

  public async loadAssets(assets: LoadableAsset[]): Promise<void> {
    const promises = assets.map(asset => this.loadAsset(asset));
    await Promise.all(promises);
  }

  private async loadAsset(asset: LoadableAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (asset.type) {
        case 'texture':
          this.loadTexture(asset, resolve, reject);
          break;
        case 'model':
          this.loadModel(asset, resolve, reject);
          break;
        case 'audio':
          this.loadAudio(asset, resolve, reject);
          break;
        default:
          reject(new Error(`Unknown asset type: ${asset.type}`));
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
        // Create a simple colored texture as fallback
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

  private loadModel(asset: LoadableAsset, resolve: Function, reject: Function): void {
    // For now, we'll create simple placeholder models
    // In a real implementation, you'd use GLTFLoader or similar
    console.log(`Model loading not implemented yet for ${asset.id}`);
    resolve(null);
  }

  private loadAudio(asset: LoadableAsset, resolve: Function, reject: Function): void {
    const audio = new Audio(asset.url);
    audio.addEventListener('canplaythrough', () => {
      this.loadedAssets.set(asset.id, audio);
      resolve(audio);
    });
    audio.addEventListener('error', () => {
      console.warn(`Failed to load audio ${asset.id}`);
      resolve(null); // Don't reject, just resolve with null
    });
  }

  public getAsset<T = any>(id: string): T | null {
    return this.loadedAssets.get(id) || null;
  }

  public hasAsset(id: string): boolean {
    return this.loadedAssets.has(id);
  }

  public createDefaultAssets(): void {
    // Create some default procedural textures
    this.createDefaultTexture('grass', '#4a7c59');
    this.createDefaultTexture('concrete', '#888888');
    this.createDefaultTexture('water', '#4a90e2');
    this.createDefaultTexture('sand', '#f4d03f');
  }

  private createDefaultTexture(id: string, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create a simple pattern
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add some noise/texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const brightness = Math.random() * 0.2 - 0.1;
      
      ctx.fillStyle = this.adjustColor(color, brightness);
      ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    this.loadedAssets.set(id, texture);
  }

  private adjustColor(color: string, adjustment: number): string {
    // Simple color adjustment function
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + adjustment * 255));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + adjustment * 255));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + adjustment * 255));
    
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }

  public dispose(): void {
    this.loadedAssets.forEach((asset, id) => {
      if (asset && typeof asset.dispose === 'function') {
        asset.dispose();
      }
    });
    this.loadedAssets.clear();
  }
}