import { io } from "socket.io-client";

export const API_BASE = import.meta.env.DEV ? "http://localhost:3000" : "";
export const socket = io(API_BASE);
