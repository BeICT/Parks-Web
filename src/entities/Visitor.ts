import { Position, VisitorNeed } from '../types';

export class Visitor {
  public id: string;
  public name: string;
  public position: Position;
  public targetPosition: Position | null = null;
  public happiness: number = 100;
  public money: number;
  public needs: VisitorNeed;
  public currentRide: string | null = null;
  public isInPark: boolean = true;
  public visitTime: number = 0;
  private speed: number = 2;

  constructor(id: string) {
    this.id = id;
    this.name = this.generateRandomName();
    this.position = { x: 0, y: 0, z: 0 };
    this.money = Math.random() * 100 + 50;
    this.needs = {
      hunger: 100,
      thirst: 100,
      toilet: 100,
      fun: 0,
      energy: 100
    };
  }

  private generateRandomName(): string {
    const firstNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Moore', 'Taylor'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  public update(deltaTime: number): void {
    this.visitTime += deltaTime;
    this.updateNeeds(deltaTime);
    this.updateHappiness();
    this.updateMovement(deltaTime);
    this.updateBehavior();
  }

  private updateNeeds(deltaTime: number): void {
    const needDecay = deltaTime / 60;
    
    this.needs.hunger = Math.max(0, this.needs.hunger - needDecay * 0.5);
    this.needs.thirst = Math.max(0, this.needs.thirst - needDecay * 0.8);
    this.needs.toilet = Math.max(0, this.needs.toilet - needDecay * 0.3);
    this.needs.energy = Math.max(0, this.needs.energy - needDecay * 0.2);
  }

  private updateHappiness(): void {
    const needsAverage = (
      this.needs.hunger + 
      this.needs.thirst + 
      this.needs.toilet + 
      this.needs.energy
    ) / 4;
    
    const funBonus = Math.min(20, this.needs.fun);
    this.happiness = Math.max(0, Math.min(100, needsAverage + funBonus));
    
    if (this.happiness < 20 && Math.random() < 0.01) {
      this.isInPark = false;
    }
  }

  private updateMovement(deltaTime: number): void {
    if (!this.targetPosition) return;
    
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < 1) {
      this.position = { ...this.targetPosition };
      this.targetPosition = null;
    } else {
      const moveDistance = this.speed * deltaTime;
      const ratio = Math.min(moveDistance / distance, 1);
      
      this.position.x += dx * ratio;
      this.position.z += dz * ratio;
    }
  }

  private updateBehavior(): void {
    if (this.targetPosition || this.currentRide) return;
    
    const urgentNeed = this.getMostUrgentNeed();
    
    switch (urgentNeed) {
      case 'fun':
        this.seekRide();
        break;
      case 'hunger':
        this.seekFood();
        break;
      case 'thirst':
        this.seekDrink();
        break;
      case 'toilet':
        this.seekToilet();
        break;
      default:
        this.wander();
        break;
    }
  }

  private getMostUrgentNeed(): string {
    if (this.needs.toilet < 30) return 'toilet';
    if (this.needs.thirst < 40) return 'thirst';
    if (this.needs.hunger < 50) return 'hunger';
    if (this.needs.fun < 70) return 'fun';
    return 'wander';
  }

  private seekRide(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekFood(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekDrink(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekToilet(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private wander(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  public rideComplete(excitement: number, intensity: number, nausea: number): void {
    this.needs.fun = Math.min(100, this.needs.fun + excitement);
    this.needs.energy = Math.max(0, this.needs.energy - intensity);
    
    if (nausea > 5 && Math.random() < 0.3) {
      this.happiness = Math.max(0, this.happiness - 10);
    }
    
    this.currentRide = null;
  }

  public spendMoney(amount: number): boolean {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  }
}