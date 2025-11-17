import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getAppData: () => ipcRenderer.invoke("get-app-data"),
});
