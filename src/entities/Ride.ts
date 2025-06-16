import { Position, BuildingCost, RideConfig } from '@/types';

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
    public isOperating: boolean = true;
    public currentRiders: number = 0;
    public rideTime: number; // in seconds
    public currentTime: number = 0;

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
    }

    private calculateRideTime(): number {
        // Different ride types have different durations
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
        // Base price on excitement and intensity
        return Math.max(1, Math.round((this.excitement + this.intensity) / 2));
    }

    public update(deltaTime: number): void {
        if (!this.isOperating) return;

        this.currentTime += deltaTime;

        // Cycle riders through the ride
        if (this.currentTime >= this.rideTime) {
            this.currentTime = 0;
            this.currentRiders = Math.min(this.capacity, this.getWaitingVisitors());
        }
    }

    private getWaitingVisitors(): number {
        // Simulate visitors wanting to ride based on excitement and current popularity
        const baseAttraction = this.excitement / 10;
        const randomFactor = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
        return Math.floor(this.capacity * baseAttraction * randomFactor);
    }

    public getOperatingCost(): number {
        return this.cost.maintenance;
    }

    public canOperate(): boolean {
        return this.isOperating;
    }

    public setOperating(operating: boolean): void {
        this.isOperating = operating;
        if (!operating) {
            this.currentRiders = 0;
            this.currentTime = 0;
        }
    }

    // Static factory methods for different ride types
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