import { GameStats, Position, RideConfig } from '../types';
import Ride from './Ride';
import { Visitor } from './Visitor';

export class Park {
  public name: string;
  public stats: GameStats;
  public rides: Ride[] = [];
  public visitors: Visitor[] = [];
  public size: { width: number; height: number }; // Represents the park's buildable area dimensions

  constructor(name: string = 'My Amazing Park') {
    this.name = name;
    this.stats = {
      money: 50000,
      visitors: 0,
      happiness: 70, // Initial happiness
      reputation: 50  // Initial reputation
    };
    // Example: A park that is 200x200 units, centered at (0,0)
    // So, buildable from -100 to 100 on x and z axes.
    this.size = { width: 200, height: 200 };
  }

  public addRide(ride: Ride): boolean {
    if (this.stats.money >= ride.cost.money) {
      this.stats.money -= ride.cost.money;
      this.rides.push(ride);
      this.updateReputation(5 * (ride.excitement / 50)); // Reputation boost based on ride excitement
      // Example: A very exciting ride (excitement 100) gives +10 reputation.
      // A mildly exciting ride (excitement 25) gives +2.5 reputation.
      ride.open(); // Automatically open new rides
      return true;
    }
    console.warn(`Not enough money to build ${ride.name}. Cost: ${ride.cost.money}, Available: ${this.stats.money}`);
    return false;
  }

  public removeRide(rideId: string): boolean {
    const index = this.rides.findIndex(r => r.id === rideId);
    if (index !== -1) {
      const removedRide = this.rides.splice(index, 1)[0];
      this.updateReputation(-2 * (removedRide.excitement / 50)); // Smaller reputation hit for removal
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
      // If a visitor leaves unhappy, it could slightly affect reputation (future enhancement)
    }
    this.stats.visitors = this.visitors.length;
  }

  public update(deltaTime: number): void {
    // Update individual rides and visitors
    this.rides.forEach(ride => ride.update(deltaTime));
    this.visitors.forEach(visitor => visitor.update(deltaTime));

    // Remove visitors who want to leave (e.g., very low energy or happiness)
    this.visitors = this.visitors.filter(visitor => {
      if (visitor.needs.energy <= 5 && visitor.happiness < 20) {
        // console.log(`Visitor ${visitor.id} is leaving.`);
        return false;
      }
      return true;
    });


    // Process maintenance costs (per second)
    const totalMaintenanceCostPerSecond = this.rides.reduce((total, ride) => total + ride.cost.maintenance / 60, 0);
    this.stats.money -= totalMaintenanceCostPerSecond * deltaTime;

    this.generateIncome(deltaTime);
    this.updateHappiness(); // Happiness depends on visitor needs and park state
    this.spawnVisitors(deltaTime);

    // Ensure stats are within reasonable bounds
    this.stats.money = Math.max(0, this.stats.money); // Money can't be negative (or handle debt later)
    this.stats.happiness = Math.max(0, Math.min(100, this.stats.happiness));
    this.stats.reputation = Math.max(0, Math.min(100, this.stats.reputation));
    this.stats.visitors = this.visitors.length; // Always reflect current visitor count
  }

  private updateHappiness(): void {
    if (this.visitors.length === 0) {
      // If park is empty, happiness might slowly trend towards a neutral value or based on park's appeal
      this.stats.happiness = Math.max(50, this.stats.happiness - 0.05); // Slow decay if empty and unappealing
      return;
    }

    const averageVisitorHappiness = this.visitors.reduce((sum, visitor) => sum + visitor.happiness, 0) / this.visitors.length;

    // Park-wide factors can also influence overall happiness
    let parkFactor = 0;
    if (this.rides.length > 3) parkFactor += 5; // Bonus for having a few rides
    if (this.rides.length > 7) parkFactor += 5; // Additional bonus for more rides
    // Cleanliness, scenery, etc., could be added here

    // Blend visitor happiness with park factors
    this.stats.happiness = (averageVisitorHappiness * 0.8) + (parkFactor * 0.2);
  }

  private generateIncome(deltaTime: number): void {
    let rideIncomeThisTick = 0;
    this.rides.forEach(ride => {
      if (ride.isOperating && ride.currentRiders > 0) {
        // Assume a portion of riders pay each tick, or average out ticket sales
        // Simplified: each rider on an operating ride contributes a small amount per second
        rideIncomeThisTick += ride.currentRiders * (ride.ticketPrice / 30) * deltaTime; // e.g. ticket price spread over 30s ride cycle
      }
    });
    this.stats.money += rideIncomeThisTick;
  }

  private spawnVisitors(deltaTime: number): void {
    const maxVisitors = 200; // Park's current capacity for visitors
    if (this.visitors.length >= maxVisitors) {
      return;
    }

    // Spawn chance increases with reputation and happiness
    // Base chance: 1% per second at 50 rep, 50 happiness
    const baseSpawnRate = 0.01;
    const reputationFactor = this.stats.reputation / 50; // Factor from 0 to 2
    const happinessFactor = this.stats.happiness / 50;   // Factor from 0 to 2

    // Combine factors, ensuring they don't reduce spawn rate below a minimum if rep/hap is low
    const effectiveSpawnRate = baseSpawnRate * Math.max(0.1, reputationFactor * happinessFactor);

    if (Math.random() < effectiveSpawnRate * deltaTime) {
      const newVisitor = new Visitor(`visitor_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`);
      newVisitor.position = { x: Math.random() * 10 - 5, y: 0, z: - (this.size.height / 2) + 5 }; // Spawn near park edge/entrance
      this.addVisitor(newVisitor);
    }
  }

  private updateReputation(change: number): void {
    this.stats.reputation += change;
    this.stats.reputation = Math.max(0, Math.min(100, this.stats.reputation));
  }

  // Example method for future use (e.g., building placement)
  public getRideAt(position: Position): Ride | null {
    return this.rides.find(ride => {
      // Simple bounding box check (assuming rides have a size property or default)
      const rideSize = 5; // Example default size
      return position.x >= ride.position.x - rideSize / 2 &&
             position.x <= ride.position.x + rideSize / 2 &&
             position.z >= ride.position.z - rideSize / 2 &&
             position.z <= ride.position.z + rideSize / 2;
    }) || null;
  }

  public canBuildAt(position: Position, itemSize: {width: number, depth: number}): boolean {
    // Check park boundaries
    const halfItemWidth = itemSize.width / 2;
    const halfItemDepth = itemSize.depth / 2;
    if (position.x - halfItemWidth < -this.size.width / 2 || position.x + halfItemWidth > this.size.width / 2 ||
        position.z - halfItemDepth < -this.size.height / 2 || position.z + halfItemDepth > this.size.height / 2) {
      return false; // Out of bounds
    }

    // Check for collision with existing rides (simplified)
    for (const ride of this.rides) {
        // AABB collision check (Axis-Aligned Bounding Box)
        const rideRadius = 5; // Assuming rides are roughly circular or square with this radius/half-width
        if (Math.abs(position.x - ride.position.x) * 2 < (itemSize.width + rideRadius*2) &&
            Math.abs(position.z - ride.position.z) * 2 < (itemSize.depth + rideRadius*2)) {
            return false; // Collision
        }
    }
    return true; // No collision, within bounds
  }
}