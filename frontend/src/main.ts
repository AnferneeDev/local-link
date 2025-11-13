import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";

// --- 1. IMPORT 'spawn' & 'join' ---
import { spawn, ChildProcess } from "child_process";
const { join } = path;

// --- 2. CREATE A VARIABLE TO HOLD THE SERVER PROCESS ---
let nestProcess: ChildProcess | null = null;

// --- 3. CREATE THE "START ENGINE" FUNCTION ---
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

// --- 4. CREATE THE "STOP ENGINE" FUNCTION ---
function stopNestServer() {
  if (nestProcess) {
    console.log("Stopping NestJS server...");
    nestProcess.kill();
    nestProcess = null;
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  // These variables are injected by your build tool (Electron Vite)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", () => {
  startNestServer();
  createWindow();
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopNestServer();
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Stop server on macOS quit
app.on("before-quit", () => {
  stopNestServer();
});
