import 'reflect-metadata';
import { IpcMain, Event, ipcMain } from 'electron';
import { Container as InversifyContainer } from 'inversify';
import { Class } from 'type-fest';

import { EVENT_PREFIX } from './ipc-decorators';
import { AppOptions, AppDependencies, Logger, ControllerMeta, ServiceProvider } from './bootstrap';

export const $$logger = Symbol('$$logger');

/**
 * Augmented version of an inversify container wich allow to listen and unlisten for ipc events
 */
export class Container extends InversifyContainer {
  private controllers: Class[];
  private services: ServiceProvider[];
  private ipc: IpcMain;
  private logger?: Logger;
  public onError?: (err: Error) => void;
  public isListening = false;

  /**
   * @constructor
   * @param dependencies - the dependencies of your app, both services and controller will end up in an inversify container
   * @param options - options to customize the behavior
   */
  constructor(dependencies: AppDependencies, options: AppOptions = {}) {
    super({ skipBaseClassChecks: true });
    this.controllers = dependencies.controllers || [];
    this.services = dependencies.services || [];
    this.ipc = options.ipcInstance || ipcMain;

    this.setOptions(options);
  }

  registerService(service: ServiceProvider) {
    if (this.isListening) {
      throw new Error('unable to register new service while listening');
    }
    this.services.push(service);
  }

  registerController(controller: Class) {
    if (this.isListening) {
      throw new Error('unable to register new controller while listening');
    }
    this.controllers.push(controller);
  }

  setOptions(options: AppOptions) {
    if (this.isListening) {
      throw new Error('unable to set options while listening');
    }
    this.logger = options.logger;
    this.onError = options.onError;

    if (options.logger) {
      this.bind($$logger).toConstantValue(options.logger);
    }
  }

  /**
   * start the app, make all the registered event to listen for ipc.
   */
  listen() {
    this.services.forEach(({ provide, useClass, useValue, useFactory, useProvider }) => {
      if (useClass) this.bind(provide).to(useClass);
      else if (useValue) this.bind(provide).toConstantValue(useValue);
      else if (useFactory) this.bind(provide).toFactory(useFactory);
      else if (useProvider) this.bind(provide).toProvider(useProvider);
    });

    this.controllers.forEach(Controller => {
      this.bind(Controller).to(Controller);
      const meta: ControllerMeta[] = Reflect.getMetadata(EVENT_PREFIX, Controller);
      const controller = this.get(Controller);

      meta.forEach(({ eventName, name, once }) => {
        const addListener = once ? this.ipc.once : this.ipc.on;

        addListener.bind(this.ipc)(eventName, (event: Event, data: any) => {
          if (this.logger) {
            this.logger.log(`incomming event => ${eventName}`);
          }
          const result = controller[name](event, data);

          if (result instanceof Promise) {
            result.catch((err: any) => {
              if (this.logger) {
                this.logger.error(`error in event ${eventName} => ${err.message}`);
              }
              if (this.onError) {
                this.onError(err);
              }
            });
          }
        });
      });
    });
    this.isListening = true;
  }

  /**
   * unlisten for all the registered events
   */
  close() {
    this.controllers.forEach(Controller => {
      const meta: ControllerMeta[] = Reflect.getMetadata(EVENT_PREFIX, Controller);

      meta.forEach(({ eventName }) => {
        this.ipc.removeAllListeners(eventName);
      });
    });

    this.isListening = false;
  }
}
