"use strict";const e=require("electron");e.contextBridge.exposeInMainWorld("api",{getAppData:()=>e.ipcRenderer.invoke("get-app-data")});
