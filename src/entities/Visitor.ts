export class Visitor {
    name: string;
    age: number;
    currentLocation: string;

    constructor(name: string, age: number, currentLocation: string) {
        this.name = name;
        this.age = age;
        this.currentLocation = currentLocation;
    }

    moveTo(newLocation: string): void {
        this.currentLocation = newLocation;
    }

    getStatus(): string {
        return `${this.name}, Age: ${this.age}, Current Location: ${this.currentLocation}`;
    }

    interactWithRide(ride: any): void {
        // Logic for interacting with a ride
    }
}