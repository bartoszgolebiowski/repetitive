/* eslint-disable @typescript-eslint/no-misused-promises */
import { EventEmitter } from 'events';
import type { Events, Handlers } from './initialize';

export interface IBus {
    on<T extends Events>(eventName: T, handler: Handlers[T]): void;
    emit<T extends Events>(eventName: T, ...args: Parameters<Handlers[T]>): void;
}

export class Bus implements IBus {
    private eventEmitter: EventEmitter;
    constructor(handlers: Handlers) {
        this.eventEmitter = new EventEmitter();
        Object.entries(handlers).forEach(([eventName, handler]) => {
            this.eventEmitter.on(eventName, handler);
        });
    }

    public on<T extends Events>(eventName: T, handler: Handlers[T]) {
        this.eventEmitter.on(eventName, handler);
    }

    public emit<T extends Events>(eventName: T, ...args: Parameters<Handlers[T]>): void {
        this.eventEmitter.emit(eventName, ...args);
    }
}


export const initializeBus = (handlers: Handlers) => {
    const bus = new Bus(handlers);
    return bus;
}
