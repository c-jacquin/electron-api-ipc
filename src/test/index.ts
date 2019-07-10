import ipcMock from 'electron-ipc-mock';

import { AppDependencies, AppOptions } from '../lib/bootstrap';
import { Container } from '../lib/container';

const { ipcMain, ipcRenderer } = ipcMock();

function bootstrapTestIpcApi(dependencies: AppDependencies, options?: AppOptions): Container {
  return new Container(dependencies, { ipcInstance: ipcMain, ...options });
}

export { ipcMain, ipcRenderer, bootstrapTestIpcApi };
