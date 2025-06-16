import * as THREE from 'three';
import { Position, BuildTool } from '../types';
import { Park } from '../entities/Park';
import Ride from '../entities/Ride';
import { EventManager } from '../utils/EventManager';

export interface GridCell {
  x: number;
  z: number;
  occupied: boolean;
  objectType: 'path' | 'ride' | 'shop' | 'decoration' | 'facility' | null;
  objectId: string | null;
}

export interface BuildValidationResult {
  canBuild: boolean;
  reason?: string;
  cost?: number;
}

export class BuildManager {
  private grid: Map<string, GridCell> = new Map();
  private gridSize: number = 2; // 2x2 meter grid cells
  private parkBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  private eventManager: EventManager;
  private park: Park;

  constructor(eventManager: EventManager, park: Park, parkSize: { width: number; height: number }) {
    this.eventManager = eventManager;
    this.park = park;
    this.parkBounds = {
      minX: -parkSize.width / 2,
      maxX: parkSize.width / 2,
      minZ: -parkSize.height / 2,
      maxZ: parkSize.height / 2
    };
    this.initializeGrid();
  }

  private initializeGrid(): void {
    // Initialize grid cells within park bounds
    for (let x = this.parkBounds.minX; x <= this.parkBounds.maxX; x += this.gridSize) {
      for (let z = this.parkBounds.minZ; z <= this.parkBounds.maxZ; z += this.gridSize) {
        const key = this.getGridKey(x, z);
        this.grid.set(key, {
          x,
          z,
          occupied: false,
          objectType: null,
          objectId: null
        });
      }
    }
  }

  private getGridKey(x: number, z: number): string {
    const gridX = Math.floor(x / this.gridSize) * this.gridSize;
    const gridZ = Math.floor(z / this.gridSize) * this.gridSize;
    return `${gridX},${gridZ}`;
  }

  private snapToGrid(position: THREE.Vector3): Position {
    return {
      x: Math.floor(position.x / this.gridSize) * this.gridSize + this.gridSize / 2,
      y: 0,
      z: Math.floor(position.z / this.gridSize) * this.gridSize + this.gridSize / 2
    };
  }

  private getRequiredCells(position: Position, objectType: string): Position[] {
    const cells: Position[] = [];
    const baseX = Math.floor(position.x / this.gridSize) * this.gridSize;
    const baseZ = Math.floor(position.z / this.gridSize) * this.gridSize;

    switch (objectType) {
      case 'path':
        // Paths occupy 1 cell
        cells.push({ x: baseX, y: 0, z: baseZ });
        break;
      case 'ride':
        // Most rides occupy 2x2 cells
        for (let x = 0; x < 2; x++) {
          for (let z = 0; z < 2; z++) {
            cells.push({
              x: baseX + x * this.gridSize,
              y: 0,
              z: baseZ + z * this.gridSize
            });
          }
        }
        break;
      case 'shop':
      case 'facility':
        // Shops and facilities occupy 1x1 cell
        cells.push({ x: baseX, y: 0, z: baseZ });
        break;
      case 'decoration':
        // Decorations occupy 1 cell
        cells.push({ x: baseX, y: 0, z: baseZ });
        break;
      default:
        cells.push({ x: baseX, y: 0, z: baseZ });
    }

    return cells;
  }

  private areAllCellsAvailable(cells: Position[], objectType: string): boolean {
    return cells.every(cell => {
      const key = this.getGridKey(cell.x, cell.z);
      const gridCell = this.grid.get(key);
      
      if (!gridCell) return false; // Outside park bounds
      
      // Special case: paths can connect to existing paths
      if (objectType === 'path' && gridCell.objectType === 'path') {
        return false; // Can't build path on existing path
      }
      
      return !gridCell.occupied;
    });
  }

  private getObjectSize(objectType: string): { width: number; height: number } {
    switch (objectType) {
      case 'path':
        return { width: 1, height: 1 };
      case 'ride':
        return { width: 2, height: 2 };
      case 'shop':
      case 'facility':
        return { width: 1, height: 1 };
      case 'decoration':
        return { width: 1, height: 1 };
      default:
        return { width: 1, height: 1 };
    }
  }

  public validateBuild(position: THREE.Vector3, buildTool: BuildTool): BuildValidationResult {
    const objectType = this.getObjectTypeFromTool(buildTool);
    const snappedPosition = this.snapToGrid(position);
    const requiredCells = this.getRequiredCells(snappedPosition, objectType);
    
    // Check if position is within park bounds
    if (snappedPosition.x < this.parkBounds.minX || snappedPosition.x > this.parkBounds.maxX ||
        snappedPosition.z < this.parkBounds.minZ || snappedPosition.z > this.parkBounds.maxZ) {
      return {
        canBuild: false,
        reason: "Can't build outside park boundaries"
      };
    }

    // Check if all required cells are available
    if (!this.areAllCellsAvailable(requiredCells, objectType)) {
      return {
        canBuild: false,
        reason: `This area is already occupied or paths can't overlap`
      };
    }

    // Check money requirements
    const cost = this.getObjectCost(objectType);
    if (this.park.stats.money < cost) {
      return {
        canBuild: false,
        reason: `Not enough money. Need $${cost}, have $${Math.floor(this.park.stats.money)}`,
        cost
      };
    }

    // Special validation for rides - need path access
    if (objectType === 'ride') {
      const hasPathAccess = this.checkPathAccess(requiredCells);
      if (!hasPathAccess) {
        return {
          canBuild: false,
          reason: "Rides must be connected to a path for guest access"
        };
      }
    }

    return {
      canBuild: true,
      cost
    };
  }

  private checkPathAccess(rideCells: Position[]): boolean {
    // Check if any adjacent cell to the ride has a path
    for (const cell of rideCells) {
      const adjacentCells = [
        { x: cell.x - this.gridSize, z: cell.z },
        { x: cell.x + this.gridSize, z: cell.z },
        { x: cell.x, z: cell.z - this.gridSize },
        { x: cell.x, z: cell.z + this.gridSize }
      ];

      for (const adjCell of adjacentCells) {
        const key = this.getGridKey(adjCell.x, adjCell.z);
        const gridCell = this.grid.get(key);
        if (gridCell && gridCell.objectType === 'path') {
          return true;
        }
      }
    }

    // Also check if there's a path connection from entrance
    // For now, we'll be lenient and allow building if park is small
    return this.park.size.width <= 50 || this.hasPathToEntrance();
  }

  private hasPathToEntrance(): boolean {
    // Simple check - if there are any paths, assume connection exists
    // In a more complex system, this would do pathfinding
    for (const [key, cell] of this.grid) {
      if (cell.objectType === 'path') {
        return true;
      }
    }
    return false;
  }

  private getObjectTypeFromTool(tool: BuildTool): string {
    switch (tool) {
      case BuildTool.RIDE: return 'ride';
      case BuildTool.SHOP: return 'shop';
      case BuildTool.PATH: return 'path';
      case BuildTool.DECORATION: return 'decoration';
      default: return 'decoration';
    }
  }

  private getObjectCost(objectType: string): number {
    switch (objectType) {
      case 'path': return 50;
      case 'ride': return 5000 + Math.random() * 10000; // Varies by ride type
      case 'shop': return 2000;
      case 'decoration': return 200;
      case 'facility': return 1500;
      default: return 100;
    }
  }

  public buildObject(position: THREE.Vector3, buildTool: BuildTool, scene: any): boolean {
    const validation = this.validateBuild(position, buildTool);
    
    if (!validation.canBuild) {
      this.eventManager.emit('showMessage', {
        message: validation.reason,
        type: 'error',
        duration: 3000
      });
      return false;
    }

    const objectType = this.getObjectTypeFromTool(buildTool);
    const snappedPosition = this.snapToGrid(position);
    const requiredCells = this.getRequiredCells(snappedPosition, objectType);
    const objectId = `${objectType}_${Date.now()}`;

    // Deduct money
    this.park.stats.money -= validation.cost!;

    // Mark cells as occupied
    requiredCells.forEach(cell => {
      const key = this.getGridKey(cell.x, cell.z);
      const gridCell = this.grid.get(key);
      if (gridCell) {
        gridCell.occupied = true;
        gridCell.objectType = objectType as any;
        gridCell.objectId = objectId;
      }
    });

    // Create and place the object
    const success = this.createAndPlaceObject(objectType, snappedPosition, objectId, scene);

    if (success) {
      this.eventManager.emit('showMessage', {
        message: `${this.capitalizeFirst(objectType)} built for $${validation.cost}!`,
        type: 'success',
        duration: 2000
      });
      
      // Update park stats
      this.eventManager.emit('statsUpdated', this.park.getStats());
    } else {
      // Revert if creation failed
      requiredCells.forEach(cell => {
        const key = this.getGridKey(cell.x, cell.z);
        const gridCell = this.grid.get(key);
        if (gridCell) {
          gridCell.occupied = false;
          gridCell.objectType = null;
          gridCell.objectId = null;
        }
      });
      this.park.stats.money += validation.cost!;
    }

    return success;
  }

  private createAndPlaceObject(objectType: string, position: Position, objectId: string, scene: any): boolean {
    try {
      switch (objectType) {
        case 'path':
          return this.createPath(position, objectId, scene);
        case 'ride':
          return this.createRide(position, objectId, scene);
        case 'shop':
          return this.createShop(position, objectId, scene);
        case 'decoration':
          return this.createDecoration(position, objectId, scene);
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to create object:', error);
      return false;
    }
  }

  private createPath(position: Position, objectId: string, scene: any): boolean {
    const pathGeometry = new THREE.BoxGeometry(this.gridSize * 0.9, 0.1, this.gridSize * 0.9);
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    
    pathMesh.position.set(position.x, 0.05, position.z);
    pathMesh.name = objectId;
    pathMesh.receiveShadow = true;
    
    scene.addObject(pathMesh);
    return true;
  }

  private createRide(position: Position, objectId: string, scene: any): boolean {
    // Create a random ride
    const rideTypes = ['ferris_wheel', 'roller_coaster', 'carousel', 'bumper_cars', 'water_slide'];
    const randomType = rideTypes[Math.floor(Math.random() * rideTypes.length)];
    
    let ride;
    const ridePosition = { x: position.x, y: 0, z: position.z };
    
    switch (randomType) {
      case 'ferris_wheel':
        ride = Ride.createFerrisWheel(objectId, ridePosition);
        break;
      case 'roller_coaster':
        ride = Ride.createRollerCoaster(objectId, ridePosition);
        break;
      case 'carousel':
        ride = Ride.createCarousel(objectId, ridePosition);
        break;
      case 'bumper_cars':
        ride = Ride.createBumperCars(objectId, ridePosition);
        break;
      case 'water_slide':
        ride = Ride.createWaterSlide(objectId, ridePosition);
        break;
      default:
        ride = Ride.createCarousel(objectId, ridePosition);
    }

    // Add ride to park
    this.park.addRide(ride);
    
    // Create and add the 3D mesh
    const rideMesh = ride.createMesh();
    rideMesh.position.set(position.x, 0, position.z);
    rideMesh.name = objectId;
    rideMesh.castShadow = true;
    
    scene.addObject(rideMesh);
    return true;
  }

  private createShop(position: Position, objectId: string, scene: any): boolean {
    const shopGeometry = new THREE.BoxGeometry(this.gridSize * 0.8, 3, this.gridSize * 0.8);
    const shopMaterial = new THREE.MeshLambertMaterial({ color: 0x4ECDC4 });
    const shopMesh = new THREE.Mesh(shopGeometry, shopMaterial);
    
    shopMesh.position.set(position.x, 1.5, position.z);
    shopMesh.name = objectId;
    shopMesh.castShadow = true;
    
    scene.addObject(shopMesh);
    
    // Add facility to park
    this.park.facilities.push({
      id: objectId,
      type: 'shop',
      name: 'Park Shop',
      position: position,
      cost: 2000,
      income: 150,
      maintenance: 25,
      customerCapacity: 8,
      currentCustomers: 0
    });
    
    return true;
  }

  private createDecoration(position: Position, objectId: string, scene: any): boolean {
    // Random decoration
    const decorations = [
      () => {
        const treeGeometry = new THREE.ConeGeometry(0.8, 3, 8);
        const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        return new THREE.Mesh(treeGeometry, treeMaterial);
      },
      () => {
        const benchGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.4);
        const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        return new THREE.Mesh(benchGeometry, benchMaterial);
      }
    ];
    
    const decoration = decorations[Math.floor(Math.random() * decorations.length)]();
    decoration.position.set(position.x, decoration.geometry.type === 'ConeGeometry' ? 1.5 : 0.2, position.z);
    decoration.name = objectId;
    decoration.castShadow = true;
    
    scene.addObject(decoration);
    return true;
  }

  public deleteObject(position: THREE.Vector3, scene: any): boolean {
    const snappedPosition = this.snapToGrid(position);
    const key = this.getGridKey(snappedPosition.x, snappedPosition.z);
    const gridCell = this.grid.get(key);
    
    if (!gridCell || !gridCell.occupied) {
      this.eventManager.emit('showMessage', {
        message: 'Nothing to delete here',
        type: 'info',
        duration: 1500
      });
      return false;
    }

    const objectId = gridCell.objectId!;
    const objectType = gridCell.objectType!;
    
    // Find and remove the 3D object
    const sceneObject = scene.getScene().getObjectByName(objectId);
    if (sceneObject) {
      scene.removeObject(sceneObject);
    }
    
    // Remove from park data
    if (objectType === 'ride') {
      const rideIndex = this.park.rides.findIndex(r => r.id === objectId);
      if (rideIndex !== -1) {
        this.park.rides.splice(rideIndex, 1);
        this.park.stats.money += 500; // Partial refund
      }
    } else if (objectType === 'shop') {
      const facilityIndex = this.park.facilities.findIndex(f => f.id === objectId);
      if (facilityIndex !== -1) {
        this.park.facilities.splice(facilityIndex, 1);
        this.park.stats.money += 200; // Partial refund
      }
    }
    
    // Clear grid cells
    const requiredCells = this.getRequiredCells(snappedPosition, objectType);
    requiredCells.forEach(cell => {
      const cellKey = this.getGridKey(cell.x, cell.z);
      const cellData = this.grid.get(cellKey);
      if (cellData) {
        cellData.occupied = false;
        cellData.objectType = null;
        cellData.objectId = null;
      }
    });
    
    this.eventManager.emit('showMessage', {
      message: `${this.capitalizeFirst(objectType)} demolished`,
      type: 'info',
      duration: 2000
    });
    
    this.eventManager.emit('statsUpdated', this.park.getStats());
    return true;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public getGridVisualization(): THREE.Group {
    const gridGroup = new THREE.Group();
    gridGroup.name = 'buildGrid';
    
    // Create grid visualization
    for (const [key, cell] of this.grid) {
      if (cell.occupied) continue;
      
      const gridGeometry = new THREE.PlaneGeometry(this.gridSize * 0.8, this.gridSize * 0.8);
      const gridMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
      
      gridMesh.position.set(cell.x, 0.1, cell.z);
      gridMesh.rotation.x = -Math.PI / 2;
      
      gridGroup.add(gridMesh);
    }
    
    return gridGroup;
  }
}
