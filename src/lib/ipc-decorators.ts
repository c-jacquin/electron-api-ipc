import { injectable } from 'inversify';
import {} from 'type-fest';
import { ClassDecorator, MethodDecorator, ControllerMeta } from './bootstrap';

/**
 * the key of the metadata
 */
export const EVENT_PREFIX = Symbol('$$event-prefix');

/**
 * Decorate a class and make it an ipc controller for the main process of an electron app
 *
 * @remarks
 * if no methods of the class are decorated with IpcEvent, it will throw an error
 *
 * @param prefix - all the events manage by this controller will be prefixed by this string: prefix-eventName
 *
 */
export const IpcController: ClassDecorator = (prefix?: string) => {
  /**
   * Get the metadata attached to the class by IpcEvent decorator and add the prefix to eventNames if prefix is defined
   *
   * @param target - the instance of the decorated class
   *
   * @returns - the decorated class ready to use with bootstrapIpcApi or inversify Container
   */
  return (target: any) => {
    const proto = target.prototype;

    let events = Reflect.getMetadata(EVENT_PREFIX, proto) || [];
    if (!events.length) {
      throw new Error(
        `The controller ${proto.constructor.name} has no event registered, you must register at least one`
      );
    }

    if (prefix) {
      events = events.map((event: any) => ({
        eventName: prefix ? `${prefix}-${event.eventName}` : event.eventName,
        name: event.name
      }));

      Reflect.defineMetadata(EVENT_PREFIX, events, target);
    }

    return injectable()(target);
  };
};

interface IpcEventOptions {
  once: boolean;
}

/**
 *  Decorate a controller method in order to make it an ipc event handler
 *
 * @remark
 * (for js user) if no params id provided, it will trigger an error
 *
 * @param eventName - a string representing the event to be handled by the decorated method
 */
export const IpcEvent: MethodDecorator = (eventName: string, options?: IpcEventOptions) => {
  /**
   * Define metadata for this method (it will be utilised by the bootstrap function)
   *
   * @param target - the instance of the class which own the decorated method
   * @param name  - the name of the decorated method
   */
  return (target: any, name: string) => {
    if (!eventName) {
      throw new Error(
        `You must specify an event name for method ${name} of class ${target.constructor.name}`
      );
    }
    const meta = Reflect.getMetadata(EVENT_PREFIX, target) || [];
    const eventMeta: ControllerMeta = { eventName, name };

    if (options && options.once) {
      eventMeta.once = options.once;
    }

    meta.push(eventMeta);
    Reflect.defineMetadata(EVENT_PREFIX, meta, target);
  };
};
