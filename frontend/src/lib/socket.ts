import { io } from "socket.io-client";

// --- THIS IS THE FIX ---

// This checks if we are running inside Electron (window.api exists)
const isElectron = !!(window as any).api;

// If in Electron, use localhost.
// If in a browser (phone), use a relative path ("")
export const API_BASE = isElectron ? "http://localhost:3000" : "";

// --- END OF FIX ---

export const socket = io(API_BASE);
