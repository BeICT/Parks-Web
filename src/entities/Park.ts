export class Park {
    name: string;
    rides: Ride[];

    constructor(name: string) {
        this.name = name;
        this.rides = [];
    }

    addRide(ride: Ride): void {
        this.rides.push(ride);
    }

    removeRide(ride: Ride): void {
        this.rides = this.rides.filter(r => r !== ride);
    }

    getVisitors(): number {
        return this.rides.reduce((total, ride) => total + ride.getCurrentVisitors(), 0);
    }
}

class Ride {
    type: string;
    capacity: number;
    status: string;
    currentVisitors: number;

    constructor(type: string, capacity: number) {
        this.type = type;
        this.capacity = capacity;
        this.status = 'stopped';
        this.currentVisitors = 0;
    }

    startRide(): void {
        this.status = 'running';
    }

    stopRide(): void {
        this.status = 'stopped';
    }

    getRideInfo(): string {
        return `Type: ${this.type}, Capacity: ${this.capacity}, Status: ${this.status}`;
    }

    getCurrentVisitors(): number {
        return this.currentVisitors;
    }
}