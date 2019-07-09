declare module 'electron-ipc-mock' {
  import { IpcMain, IpcRenderer } from 'electron';

  const factory: () => { ipcMain: IpcMain; ipcRenderer: IpcRenderer };

  export default factory;
}
