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

export function bootstrapIpcApi(dependencies: AppDependencies, options?: AppOptions): Container {
  return new Container(dependencies, options);
}
