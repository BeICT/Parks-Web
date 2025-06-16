import * as THREE from 'three';
import { Scene } from './Scene';
import { Camera } from './Camera';
import { AssetLoader } from '../utils/AssetLoader';
import { EventManager } from '../utils/EventManager';
import { Park } from '../entities/Park';
import { GameStats } from '../types';

export class Engine {
  private scene: Scene;
  private camera: Camera;
  private renderer: THREE.WebGLRenderer;
  private assetLoader: AssetLoader;
  private eventManager: EventManager;
  private park: Park;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private isPaused: boolean = false;
  private keys: { [key: string]: boolean } = {};

  constructor(canvas: HTMLCanvasElement, assetLoader: AssetLoader, eventManager: EventManager) {
    this.assetLoader = assetLoader;
    this.eventManager = eventManager;
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x87CEEB, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize camera
    this.camera = new Camera(canvas.parentElement || document.body);

    // Initialize scene
    this.scene = new Scene(this.assetLoader);

    // Initialize park
    this.park = new Park();

    // Setup controls
    this.setupControls();
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize scene
      await this.scene.initialize();
      
      // Setup camera controls
      this.camera.setupMovementControls(this.keys);
      
      // Start render loop
      this.start();
      
      console.log('Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize engine:', error);
      throw error;
    }
  }

  private setupControls(): void {
    // Keyboard event listeners
    window.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    // Mouse event listeners for interaction
    this.renderer.domElement.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    // Prevent context menu on right click
    this.renderer.domElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  private handleClick(event: MouseEvent): void {
    // Basic click handling - could be expanded for building placement
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera.getCamera());

    // Check for intersections with scene objects
    const intersects = raycaster.intersectObjects(this.scene.getScene().children, true);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      console.log('Clicked on:', intersection.object.name || 'unnamed object');
      console.log('Position:', intersection.point);
      
      // Emit click event for other systems to handle
      this.eventManager.emit('terrain-click', {
        position: intersection.point,
        object: intersection.object
      });
    }
  }

  public start(): void {
    if (this.animationId !== null) return;
    
    this.lastTime = performance.now();
    this.animate();
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    console.log(this.isPaused ? 'Game paused' : 'Game resumed');
  }

  public handleResize(): void {
    const canvas = this.renderer.domElement;
    const container = canvas.parentElement;
    
    if (container) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      this.renderer.setSize(width, height);
      this.camera.handleResize();
      
      console.log(`Resized to ${width}x${height}`);
    }
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(deltaTime);
    }

    this.render();
  }

  private update(deltaTime: number): void {
    // Update camera
    this.camera.update(deltaTime);

    // Update park simulation
    this.park.update(deltaTime);

    // Update scene
    this.scene.update(deltaTime);

    // Emit stats update every second (approximately)
    if (Math.floor(this.lastTime / 1000) !== Math.floor((this.lastTime - deltaTime * 1000) / 1000)) {
      this.emitStatsUpdate();
    }
  }

  private render(): void {
    this.renderer.render(this.scene.getScene(), this.camera.getCamera());
  }

  private emitStatsUpdate(): void {
    const stats: GameStats = {
      money: this.park.stats.money,
      visitors: this.park.stats.visitors,
      happiness: this.park.stats.happiness,
      reputation: this.park.stats.reputation
    };

    this.eventManager.emit('statsUpdated', stats);
  }

  public setPark(park: Park): void {
    this.park = park;
  }

  public getPark(): Park {
    return this.park;
  }

  public getScene(): Scene {
    return this.scene;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getCamera(): Camera {
    return this.camera;
  }

  public dispose(): void {
    // Stop animation loop
    this.stop();

    // Dispose of Three.js resources
    this.scene.dispose();
    this.renderer.dispose();

    // Clear event listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    console.log('Engine disposed');
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys[event.code] = true;
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys[event.code] = false;
  };
}