import { io, Socket } from "socket.io-client";
import { API_URL } from "./config";

let socket: Socket | null = null;

// Singleton manager for client-side socket connection
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}
