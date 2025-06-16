export default class Ride {
    type: string;
    capacity: number;
    status: 'operational' | 'closed';

    constructor(type: string, capacity: number) {
        this.type = type;
        this.capacity = capacity;
        this.status = 'operational';
    }

    startRide(): void {
        if (this.status === 'operational') {
            console.log(`${this.type} ride has started.`);
        } else {
            console.log(`${this.type} ride is closed.`);
        }
    }

    stopRide(): void {
        console.log(`${this.type} ride has stopped.`);
    }

    getRideInfo(): string {
        return `Ride Type: ${this.type}, Capacity: ${this.capacity}, Status: ${this.status}`;
    }
}