import { injectable } from 'inversify';

export const EVENT_PREFIX = Symbol('$$event-prefix');

export function IpcController(prefix = '') {
  return (target: any) => {
    const proto = target.prototype;

    const eventDefs = Reflect.getMetadata(EVENT_PREFIX, proto) || [];
    const events = eventDefs.map((event: any) => ({
      eventName: `${prefix}-${event.eventName}`,
      name: event.name
    }));

    Reflect.defineMetadata(EVENT_PREFIX, events, target);
    return injectable()(target);
  };
}

export function IpcEvent(eventName: string) {
  return (target: any, name: string) => {
    if (!eventName) {
      throw new Error(`you must specify an event name for method ${name} of class ${target.name}`);
    }
    const meta = Reflect.getMetadata(EVENT_PREFIX, target) || [];
    meta.push({ eventName, name });

    Reflect.defineMetadata(EVENT_PREFIX, meta, target);
  };
}
