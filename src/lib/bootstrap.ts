import { IpcMain } from 'electron';
import { Class } from 'type-fest';

import { Container } from './container';

export interface ServiceProvider {
  provide: symbol | Class | string;
  useFactory?: () => any;
  useClass?: Class;
  useValue?: any;
}

export interface AppDependencies {
  controllers: Class[];
  services?: ServiceProvider[];
}

export interface AppOptions {
  ipcInstance?: IpcMain;
  logger?: Logger;
  onError?(err: Error): void;
}

export interface ControllerMeta {
  eventName: string;
  name: string;
}

export interface Logger {
  log(message: string): void;
  error(err: any): void;
}

export type ClassDecorator<Target = any, Params = string, Return = void> = (
  params?: Params
) => (target: InstanceType<Class<Target>>) => Return;

export type MethodDecorator<Target = any, Params = string, Return = void> = (
  params: Params
) => (target: InstanceType<Class<Target>>, name: string) => Return;

/**
 * Bootstrap the app and return an augmented inversifyjs container
 *
 * @param dependencies - the dependencies of the app: controllers and services, services must be inversifyjs ready
 * @param options - a small set of options to customize the behavior (logger, mock ...)
 *
 * @example
 * ```typescript
 * import { bootstrapIpcApi } from 'electron-api-ipc';
 *
 * const app = bootstrapIpcApi({ controllers: [...] });
 *
 * app.listen();
 *
 * // ready to receive events from renderer process
 *
 * ```
 */
export function bootstrapIpcApi(dependencies: AppDependencies, options?: AppOptions): Container {
  return new Container(dependencies, options);
}
