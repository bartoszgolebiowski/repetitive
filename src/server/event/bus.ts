/* eslint-disable @typescript-eslint/no-misused-promises */
import { EventEmitter } from 'events';
import type { Events, Handlers } from './initialize';

export interface IBus {
    on<T extends Events>(eventName: T, handler: Handlers[T]): void;
    emit<T extends Events>(eventName: T, ...args: Parameters<Handlers[T]>): void;
}
export class Bus implements IBus {
    private eventEmitter: EventEmitter;
    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public on<T extends Events>(eventName: T, handler: Handlers[T]) {
        this.eventEmitter.on(eventName, handler);
    }

    public emit<T extends Events, K extends Handlers>(eventName: T, ...args: Parameters<K[T]>): void {
        this.eventEmitter.emit(eventName, ...args);
    }
}

export const initializeBus = (handlers: (bus: IBus) => Handlers) => {
    const bus = new Bus();
    Object.entries(handlers(bus)).forEach(([eventName, handler]) => {
        bus.on(eventName as keyof Handlers, handler);
    });
    return bus;
}
