import * as THREE from 'three';
import { Scene } from './Scene';
import { Camera } from './Camera';
import { AssetLoader } from '../utils/AssetLoader';
import { EventManager } from '../utils/EventManager';
import { Park } from '../entities/Park';
import { GameStats, BuildTool } from '../types';

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
  private gameSpeed: number = 1;
  private currentTool: BuildTool = BuildTool.NONE;
  private keys: { [key: string]: boolean } = {};

  constructor(canvas: HTMLCanvasElement, assetLoader: AssetLoader, eventManager: EventManager) {
    this.assetLoader = assetLoader;
    this.eventManager = eventManager;
    
    console.log('Initializing Engine with canvas:', canvas);
    console.log('Canvas dimensions:', canvas.clientWidth, 'x', canvas.clientHeight);
    console.log('Canvas parent:', canvas.parentElement);
    
    // Ensure canvas has a minimum size
    const width = Math.max(canvas.clientWidth, 800);
    const height = Math.max(canvas.clientHeight, 600);
    
    console.log('Using dimensions:', width, 'x', height);
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x87CEEB, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    console.log('Renderer initialized with size:', width, 'x', height);

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
      
      // Setup event listeners
      this.setupGameEventListeners();
      
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
      
      // Handle building based on current tool
      this.handleBuildAction(intersection.point);
      
      // Emit click event for other systems to handle
      this.eventManager.emit('terrain-click', {
        position: intersection.point,
        object: intersection.object
      });
    }
  }

  private handleBuildAction(position: THREE.Vector3): void {
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
        this.deleteObject(position);
        break;
      default:
        console.log('No tool selected');
    }
  }

  private buildRide(position: THREE.Vector3): void {
    console.log('Building ride at:', position);
    
    // Create a simple ride placeholder
    const rideGeometry = new THREE.CylinderGeometry(5, 5, 8);
    const rideMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
    const rideMesh = new THREE.Mesh(rideGeometry, rideMaterial);
    
    rideMesh.position.set(position.x, 4, position.z);
    rideMesh.name = `ride_${Date.now()}`;
    rideMesh.castShadow = true;
    
    this.scene.addObject(rideMesh);
    
    // Add to park (simplified)
    // In a real implementation, this would create a proper Ride entity
    console.log('Ride built successfully!');
  }

  private buildShop(position: THREE.Vector3): void {
    console.log('Building shop at:', position);
    
    const shopGeometry = new THREE.BoxGeometry(3, 3, 3);
    const shopMaterial = new THREE.MeshLambertMaterial({ color: 0x4ECDC4 });
    const shopMesh = new THREE.Mesh(shopGeometry, shopMaterial);
    
    shopMesh.position.set(position.x, 1.5, position.z);
    shopMesh.name = `shop_${Date.now()}`;
    shopMesh.castShadow = true;
    
    this.scene.addObject(shopMesh);
    console.log('Shop built successfully!');
  }

  private buildPath(position: THREE.Vector3): void {
    console.log('Building path at:', position);
    
    const pathGeometry = new THREE.BoxGeometry(2, 0.1, 2);
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    
    pathMesh.position.set(position.x, 0.05, position.z);
    pathMesh.name = `path_${Date.now()}`;
    pathMesh.receiveShadow = true;
    
    this.scene.addObject(pathMesh);
    console.log('Path built successfully!');
  }

  private buildDecoration(position: THREE.Vector3): void {
    console.log('Building decoration at:', position);
    
    // Random decoration
    const decorations = [
      () => {
        const treeGeometry = new THREE.ConeGeometry(1, 4, 8);
        const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        return new THREE.Mesh(treeGeometry, treeMaterial);
      },
      () => {
        const benchGeometry = new THREE.BoxGeometry(2, 0.5, 0.5);
        const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        return new THREE.Mesh(benchGeometry, benchMaterial);
      }
    ];
    
    const decoration = decorations[Math.floor(Math.random() * decorations.length)]();
    decoration.position.set(position.x, 1, position.z);
    decoration.name = `decoration_${Date.now()}`;
    decoration.castShadow = true;
    
    this.scene.addObject(decoration);
    console.log('Decoration built successfully!');
  }

  private deleteObject(position: THREE.Vector3): void {
    console.log('Deleting object at:', position);
    
    // Find objects near the click position
    const objectsToDelete = this.scene.getScene().children.filter(obj => {
      if (obj.name.startsWith('ride_') || obj.name.startsWith('shop_') || 
          obj.name.startsWith('path_') || obj.name.startsWith('decoration_')) {
        const distance = obj.position.distanceTo(position);
        return distance < 5; // Within 5 units
      }
      return false;
    });
    
    objectsToDelete.forEach(obj => {
      this.scene.removeObject(obj);
      console.log('Deleted:', obj.name);
    });
    
    if (objectsToDelete.length === 0) {
      console.log('No objects found to delete');
    }
  }

  private setupGameEventListeners(): void {
    // Camera controls from toolbar
    this.eventManager.on('camera-zoom', (data: { direction: string }) => {
      if (data.direction === 'out') {
        this.camera.zoomOut();
      } else if (data.direction === 'in') {
        this.camera.zoomIn();
      }
    });

    this.eventManager.on('camera-rotate', () => {
      this.camera.rotate();
    });

    // Game controls
    this.eventManager.on('game-pause', (isPaused: boolean) => {
      if (isPaused) {
        this.pause();
      } else {
        this.resume();
      }
      this.park.setPaused(isPaused);
    });

    this.eventManager.on('game-speed', (speed: number) => {
      this.setGameSpeed(speed);
      this.park.setGameSpeed(speed);
    });

    // Tool selection
    this.eventManager.on('tool-selected', (tool: BuildTool) => {
      this.setCurrentTool(tool);
    });

    // Staff management events
    this.eventManager.on('hire-staff', (data: { type: string, cost: string }) => {
      this.handleHireStaff(data.type, data.cost);
    });

    this.eventManager.on('fire-staff', (data: { staffId: string }) => {
      this.handleFireStaff(data.staffId);
    });

    // Research events
    this.eventManager.on('start-research', (researchData: any) => {
      this.handleStartResearch(researchData);
    });

    this.eventManager.on('complete-research', (researchData: any) => {
      this.handleCompleteResearch(researchData);
    });
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
      
      console.log('Resizing canvas to:', width, 'x', height);
      
      if (width > 0 && height > 0) {
        this.renderer.setSize(width, height);
        this.camera.handleResize();
        
        console.log(`Canvas resized to ${width}x${height}`);
      } else {
        console.warn('Container has no size:', width, 'x', height);
      }
    } else {
      console.warn('Canvas has no parent container');
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
    
    // Debug: Print frame info occasionally
    if (Math.floor(this.lastTime / 5000) !== Math.floor((this.lastTime - 16) / 5000)) {
      console.log('Rendering frame - Scene objects:', this.scene.getScene().children.length);
      console.log('Camera position:', this.camera.getCamera().position);
      console.log('Canvas size:', this.renderer.domElement.width, 'x', this.renderer.domElement.height);
    }
  }

  private emitStatsUpdate(): void {
    const stats: GameStats = {
      money: this.park.stats.money,
      visitors: this.park.stats.visitors,
      happiness: this.park.stats.happiness,
      reputation: this.park.stats.reputation
    };

    this.eventManager.emit('statsUpdated', stats);
    
    // Emit game date update
    this.eventManager.emit('game-date-changed', this.park.getFormattedDate());
    
    // Emit game state update
    const gameState = {
      isPaused: this.isPaused,
      gameSpeed: this.gameSpeed,
      currentTool: this.currentTool,
      currentDate: new Date()
    };
    this.eventManager.emit('gameStateChanged', gameState);
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

  public setGameSpeed(speed: number): void {
    this.gameSpeed = Math.max(1, Math.min(4, speed));
    console.log('Game speed set to:', this.gameSpeed);
  }

  public setCurrentTool(tool: BuildTool): void {
    this.currentTool = tool;
    console.log('Current tool set to:', tool);
  }

  public getCurrentTool(): BuildTool {
    return this.currentTool;
  }

  public getGameSpeed(): number {
    return this.gameSpeed;
  }

  public isGamePaused(): boolean {
    return this.isPaused;
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

  // Staff management handlers
  private handleHireStaff(staffType: string, cost: string): void {
    console.log(`Hiring ${staffType} for ${cost}`);
    
    // Parse cost (remove $ and convert to number)
    const costValue = parseInt(cost.replace('$', '').replace(',', ''));
    
    if (this.park.getStats().money >= costValue) {
      // Deduct cost
      const currentStats = this.park.getStats();
      currentStats.money -= costValue;
      
      // Add staff member to park
      this.park.addStaffMember({
        id: Date.now().toString(),
        type: staffType,
        name: this.generateStaffName(staffType),
        salary: Math.floor(costValue * 0.1), // 10% of hiring cost as monthly salary
        efficiency: 75 + Math.random() * 20, // 75-95% efficiency
        area: 'Unassigned'
      });
      
      // Update UI
      this.eventManager.emit('statsUpdated', currentStats);
      this.eventManager.emit('showMessage', { message: `${staffType} hired successfully!`, duration: 3000 });
      
      console.log(`Successfully hired ${staffType}, remaining money: $${currentStats.money}`);
    } else {
      this.eventManager.emit('showMessage', { message: `Not enough money to hire ${staffType}!`, duration: 3000 });
      console.log(`Insufficient funds to hire ${staffType}`);
    }
  }

  private handleFireStaff(staffId: string): void {
    console.log(`Firing staff member ${staffId}`);
    // Implementation would remove staff from park
    this.eventManager.emit('showMessage', { message: 'Staff member fired', duration: 2000 });
  }

  private handleStartResearch(researchData: any): void {
    console.log('Starting research:', researchData);
    
    // Parse research cost
    const costValue = parseInt(researchData.cost.replace('$', '').replace(',', ''));
    
    if (this.park.getStats().money >= costValue) {
      const currentStats = this.park.getStats();
      currentStats.money -= costValue;
      
      // Start research in park
      this.park.startResearch(researchData);
      
      // Update UI
      this.eventManager.emit('statsUpdated', currentStats);
      this.eventManager.emit('showMessage', { 
        message: `Research started: ${researchData.name}`, 
        duration: 3000 
      });
      
      console.log(`Research started: ${researchData.name}, remaining money: $${currentStats.money}`);
    } else {
      this.eventManager.emit('showMessage', { 
        message: 'Not enough money for research!', 
        duration: 3000 
      });
    }
  }

  private handleCompleteResearch(researchData: any): void {
    console.log('Research completed:', researchData);
    this.eventManager.emit('showMessage', { 
      message: `Research completed: ${researchData.name}!`, 
      duration: 4000 
    });
  }

  private generateStaffName(staffType: string): string {
    const names = ['Alex', 'Jamie', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const typeMap: { [key: string]: string } = {
      'Handyman': 'the Handyman',
      'Mechanic': 'the Mechanic', 
      'Security': 'Security',
      'Entertainer': 'the Entertainer'
    };
    
    return `${randomName} ${typeMap[staffType] || ''}`;
  }
}