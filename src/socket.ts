import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Singleton manager for client-side socket connection
export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}
