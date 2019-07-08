/* tslint:disable:no-empty */
import 'reflect-metadata';
import { Container } from 'inversify';

import { EVENT_PREFIX } from './ipc-decorators';
import { AppDependencies, ControllerMeta } from './bootstrap';
import { EventEmitter } from 'events';

const ipcMain = new EventEmitter();

export const send = () => {};

export function bootstrapTestApp({ controllers, services }: AppDependencies): Container {
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
        ipcMain.on(eventName, (event: any, data: any) => {
          const result = controller[name](data, send, event);

          if (result instanceof Promise) {
            result.catch((err: any) => {
              process.stderr.write(err);
              throw err;
            });
          }
        });
      });
    });
  }

  return container;
}
