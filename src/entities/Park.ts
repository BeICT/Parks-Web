import { GameStats, Position } from '@/types';
import { Ride } from './Ride';
import { Visitor } from './Visitor';

export class Park {
  public name: string;
  public stats: GameStats;
  public rides: Ride[] = [];
  public visitors: Visitor[] = [];
  public size: { width: number; height: number };

  constructor(name: string = 'My Amazing Park') {
    this.name = name;
    this.stats = {
      money: 50000,
      visitors: 0,
      happiness: 100,
      reputation: 50
    };
    this.size = { width: 100, height: 100 };
  }

  public addRide(ride: Ride): boolean {
    if (this.stats.money >= ride.cost.money) {
      this.stats.money -= ride.cost.money;
      this.rides.push(ride);
      return true;
    }
    return false;
  }

  public removeRide(rideId: string): boolean {
    const index = this.rides.findIndex(ride => ride.id === rideId);
    if (index !== -1) {
      this.rides.splice(index, 1);
      return true;
    }
    return false;
  }

  public addVisitor(visitor: Visitor): void {
    this.visitors.push(visitor);
    this.stats.visitors = this.visitors.length;
  }

  public removeVisitor(visitorId: string): void {
    const index = this.visitors.findIndex(v => v.id === visitorId);
    if (index !== -1) {
      this.visitors.splice(index, 1);
      this.stats.visitors = this.visitors.length;
    }
  }

  public update(deltaTime: number): void {
    // Update all rides
    this.rides.forEach(ride => ride.update(deltaTime));
    
    // Update all visitors
    this.visitors.forEach(visitor => visitor.update(deltaTime));
    
    // Calculate park happiness
    this.updateHappiness();
    
    // Generate income from rides
    this.generateIncome(deltaTime);
    
    // Spawn new visitors occasionally
    this.spawnVisitors(deltaTime);
  }

  private updateHappiness(): void {
    if (this.visitors.length === 0) {
      this.stats.happiness = 100;
      return;
    }

    const totalHappiness = this.visitors.reduce((sum, visitor) => sum + visitor.happiness, 0);
    this.stats.happiness = Math.round(totalHappiness / this.visitors.length);
  }

  private generateIncome(deltaTime: number): void {
    const income = this.rides.reduce((total, ride) => {
      return total + (ride.isOperating ? ride.ticketPrice * ride.currentRiders * deltaTime / 60 : 0);
    }, 0);
    
    this.stats.money += Math.round(income);
  }

  private spawnVisitors(deltaTime: number): void {
    // Spawn new visitors based on park reputation and time
    const spawnRate = Math.max(0.1, this.stats.reputation / 1000); // visitors per second
    const shouldSpawn = Math.random() < spawnRate * deltaTime;
    
    if (shouldSpawn && this.visitors.length < 200) {
      const visitor = new Visitor(`visitor_${Date.now()}`);
      visitor.position = { x: 0, y: 0, z: 0 }; // Entrance position
      this.addVisitor(visitor);
    }
  }

  public getRideAt(position: Position): Ride | null {
    return this.rides.find(ride => {
      const distance = Math.sqrt(
        Math.pow(ride.position.x - position.x, 2) + 
        Math.pow(ride.position.z - position.z, 2)
      );
      return distance < 5; // 5 unit radius
    }) || null;
  }

  public canBuildAt(position: Position): boolean {
    // Check if position is within park bounds
    if (position.x < 0 || position.x > this.size.width || 
        position.z < 0 || position.z > this.size.height) {
      return false;
    }

    // Check if there's already something built here
    return !this.getRideAt(position);
  }
}