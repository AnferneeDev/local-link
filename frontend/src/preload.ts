import { contextBridge, ipcRenderer } from "electron";

// This exposes 'window.api.getAppData()' to your React code
contextBridge.exposeInMainWorld("api", {
  getAppData: () => ipcRenderer.invoke("get-app-data"),
});
