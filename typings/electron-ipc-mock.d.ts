declare module 'electron-ipc-mock' {
  import { IpcMain, IpcRenderer } from 'electron';
  const ipcMain: IpcMain;
  const ipcRenderer: IpcRenderer;

  export { ipcMain, ipcRenderer };
}
