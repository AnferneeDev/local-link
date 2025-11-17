import { io, Socket } from "socket.io-client";

export let socket: Socket;
export let API_BASE: string;

export const initializeApi = (port: number) => {
  const isElectron = !!(window as any).api;

  API_BASE = isElectron ? `http://localhost:${port}` : "";

  socket = io(API_BASE);

  console.log(`API initialized. Base: ${API_BASE}`);

  return socket;
};
