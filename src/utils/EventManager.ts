import { GameEvent, EventCallback } from '../types'; // Assuming types are defined here

type EventName = GameEvent['type']; // Extracts all event type strings

interface EventListeners {
    [eventName: string]: EventCallback[];
}

export default class EventManager {
    private listeners: EventListeners = {};

    public on<E extends EventName>(eventName: E, callback: (payload: Extract<GameEvent, { type: E }>['payload']) => void): void {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback as EventCallback);
    }

    public off<E extends EventName>(eventName: E, callback: (payload: Extract<GameEvent, { type: E }>['payload']) => void): void {
        if (!this.listeners[eventName]) {
            return;
        }
        this.listeners[eventName] = this.listeners[eventName].filter(
            (listener) => listener !== callback
        );
    }

    public emit<E extends EventName>(eventName: E, payload?: Extract<GameEvent, { type: E }>['payload']): void {
        if (!this.listeners[eventName]) {
            return;
        }
        // console.log(`Emitting event: ${eventName}`, payload);
        this.listeners[eventName].forEach((callback) => {
            try {
                callback(payload);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }
}