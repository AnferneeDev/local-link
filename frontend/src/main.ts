import {
  app,
  BrowserWindow,
  shell,
  dialog,
  ipcMain,
  session,
  globalShortcut, // <-- 1. IMPORTED globalShortcut
} from "electron";
import path from "node:path";
import fs from "node:fs";
import { networkInterfaces } from "node:os"; // For getting IP
import express from "express"; // For the server
import cors from "cors"; // For CORS
import { createServer } from "http"; // For the server
import { Server } from "socket.io"; // For websockets
import multer from "multer"; // For file uploads
import * as qrcode from "qrcode"; // For QR code
import started from "electron-squirrel-startup";

// App: Local Link
// Author: Anfernee

const isDev = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;

// --- Types (Copied from your NestJS service) ---
export interface SharedFile {
  id: string;
  type: "file";
  filename: string;
  path: string;
}
export interface SharedText {
  id: string;
  type: "text";
  content: string;
}
export type SharedItem = SharedFile | SharedText;

// --- In-Memory "Database" ---
let items: SharedItem[] = [];
let io: Server | null = null;

// --- Pathing (uploads folder) ---
const uploadsPath = isDev ? path.join(app.getAppPath(), "../uploads") : path.join(path.dirname(app.getPath("exe")), "uploads");

// --- Single Instance Lock (Already present and correct) ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let isQuitting = false;
const quitTranslations = {
  en: {
    title: "Quit Local Link?",
    message: "The files you haven't saved will be deleted.",
    buttons: ["OK", "Cancel"],
  },
  es: {
    title: "¿Salir de Local Link?",
    message: "Los archivos que no hayas guardado serán eliminados.",
    buttons: ["Aceptar", "Cancelar"],
  },
};

// --- Helper: Get Local IP ---
function getLocalIP(): string | null {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInfo = nets[name];
    if (netInfo) {
      for (const net of netInfo) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return null;
}

// --- Helper: File Service Logic ---
function notifyItemAdded(item: SharedItem) {
  if (io) io.emit("item-added", item);
}
function notifyItemsCleared() {
  if (io) io.emit("items-cleared");
}

function addFile(file: Express.Multer.File): SharedFile {
  const newFile: SharedFile = {
    id: `${Date.now()}-${file.filename}`,
    type: "file",
    filename: file.filename,
    path: file.path,
  };
  items.push(newFile);
  notifyItemAdded(newFile);
  console.log("File added:", newFile);
  return newFile;
}

function addText(content: string): SharedText {
  const newText: SharedText = {
    id: `${Date.now()}-text`,
    type: "text",
    content: content,
  };
  items.push(newText);
  notifyItemAdded(newText);
  console.log("Text added:", newText);
  return newText;
}

function getAllItems(): SharedItem[] {
  return items;
}

// --- Start The New Server ---
function startLocalServer() {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  const serverApp = express();
  serverApp.use(cors());
  const httpServer = createServer(serverApp);
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // Middlewares
  serverApp.use(express.json());
  serverApp.use(express.urlencoded({ extended: true }));

  // Serve /uploads folder for images/audio
  serverApp.use("/uploads", express.static(uploadsPath));

  // Configure Multer
  const storage = multer.diskStorage({
    destination: uploadsPath,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });

  // --- Express Routes ---
  serverApp.get("/items", (req, res) => {
    res.json(getAllItems());
  });

  serverApp.get("/app-data", async (req, res) => {
    const ip = getLocalIP();
    if (!ip) {
      return res.status(500).json({ error: "No IP found" });
    }
    try {
      const url = `http://${ip}:3000`;
      const qrCodeDataUrl = await qrcode.toDataURL(url);
      res.json({ ip: url, qrCodeDataUrl });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  serverApp.post("/text", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).send("Missing 'text' field");
    const savedText = addText(text);
    res.json({ message: "Text added", item: savedText });
  });

  serverApp.post("/upload", upload.array("files", 100), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).send("No files uploaded");
    }
    const savedFiles = files.map((file) => addFile(file));
    res.json({ message: "Files uploaded", items: savedFiles });
  });

  serverApp.get("/download/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsPath, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }
    res.download(filePath);
  });

  // WebSocket Logic
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Serve React App to Clients (Catch-all)
  if (!isDev) {
    const clientAppPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}`);
    console.log(`Serving client web app from: ${clientAppPath}`);
    serverApp.use(express.static(clientAppPath));
    serverApp.get(/.*/, (req, res) => {
      res.sendFile(path.join(clientAppPath, "index.html"));
    });
  }

  // Start Server
  httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Local sharing server started on port 3000");
  });
}

// --- IPC Handler for React App ---
ipcMain.handle("get-app-data", async () => {
  const ip = getLocalIP();
  if (!ip) {
    throw new Error("Could not find local IP address.");
  }
  const url = `http://${ip}:3000`;
  const qrCodeDataUrl = await qrcode.toDataURL(url);
  return { ip: url, qrCodeDataUrl };
});

// --- File Deletion Logic ---
function deleteUploadsFolder() {
  console.log(`Attempting to delete uploads folder at: ${uploadsPath}`);
  items = [];
  notifyItemsCleared();
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
  const iconPath = isDev
    ? path.join(process.cwd(), "public", "icon.ico") // Using .ico as discussed
    : path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/icon.ico`); // Using .ico

  const prodIconExists = !isDev && fs.existsSync(iconPath);

  const mainWindow = new BrowserWindow({
    title: "Local Link",
    width: 900,
    height: 750,
    icon: prodIconExists ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // --- 2. REMOVE MENU BAR ---
  mainWindow.setMenu(null);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools(); // Still open in dev
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

// --- CSP (Content Security Policy) ---
app.on("session-created", (session) => {
  session.webRequest.onHeadersReceived((details, callback) => {
    const baseCSP = ["default-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data:"];
    const connectSrc = ["'self'", "http://localhost:3000", "ws://localhost:3000"];
    if (isDev) {
      baseCSP.push("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      connectSrc.push(MAIN_WINDOW_VITE_DEV_SERVER_URL.replace(/\/$/, ""));
    } else {
      baseCSP.push("script-src 'self'");
    }
    baseCSP.push(`connect-src ${connectSrc.join(" ")}`);
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [baseCSP.join("; ")],
      },
    });
  });
});

// --- App Lifecycle ---
app.on("ready", () => {
  startLocalServer();
  createWindow();

  // --- 3. ADD CUSTOM DEVTOOLS SHORTCUT ---
  globalShortcut.register("CommandOrControl+Shift+Alt+D", () => {
    BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// --- 3. UNREGISTER SHORTCUT ON QUIT ---
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", (e) => {
  if (isQuitting) return;
  e.preventDefault();

  const lang = app.getLocale().startsWith("es") ? "es" : "en";
  const dialogText = quitTranslations[lang];

  const buttonIndex = dialog.showMessageBoxSync(BrowserWindow.getAllWindows()[0], {
    type: "question",
    title: dialogText.title,
    message: dialogText.message,
    buttons: dialogText.buttons,
    defaultId: 0,
    cancelId: 1,
  });

  if (buttonIndex === 0) {
    isQuitting = true;
    deleteUploadsFolder();
    app.quit();
  }
});
