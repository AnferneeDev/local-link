import { app, BrowserWindow, shell } from "electron"; // <-- 1. IMPORT shell
import path from "node:path";
import fs from "node:fs"; // <-- 2. IMPORT fs (File System)
import started from "electron-squirrel-startup";

import { spawn, ChildProcess } from "child_process";
const { join } = path;

let nestProcess: ChildProcess | null = null;

function startNestServer() {
  console.log("Attempting to start NestJS server...");
  const nestCommand = "node";
  // This path assumes your 'frontend' build output is in 'dist/main'
  // It goes up from 'frontend/dist/main' to 'frontend', then to 'local-link' root
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

// --- 3. NEW: "DELETE UPLOADS" FUNCTION ---
function deleteUploadsFolder() {
  // Find the 'uploads' folder at the root of your project
  const uploadsPath = join(app.getAppPath(), "../uploads");

  console.log(`Attempting to delete uploads folder at: ${uploadsPath}`);

  try {
    // Check if the folder exists
    if (fs.existsSync(uploadsPath)) {
      // Delete the folder and everything inside it
      fs.rmSync(uploadsPath, { recursive: true, force: true });
      console.log("Uploads folder deleted successfully.");
    } else {
      console.log("Uploads folder not found, nothing to delete.");
    }
  } catch (error) {
    console.error("Error deleting uploads folder:", error);
  }
}
// --- END OF NEW FUNCTION ---

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      sandbox: false, // Often needed for the handler to work
    },
  });

  // --- 4. NEW: "OPEN IN BROWSER" HANDLER ---
  // This intercepts all "new window" requests (like target="_blank")
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url); // Opens the URL in the system browser
    return { action: "deny" }; // Prevents Electron from opening a new window
  });
  // --- END OF NEW HANDLER ---

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

app.on("ready", () => {
  startNestServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // --- 5. CALL STOP & DELETE ---
    stopNestServer();
    deleteUploadsFolder(); // Delete the folder
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  // --- 6. CALL STOP & DELETE (for macOS) ---
  stopNestServer();
  deleteUploadsFolder(); // Also delete on macOS quit
});
