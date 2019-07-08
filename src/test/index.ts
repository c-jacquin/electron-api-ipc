import { AppDependencies, AppOptions } from '../lib/types';
import { Container } from '../lib/container';

const { ipcMain, ipcRenderer } = require('electron-ipc-mock')();

function bootstrapTestIpcApi(dependencies: AppDependencies, options?: AppOptions): Container {
  return new Container(dependencies, { ipcInstance: ipcMain, ...options });
}

export { ipcMain, ipcRenderer, bootstrapTestIpcApi };
