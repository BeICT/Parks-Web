import { GameStats, Position } from '../types';
import Ride from './Ride';
import { Visitor } from './Visitor';

export class Park {
  public name: string;
  public stats: GameStats;
  public rides: Ride[] = [];
  public visitors: Visitor[] = [];
  public size: { width: number; height: number };
  private lastUpdateTime: number = 0;
  private gameDate: Date;
  private gameSpeed: number = 1;
  private isPaused: boolean = false;

  constructor(name: string = 'My Amazing Park') {
    this.name = name;
    this.stats = {
      money: 50000,
      visitors: 0,
      happiness: 75,
      reputation: 500
    };
    this.size = { width: 100, height: 100 };
    this.gameDate = new Date(1, 9, 1); // October Year 1
    this.lastUpdateTime = Date.now();
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
    if (this.isPaused) return;

    const currentTime = Date.now();
    const realDeltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    // Update game time (accelerated)
    const gameTimeStep = realDeltaTime * this.gameSpeed * 60; // 1 real second = 1 game minute at normal speed
    this.gameDate = new Date(this.gameDate.getTime() + gameTimeStep * 1000);

    // Update park economics
    this.updateEconomics(realDeltaTime * this.gameSpeed);
    
    // Update visitor simulation
    this.updateVisitors(realDeltaTime * this.gameSpeed);
    
    // Update rides
    this.updateRides(realDeltaTime * this.gameSpeed);
    
    // Random events (very rare)
    if (Math.random() < 0.0001 * realDeltaTime) {
      this.triggerRandomEvent();
    }
  }

  private updateEconomics(deltaTime: number): void {
    // Income from rides
    let rideIncome = 0;
    this.rides.forEach(ride => {
      if (ride.isOperational) {
        rideIncome += ride.ticketPrice * ride.ridersPerHour * (deltaTime / 3600);
      }
    });

    // Operating costs
    const staffCosts = this.rides.length * 5 * (deltaTime / 3600); // $5 per ride per hour
    const maintenanceCosts = this.rides.length * 2 * (deltaTime / 3600); // $2 per ride per hour

    // Park entrance fees
    const entranceFees = this.visitors.length * 0.1 * (deltaTime / 3600); // Small entrance fee

    this.stats.money += rideIncome + entranceFees - staffCosts - maintenanceCosts;
  }

  private updateVisitors(deltaTime: number): void {
    // Simulate visitor arrivals based on park reputation
    const arrivalRate = Math.max(0, (this.stats.reputation / 1000) * 10); // Base arrival rate
    const newVisitors = Math.floor(arrivalRate * deltaTime);
    
    for (let i = 0; i < newVisitors; i++) {
      if (this.visitors.length < 500) { // Park capacity limit
        this.spawnVisitor();
      }
    }

    // Update existing visitors
    this.visitors.forEach(visitor => {
      visitor.update(deltaTime);
    });

    // Remove visitors who are leaving
    this.visitors = this.visitors.filter(visitor => !visitor.isLeaving);
    this.stats.visitors = this.visitors.length;

    // Update happiness based on visitor satisfaction
    if (this.visitors.length > 0) {
      const avgHappiness = this.visitors.reduce((sum, v) => sum + v.happiness, 0) / this.visitors.length;
      this.stats.happiness = Math.round(avgHappiness);
    }
  }

  private updateRides(deltaTime: number): void {
    this.rides.forEach(ride => {
      ride.update(deltaTime);
      
      // Random breakdowns
      if (Math.random() < 0.001 * deltaTime && ride.isOperational) {
        ride.breakdown();
        console.log(`${ride.name} has broken down!`);
      }
    });
  }

  private spawnVisitor(): void {
    const visitor = new Visitor(
      `Guest ${Math.floor(Math.random() * 9999)}`,
      Math.floor(Math.random() * 60) + 10, // Age 10-69
      { x: 0, y: 0, z: -90 } // Start at park entrance
    );
    this.addVisitor(visitor);
  }

  private triggerRandomEvent(): void {
    const events = [
      () => {
        this.stats.money += 1000;
        console.log('Random event: Local newspaper featured your park! +$1000');
      },
      () => {
        this.updateReputation(10);
        console.log('Random event: Celebrity visited your park! +10 reputation');
      },
      () => {
        if (this.rides.length > 0) {
          const ride = this.rides[Math.floor(Math.random() * this.rides.length)];
          ride.breakdown();
          console.log(`Random event: ${ride.name} experienced technical difficulties!`);
        }
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event();
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public setGameSpeed(speed: number): void {
    this.gameSpeed = Math.max(1, Math.min(4, speed));
  }

  public getFormattedDate(): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[this.gameDate.getMonth()]} Year ${this.gameDate.getFullYear()}`;
  }

  public updateReputation(change: number): void {
    this.stats.reputation = Math.max(0, Math.min(1000, this.stats.reputation + change));
  }

  public getFormattedTime(): string {
    const hours = this.gameDate.getHours();
    const minutes = this.gameDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}