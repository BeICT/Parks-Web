import * as THREE from 'three';
import { Scene } from './Scene';
import { Camera } from './Camera';
import { Park } from '@/entities/Park';
import { Ride } from '@/entities/Ride';
import { GameState, BuildTool, Position } from '@/types';
import { EventManager } from '@/utils/EventManager';

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private scene: Scene;
  private camera: Camera;
  private park: Park;
  private gameState: GameState = GameState.MENU;
  private currentTool: BuildTool = BuildTool.NONE;
  private eventManager: EventManager;
  private lastTime: number = 0;
  private gameSpeed: number = 1;

  constructor(container: HTMLElement) {
    this.eventManager = new EventManager();
    this.setupRenderer(container);
    this.scene = new Scene();
    this.camera = new Camera(container);
    this.park = new Park();
    
    this.setupEventListeners();
    this.setupControls();
  }

  private setupRenderer(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x87CEEB); // Sky blue
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.handleResize();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private setupEventListeners(): void {
    // Mouse click handling for building
    this.renderer.domElement.addEventListener('click', (event) => {
      if (this.gameState !== GameState.PLAYING) return;
      
      const position = this.getWorldPositionFromMouse(event);
      this.handleBuildAction(position);
    });

    // Tool selection
    this.eventManager.on('tool-selected', (tool: BuildTool) => {
      this.currentTool = tool;
      this.updateCursor();
    });

    // Game state changes
    this.eventManager.on('game-state-change', (state: GameState) => {
      this.gameState = state;
    });
  }

  private setupControls(): void {
    // Add WASD camera movement
    const keys: { [key: string]: boolean } = {};
    
    window.addEventListener('keydown', (event) => {
      keys[event.code] = true;
    });
    
    window.addEventListener('keyup', (event) => {
      keys[event.code] = false;
    });

    // Camera movement update (called in game loop)
    this.camera.setupMovementControls(keys);
  }

  private getWorldPositionFromMouse(event: MouseEvent): Position {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera.getCamera());

    // Intersect with ground plane
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersection);

    return {
      x: Math.round(intersection.x),
      y: 0,
      z: Math.round(intersection.z)
    };
  }

  private handleBuildAction(position: Position): void {
    if (!this.park.canBuildAt(position)) {
      this.showMessage('Cannot build here!');
      return;
    }

    switch (this.currentTool) {
      case BuildTool.RIDE:
        this.buildRide(position);
        break;
      case BuildTool.SHOP:
        this.buildShop(position);
        break;
      case BuildTool.PATH:
        this.buildPath(position);
        break;
      case BuildTool.DECORATION:
        this.buildDecoration(position);
        break;
      case BuildTool.DELETE:
        this.deleteBuilding(position);
        break;
    }
  }

  private buildRide(position: Position): void {
    const rideId = `ride_${Date.now()}`;
    const ride = Ride.createRollerCoaster(rideId, position);
    
    if (this.park.addRide(ride)) {
      this.scene.addRide(ride);
      this.showMessage(`Built ${ride.name} for $${ride.cost.money}`);
      this.updateUI();
    } else {
      this.showMessage('Not enough money!');
    }
  }

  private buildShop(position: Position): void {
    // Simplified shop building
    this.showMessage('Shop building not implemented yet');
  }

  private buildPath(position: Position): void {
    // Simplified path building
    this.scene.addPath(position);
    this.showMessage('Path built');
  }

  private buildDecoration(position: Position): void {
    this.scene.addDecoration(position);
    this.showMessage('Decoration added');
  }

  private deleteBuilding(position: Position): void {
    const ride = this.park.getRideAt(position);
    if (ride) {
      this.park.removeRide(ride.id);
      this.scene.removeRide(ride.id);
      this.showMessage(`Removed ${ride.name}`);
      this.updateUI();
    }
  }

  private updateCursor(): void {
    const canvas = this.renderer.domElement;
    switch (this.currentTool) {
      case BuildTool.DELETE:
        canvas.style.cursor = 'crosshair';
        break;
      case BuildTool.NONE:
        canvas.style.cursor = 'default';
        break;
      default:
        canvas.style.cursor = 'copy';
        break;
    }
  }

  private showMessage(text: string): void {
    // Simple message system (you could make this more sophisticated)
    console.log(text);
  }

  private updateUI(): void {
    this.eventManager.emit('stats-updated', this.park.stats);
  }

  public start(): void {
    this.gameState = GameState.PLAYING;
    this.scene.initialize();
    this.gameLoop();
  }

  public pause(): void {
    this.gameState = this.gameState === GameState.PAUSED ? GameState.PLAYING : GameState.PAUSED;
  }

  private gameLoop = (currentTime: number = 0): void => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.gameState === GameState.PLAYING) {
      // Update game logic
      this.park.update(deltaTime * this.gameSpeed);
      this.scene.update(deltaTime);
      this.camera.update(deltaTime);
      
      // Update UI periodically
      if (Math.floor(currentTime / 1000) % 2 === 0) {
        this.updateUI();
      }
    }

    // Render
    this.renderer.render(this.scene.getScene(), this.camera.getCamera());
    
    requestAnimationFrame(this.gameLoop);
  };

  public getPark(): Park {
    return this.park;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }

  public dispose(): void {
    this.renderer.dispose();
    this.scene.dispose();
  }
}