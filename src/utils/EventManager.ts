import { GameEvent, EventCallback } from '../types'; // Assuming types are defined here

type EventName = GameEvent['type']; // Extracts all event type strings

interface EventListeners {
    [eventName: string]: EventCallback[];
}

export class EventManager {
  private events: { [key: string]: Function[] } = {};

  public on<E extends EventName>(eventName: E, callback: (payload?: any) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback as EventCallback);
  }

  public off<E extends EventName>(eventName: E, callback: (payload?: any) => void): void {
    if (!this.events[eventName]) {
      return;
    }
    this.events[eventName] = this.events[eventName].filter(
      (listener) => listener !== callback
    );
  }

  public emit<E extends EventName>(eventName: E, payload?: any): void {
    if (!this.events[eventName]) {
      return;
    }
    // console.log(`Emitting event: ${eventName}`, payload);
    this.events[eventName].forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  public once(event: string, callback: Function): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event as any, onceCallback);
    };
    this.on(event as any, onceCallback);
  }

  public removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  public listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }
}

export default EventManager;