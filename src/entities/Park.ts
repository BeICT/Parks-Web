import { GameStats, Position } from '../types';
import Ride from './Ride';
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
      ride.open();
      this.updateReputation(5);
      return true;
    }
    return false;
  }

  public removeRide(rideId: string): boolean {
    const index = this.rides.findIndex(ride => ride.id === rideId);
    if (index !== -1) {
      this.rides.splice(index, 1);
      this.updateReputation(-2);
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
    this.rides.forEach(ride => ride.update(deltaTime));
    this.visitors.forEach(visitor => visitor.update(deltaTime));
    
    // Remove visitors who want to leave
    this.visitors = this.visitors.filter(visitor => visitor.isInPark);
    this.stats.visitors = this.visitors.length;
    
    this.updateHappiness();
    this.generateIncome(deltaTime);
    this.payMaintenanceCosts(deltaTime);
    this.spawnVisitors(deltaTime);
  }

  private updateHappiness(): void {
    if (this.visitors.length === 0) {
      this.stats.happiness = 75;
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

  private payMaintenanceCosts(deltaTime: number): void {
    const totalMaintenance = this.rides.reduce((total, ride) => {
      return total + ride.cost.maintenance;
    }, 0);
    
    this.stats.money -= Math.round(totalMaintenance * deltaTime / 60);
  }

  private spawnVisitors(deltaTime: number): void {
    const maxVisitors = 200;
    if (this.visitors.length >= maxVisitors) return;
    
    const spawnRate = Math.max(0.1, (this.stats.reputation + this.stats.happiness) / 2000);
    const shouldSpawn = Math.random() < spawnRate * deltaTime;
    
    if (shouldSpawn) {
      const visitor = new Visitor(`visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      visitor.position = { x: 0, y: 0, z: -40 };
      this.addVisitor(visitor);
    }
  }

  private updateReputation(change: number): void {
    this.stats.reputation = Math.max(0, Math.min(100, this.stats.reputation + change));
  }

  public getRideAt(position: Position): Ride | null {
    return this.rides.find(ride => {
      const distance = Math.sqrt(
        Math.pow(ride.position.x - position.x, 2) + 
        Math.pow(ride.position.z - position.z, 2)
      );
      return distance < 10;
    }) || null;
  }

  public canBuildAt(position: Position): boolean {
    if (position.x < -this.size.width/2 || position.x > this.size.width/2 || 
        position.z < -this.size.height/2 || position.z > this.size.height/2) {
      return false;
    }

    return !this.getRideAt(position);
  }
}