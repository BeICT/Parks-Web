export interface ParkData {
    name: string;
    rides: RideData[];
    visitors: VisitorData[];
}

export interface RideData {
    type: string;
    capacity: number;
    status: 'operational' | 'under_maintenance' | 'closed';
}

export interface VisitorData {
    name: string;
    age: number;
    currentLocation: string;
}