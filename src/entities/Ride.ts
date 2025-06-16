import * as THREE from 'three';
import { Position, BuildingCost, RideConfig } from '../types';

export interface RideQueue {
  length: number;
  waitTime: number;
  maxLength: number;
}

export interface RideStats {
  totalRiders: number;
  revenue: number;
  breakdowns: number;
  safetyRating: number;
  popularity: number;
}

export default class Ride {
  public id: string;
  public name: string;
  public type: string;
  public position: Position;
  public capacity: number;
  public cost: BuildingCost;
  public ticketPrice: number;
  public excitement: number;
  public intensity: number;
  public nausea: number;
  public isOperating: boolean = false;
  public isOperational: boolean = true;
  public ridersPerHour: number = 0;
  public currentRiders: number = 0;
  public rideTime: number;
  public currentTime: number = 0;
  public mesh?: THREE.Object3D;
  public queue: RideQueue;
  public stats: RideStats;
  public maintenanceLevel: number = 100;
  public staffRequired: number = 1;
  public currentStaff: number = 0;
  public weatherSensitive: boolean = false;
  private cycleTimer: number = 0;
  private maintenanceTimer: number = 0;
  constructor(config: RideConfig, position: Position) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.position = position;
    this.capacity = config.capacity;
    this.cost = config.cost;
    this.excitement = config.excitement;
    this.intensity = config.intensity;
    this.nausea = config.nausea;
    this.rideTime = this.calculateRideTime();
    this.ticketPrice = this.calculateTicketPrice();
    this.calculateRidersPerHour();
    
    // Initialize queue
    this.queue = {
      length: 0,
      waitTime: 0,
      maxLength: config.capacity * 3
    };
    
    // Initialize stats
    this.stats = {
      totalRiders: 0,
      revenue: 0,
      breakdowns: 0,
      safetyRating: 100,
      popularity: 50
    };
    
    this.setRideProperties();
  }

  private setRideProperties(): void {
    const rideProperties: { [key: string]: any } = {
      'roller_coaster': { staff: 2, weatherSensitive: true },
      'ferris_wheel': { staff: 1, weatherSensitive: true },
      'carousel': { staff: 1, weatherSensitive: false },
      'bumper_cars': { staff: 1, weatherSensitive: false },
      'water_slide': { staff: 2, weatherSensitive: true }
    };
    
    const props = rideProperties[this.type] || { staff: 1, weatherSensitive: false };
    this.staffRequired = props.staff;
    this.weatherSensitive = props.weatherSensitive;
  }

  private calculateRideTime(): number {
    const baseTimes: { [key: string]: number } = {
      'roller_coaster': 120,
      'ferris_wheel': 180,
      'carousel': 90,
      'bumper_cars': 150,
      'water_slide': 60
    };
    return baseTimes[this.type] || 120;
  }

  private calculateTicketPrice(): number {
    return Math.max(1, Math.round((this.excitement + this.intensity) / 2));
  }

  public breakdown(): void {
    this.isOperational = false;
    this.isOperating = false;
    console.log(`${this.name} has broken down and needs maintenance!`);
  }

  public repair(): void {
    this.isOperational = true;
    console.log(`${this.name} has been repaired and is operational again.`);
  }

  private calculateRidersPerHour(): void {
    if (this.isOperational && this.isOperating) {
      // Base calculation: capacity * cycles per hour
      const cyclesPerHour = 3600 / this.rideTime;
      this.ridersPerHour = Math.floor(this.capacity * cyclesPerHour * 0.8); // 80% efficiency
    } else {
      this.ridersPerHour = 0;
    }
  }

  public update(deltaTime: number): void {
    if (!this.isOperating) return;

    this.currentTime += deltaTime;
    
    // Recalculate riders per hour periodically
    this.calculateRidersPerHour();

    if (this.currentTime >= this.rideTime) {
      this.currentTime = 0;
      this.currentRiders = Math.min(this.capacity, this.getWaitingVisitors());
    }
  }

  private getWaitingVisitors(): number {
    const baseAttraction = this.excitement / 10;
    const randomFactor = Math.random() * 0.5 + 0.5;
    return Math.floor(this.capacity * baseAttraction * randomFactor);
  }

  public open(): void {
    this.isOperating = true;
    console.log(`${this.name} is now open!`);
  }

  public close(): void {
    this.isOperating = false;
    this.currentRiders = 0;
    console.log(`${this.name} is now closed.`);
  }

  public setMesh(mesh: THREE.Object3D): void {
    this.mesh = mesh;
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  public createMesh(): THREE.Object3D {
    const group = new THREE.Group();
    
    switch (this.type) {
      case 'ferris_wheel':
        group.add(this.createFerrisWheel());
        break;
      case 'roller_coaster':
        group.add(this.createRollerCoaster());
        break;
      case 'carousel':
        group.add(this.createCarousel());
        break;
      default:
        group.add(this.createGenericRide());
    }
    
    this.setMesh(group);
    return group;
  }

  private createFerrisWheel(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Main wheel structure
    const wheelGeometry = new THREE.TorusGeometry(8, 0.5, 8, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x4444AA });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = 10;
    group.add(wheel);
    
    // Support structure
    const supportGeometry = new THREE.CylinderGeometry(0.3, 0.5, 10, 8);
    const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.y = 5;
    group.add(support);
    
    // Gondolas
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const gondolaGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
      const gondolaMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6666 });
      const gondola = new THREE.Mesh(gondolaGeometry, gondolaMaterial);
      
      gondola.position.x = Math.cos(angle) * 8;
      gondola.position.z = Math.sin(angle) * 8;
      gondola.position.y = 10;
      
      group.add(gondola);
    }
    
    return group;
  }

  private createRollerCoaster(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Track supports
    for (let i = 0; i < 5; i++) {
      const supportGeometry = new THREE.CylinderGeometry(0.2, 0.4, 8 + i * 2, 6);
      const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      
      support.position.x = i * 4 - 8;
      support.position.y = (4 + i) + Math.sin(i) * 2;
      
      group.add(support);
    }
    
    // Track rails
    const railGeometry = new THREE.BoxGeometry(20, 0.2, 0.3);
    const railMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    
    const rail1 = new THREE.Mesh(railGeometry, railMaterial);
    rail1.position.y = 8;
    rail1.position.z = -0.5;
    group.add(rail1);
    
    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail2.position.y = 8;
    rail2.position.z = 0.5;
    group.add(rail2);
    
    // Station
    const stationGeometry = new THREE.BoxGeometry(6, 3, 4);
    const stationMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const station = new THREE.Mesh(stationGeometry, stationMaterial);
    station.position.y = 1.5;
    station.position.x = -8;
    group.add(station);
    
    return group;
  }

  private createCarousel(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Base platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 16);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25;
    group.add(platform);
    
    // Center pole
    const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 4;
    group.add(pole);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(10, 3, 8);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5;
    group.add(roof);
    
    // Horses
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const horseGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.4);
      const horseMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL((i / 12), 0.7, 0.6) 
      });
      const horse = new THREE.Mesh(horseGeometry, horseMaterial);
      
      horse.position.x = Math.cos(angle) * 6;
      horse.position.z = Math.sin(angle) * 6;
      horse.position.y = 1.5;
      
      group.add(horse);
    }
    
    return group;
  }

  private createGenericRide(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Simple geometric ride
    const mainGeometry = new THREE.BoxGeometry(4, 3, 4);
    const mainMaterial = new THREE.MeshLambertMaterial({ color: 0x9966CC });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 1.5;
    group.add(main);
    
    return group;
  }

  // Static factory methods
  static createFerrisWheel(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Ferris Wheel',
      type: 'ferris_wheel',
      capacity: 32,
      cost: { money: 8000, maintenance: 20 },
      excitement: 5,
      intensity: 2,
      nausea: 1
    };
    return new Ride(config, position);
  }

  static createRollerCoaster(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Roller Coaster',
      type: 'roller_coaster',
      capacity: 24,
      cost: { money: 15000, maintenance: 50 },
      excitement: 9,
      intensity: 8,
      nausea: 6
    };
    return new Ride(config, position);
  }

  static createCarousel(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Carousel',
      type: 'carousel',
      capacity: 16,
      cost: { money: 3000, maintenance: 15 },
      excitement: 3,
      intensity: 1,
      nausea: 0
    };
    return new Ride(config, position);
  }
}