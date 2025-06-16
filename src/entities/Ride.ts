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
      'water_slide': { staff: 2, weatherSensitive: true },
      'haunted_house': { staff: 2, weatherSensitive: false },
      'drop_tower': { staff: 2, weatherSensitive: true },
      'spinning_teacups': { staff: 1, weatherSensitive: false }
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
      'water_slide': 60,
      'haunted_house': 240,
      'drop_tower': 45,
      'spinning_teacups': 120
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
      case 'bumper_cars':
        group.add(this.createBumperCars());
        break;
      case 'water_slide':
        group.add(this.createWaterSlide());
        break;
      case 'haunted_house':
        group.add(this.createHauntedHouse());
        break;
      case 'drop_tower':
        group.add(this.createDropTower());
        break;
      case 'spinning_teacups':
        group.add(this.createSpinningTeacups());
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

  private createBumperCars(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Floor platform
    const floorGeometry = new THREE.BoxGeometry(12, 0.2, 12);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0.1;
    group.add(floor);
    
    // Safety barriers
    const barrierGeometry = new THREE.BoxGeometry(0.2, 1.5, 12);
    const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4444 });
    
    const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    leftBarrier.position.set(-6, 0.75, 0);
    group.add(leftBarrier);
    
    const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    rightBarrier.position.set(6, 0.75, 0);
    group.add(rightBarrier);
    
    const frontBarrier = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 0.2), barrierMaterial);
    frontBarrier.position.set(0, 0.75, -6);
    group.add(frontBarrier);
    
    const backBarrier = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 0.2), barrierMaterial);
    backBarrier.position.set(0, 0.75, 6);
    group.add(backBarrier);
    
    // Bumper cars
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const carGeometry = new THREE.BoxGeometry(1.2, 0.8, 1.8);
      const carMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL((i / 8), 0.8, 0.5) 
      });
      const car = new THREE.Mesh(carGeometry, carMaterial);
      
      car.position.x = Math.cos(angle) * 3;
      car.position.z = Math.sin(angle) * 3;
      car.position.y = 0.6;
      
      group.add(car);
    }
    
    return group;
  }

  private createWaterSlide(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Tower structure
    const towerGeometry = new THREE.CylinderGeometry(2, 3, 15, 8);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x4488BB });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 7.5;
    group.add(tower);
    
    // Slide tube (curved)
    const slideGeometry = new THREE.TorusGeometry(8, 1, 8, 16, Math.PI);
    const slideMaterial = new THREE.MeshLambertMaterial({ color: 0x66CCFF });
    const slide = new THREE.Mesh(slideGeometry, slideMaterial);
    slide.position.y = 12;
    slide.rotation.z = Math.PI / 4;
    group.add(slide);
    
    // Pool at bottom
    const poolGeometry = new THREE.CylinderGeometry(4, 4, 1, 16);
    const poolMaterial = new THREE.MeshLambertMaterial({ color: 0x0088CC });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.position.y = 0.5;
    pool.position.x = -6;
    group.add(pool);
    
    return group;
  }

  private createHauntedHouse(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Main house structure
    const houseGeometry = new THREE.BoxGeometry(8, 6, 8);
    const houseMaterial = new THREE.MeshLambertMaterial({ color: 0x2A2A2A });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 3;
    group.add(house);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    
    // Windows (glowing)
    const windowGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4400, emissive: 0x442200 });
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-2, 4, 4.05);
    group.add(window1);
    
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(2, 4, 4.05);
    group.add(window2);
    
    // Spooky towers
    for (let i = 0; i < 4; i++) {
      const towerGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 6);
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      
      const angle = (i / 4) * Math.PI * 2;
      tower.position.x = Math.cos(angle) * 4.5;
      tower.position.z = Math.sin(angle) * 4.5;
      tower.position.y = 7;
      
      group.add(tower);
    }
    
    return group;
  }

  private createDropTower(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Main tower
    const towerGeometry = new THREE.CylinderGeometry(0.8, 1.2, 25, 8);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 12.5;
    group.add(tower);
    
    // Passenger compartment
    const cabinGeometry = new THREE.CylinderGeometry(2, 2, 2, 8);
    const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6666 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.y = 20; // At the top
    group.add(cabin);
    
    // Safety tracks
    for (let i = 0; i < 4; i++) {
      const trackGeometry = new THREE.BoxGeometry(0.2, 25, 0.2);
      const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
      const track = new THREE.Mesh(trackGeometry, trackMaterial);
      
      const angle = (i / 4) * Math.PI * 2;
      track.position.x = Math.cos(angle) * 1.5;
      track.position.z = Math.sin(angle) * 1.5;
      track.position.y = 12.5;
      
      group.add(track);
    }
    
    return group;
  }

  private createSpinningTeacups(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Central platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 16);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDDDD });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25;
    group.add(platform);
    
    // Central spinner mechanism
    const centralSpinnerGeometry = new THREE.CylinderGeometry(1, 1, 2, 8);
    const centralSpinnerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const centralSpinner = new THREE.Mesh(centralSpinnerGeometry, centralSpinnerMaterial);
    centralSpinner.position.y = 1.5;
    group.add(centralSpinner);
    
    // Teacups
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      
      // Teacup base
      const cupGeometry = new THREE.CylinderGeometry(1.2, 0.8, 1, 16);
      const cupMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL((i / 6), 0.7, 0.8) 
      });
      const cup = new THREE.Mesh(cupGeometry, cupMaterial);
      
      cup.position.x = Math.cos(angle) * 5;
      cup.position.z = Math.sin(angle) * 5;
      cup.position.y = 1;
      
      group.add(cup);
      
      // Teacup handle
      const handleGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 16, Math.PI);
      const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.copy(cup.position);
      handle.position.y += 0.5;
      handle.rotation.z = Math.PI / 2;
      
      group.add(handle);
    }
    
    return group;
  }

  private createGenericRide(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Simple geometric ride for unknown types
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

  // Additional ride factory methods for more variety
  static createBumperCars(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Bumper Cars',
      type: 'bumper_cars',
      capacity: 20,
      cost: { money: 4000, maintenance: 25 },
      excitement: 4,
      intensity: 3,
      nausea: 2
    };
    return new Ride(config, position);
  }

  static createWaterSlide(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Water Slide',
      type: 'water_slide',
      capacity: 12,
      cost: { money: 6000, maintenance: 30 },
      excitement: 6,
      intensity: 4,
      nausea: 3
    };
    return new Ride(config, position);
  }

  static createHauntedHouse(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Haunted House',
      type: 'haunted_house',
      capacity: 16,
      cost: { money: 10000, maintenance: 35 },
      excitement: 7,
      intensity: 5,
      nausea: 4
    };
    return new Ride(config, position);
  }

  static createDropTower(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Drop Tower',
      type: 'drop_tower',
      capacity: 8,
      cost: { money: 12000, maintenance: 45 },
      excitement: 8,
      intensity: 9,
      nausea: 5
    };
    return new Ride(config, position);
  }

  static createSpinningTeacups(id: string, position: Position): Ride {
    const config: RideConfig = {
      id,
      name: 'Spinning Teacups',
      type: 'spinning_teacups',
      capacity: 24,
      cost: { money: 3500, maintenance: 20 },
      excitement: 3,
      intensity: 2,
      nausea: 6
    };
    return new Ride(config, position);
  }
}