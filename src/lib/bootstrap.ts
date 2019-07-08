import 'reflect-metadata';
import { ipcMain, Event } from 'electron';
import logger from 'electron-log';
import { Container } from 'inversify';
import { Class } from 'type-fest';

import { EVENT_PREFIX } from './ipc-decorators';

export interface ServiceProvider {
  provide: symbol | Class | string;
  useFactory: () => any;
  useClass?: Class;
  useValue?: any;
}

export interface AppDependencies {
  controllers?: Class[];
  services?: ServiceProvider[];
}

export interface ControllerMeta {
  eventName: string;
  name: string;
}

export function bootstrap({ controllers, services }: AppDependencies): Container {
  const container = new Container({ skipBaseClassChecks: true });

  if (services) {
    services.forEach(({ provide, useClass, useValue, useFactory }) => {
      if (useClass) container.bind(provide).to(useClass);
      else if (useValue) container.bind(provide).toConstantValue(useValue);
      else if (useFactory) container.bind(provide).toFactory(useFactory);
    });
  }

  if (controllers) {
    controllers.forEach(Controller => {
      container.bind(Controller).to(Controller);
      const meta: ControllerMeta[] = Reflect.getMetadata(EVENT_PREFIX, Controller);
      const controller = container.get(Controller);

      meta.forEach(({ eventName, name }) => {
        ipcMain.on(eventName, (event: Event, data: any) => {
          const result = controller[name](data, event.sender, event);

          if (result instanceof Promise) {
            result.catch((err: any) => {
              logger.error(err);
            });
          }
        });
      });
    });
  }

  return container;
}
