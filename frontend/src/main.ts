import { app, BrowserWindow, shell } from "electron";
// --- 1. FIX: Import 'path' and 'join' correctly ---
import path, { join } from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";

import { spawn, ChildProcess } from "child_process";
// const { join } = path; // <-- 2. DELETED THIS BAD LINE

let nestProcess: ChildProcess | null = null;

function startNestServer() {
  console.log("Attempting to start NestJS server...");
  const nestCommand = "node";
  const nestAppPath = join(app.getAppPath(), "../backend/dist/main.js");
  console.log(`NestJS app path resolved to: ${nestAppPath}`);

  nestProcess = spawn(nestCommand, [nestAppPath]);

  if (!nestProcess) {
    console.error("Failed to spawn NestJS process.");
    return;
  }
  nestProcess.stdout?.on("data", (data) => {
    console.log(`[NestJS STDOUT]: ${data}`);
  });
  nestProcess.stderr?.on("data", (data) => {
    console.error(`[NestJS STDERR]: ${data}`);
  });
  nestProcess.on("close", (code) => {
    console.log(`NestJS process exited with code ${code}`);
  });
}

function stopNestServer() {
  if (nestProcess) {
    console.log("Stopping NestJS server...");
    nestProcess.kill();
    nestProcess = null;
  }
}

function deleteUploadsFolder() {
  const uploadsPath = join(app.getAppPath(), "../uploads");
  console.log(`Attempting to delete uploads folder at: ${uploadsPath}`);
  try {
    if (fs.existsSync(uploadsPath)) {
      fs.rmSync(uploadsPath, { recursive: true, force: true });
      console.log("Uploads folder deleted successfully.");
    } else {
      console.log("Uploads folder not found, nothing to delete.");
    }
  } catch (error) {
    console.error("Error deleting uploads folder:", error);
  }
}

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"), // <-- 3. This 'join' now works
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)); // <-- 3. This 'join' now works
  }

  mainWindow.webContents.openDevTools();
};

app.on("ready", () => {
  startNestServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopNestServer();
    deleteUploadsFolder();
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  stopNestServer();
  deleteUploadsFolder();
});
