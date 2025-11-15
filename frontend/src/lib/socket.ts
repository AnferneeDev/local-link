import { io, Socket } from "socket.io-client";

export let socket: Socket;
export let API_BASE: string;

/**
 * Initializes the API base URL and the Socket.IO connection.
 * This must be called once at app startup from a React component.
 */
export const initializeApi = (port: number) => {
  const isElectron = !!(window as any).api;

  // Electron app connects to localhost:PORT
  // Browser/phone connects to the server it was loaded from ("")
  API_BASE = isElectron ? `http://localhost:${port}` : "";

  socket = io(API_BASE);

  console.log(`API initialized. Base: ${API_BASE}`);

  // Return the socket for convenience
  return socket;
};
