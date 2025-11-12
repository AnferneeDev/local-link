import { app, BrowserWindow } from "electron";
import path from "node:path"; // --- ADDED 'path' from 'node:path' for 'join' ---
import started from "electron-squirrel-startup";

// --- 1. IMPORT 'spawn' & 'join' ---
import { spawn, ChildProcess } from "child_process";
const { join } = path; // --- ADDED ---

// --- 2. CREATE A VARIABLE TO HOLD THE SERVER PROCESS ---
let nestProcess: ChildProcess | null = null; // --- ADDED ---

// --- 3. CREATE THE "START ENGINE" FUNCTION ---
function startNestServer() {
  console.log("Attempting to start NestJS server...");

  // Use 'node' to run the compiled NestJS app
  const nestCommand = "node";

  // This is the most reliable way to find the backend folder
  // It goes from your app's path (e.g., 'frontend') up one level
  // and then into 'backend/dist/main.js'.
  // NOTE: This assumes you have ALREADY built your NestJS app!
  const nestAppPath = join(app.getAppPath(), "../backend/dist/main.js");

  console.log(`NestJS app path resolved to: ${nestAppPath}`);

  // Start the process
  nestProcess = spawn(nestCommand, [nestAppPath]);

  if (!nestProcess) {
    console.error("Failed to spawn NestJS process.");
    return;
  }

  // --- This is the "Check Engine Light" ---
  // It logs NestJS output to your Electron console
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
// --- END OF ADDED FUNCTION ---

// --- 4. CREATE THE "STOP ENGINE" FUNCTION ---
function stopNestServer() {
  if (nestProcess) {
    console.log("Stopping NestJS server...");
    nestProcess.kill();
    nestProcess = null;
  }
}
// --- END OF ADDED FUNCTION ---

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
      // --- MODIFIED ---
      // 'path.join' was 'node:path', we just use 'join' now
      preload: join(__dirname, "preload.js"),
      // --- END MODIFIED ---
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // --- MODIFIED ---
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    // --- END MODIFIED ---
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // --- 5. START THE SERVER WHEN THE APP IS READY ---
  startNestServer(); // --- ADDED ---
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // --- 6. STOP THE SERVER WHEN THE APP CLOSES ---
    stopNestServer(); // --- ADDED ---
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- 7. (RECOMMENDED) STOP SERVER ON MACOS QUIT ---
app.on("before-quit", () => {
  stopNestServer();
});
// --- END OF ADDED CODE ---

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
