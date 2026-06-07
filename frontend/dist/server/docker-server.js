import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import * as qrcode from "qrcode";
import fs from "node:fs";
import path from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";
// --- State ---
let items = [];
let io = null;
let currentPort = parseInt(process.env.PORT || "5000", 10);
const uploadsPath = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
// --- Helper: Get Local IP ---
function getLocalIP() {
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
function notifyItemAdded(item) {
    if (io)
        io.emit("item-added", item);
}
function addFile(file) {
    const newFile = {
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
function addText(content) {
    const newText = {
        id: `${Date.now()}-text`,
        type: "text",
        content: content,
    };
    items.push(newText);
    notifyItemAdded(newText);
    console.log("Text added:", newText);
    return newText;
}
function getAllItems() {
    return items;
}
// --- Start Server ---
function startServer(port) {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
    }
    const serverApp = express();
    serverApp.use(cors());
    const httpServer = createServer(serverApp);
    io = new Server(httpServer, {
        cors: { origin: "*" },
    });
    serverApp.use(express.json());
    serverApp.use(express.urlencoded({ extended: true }));
    serverApp.use("/uploads", express.static(uploadsPath));
    const storage = multer.diskStorage({
        destination: uploadsPath,
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });
    const upload = multer({ storage: storage });
    serverApp.get("/items", (req, res) => {
        res.json(getAllItems());
    });
    serverApp.get("/app-data", async (req, res) => {
        const ip = getLocalIP() || "localhost";
        try {
            const url = `http://${ip}:${currentPort}`;
            const qrCodeDataUrl = await qrcode.toDataURL(url);
            res.json({ ip: url, qrCodeDataUrl, port: currentPort });
        }
        catch (err) {
            res.status(500).json({ error: "Failed to generate QR code" });
        }
    });
    serverApp.post("/text", (req, res) => {
        const { text } = req.body;
        if (!text)
            return res.status(400).send("Missing 'text' field");
        const savedText = addText(text);
        res.json({ message: "Text added", item: savedText });
    });
    serverApp.post("/upload", upload.array("files", 100), (req, res) => {
        const files = req.files;
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
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
    let clientAppPath = "";
    if (typeof __dirname !== "undefined") {
        clientAppPath = path.join(__dirname, "../renderer");
    }
    else {
        // Fallback for ES modules
        // @ts-ignore
        const __filename = fileURLToPath(import.meta.url);
        const _dirname = path.dirname(__filename);
        clientAppPath = path.join(_dirname, "../renderer");
    }
    // If running via ts-node directly from src/, path is dist/renderer
    if (!fs.existsSync(clientAppPath) && fs.existsSync(path.join(process.cwd(), "dist/renderer"))) {
        clientAppPath = path.join(process.cwd(), "dist/renderer");
    }
    else if (!fs.existsSync(clientAppPath) && fs.existsSync(path.join(process.cwd(), "frontend/dist/renderer"))) {
        clientAppPath = path.join(process.cwd(), "frontend/dist/renderer");
    }
    console.log(`Serving client web app from: ${clientAppPath}`);
    serverApp.use(express.static(clientAppPath));
    serverApp.get(/.*/, (req, res) => {
        res.sendFile(path.join(clientAppPath, "index.html"));
    });
    httpServer.on("error", (e) => {
        if (e.code === "EADDRINUSE") {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            startServer(port + 1);
        }
        else {
            console.error("Server error:", e);
        }
    });
    httpServer.listen(port, "0.0.0.0", () => {
        currentPort = port;
        console.log(`Local sharing server started on port ${currentPort}`);
        console.log(`Access the app locally at http://localhost:${currentPort}`);
    });
}
startServer(currentPort);
