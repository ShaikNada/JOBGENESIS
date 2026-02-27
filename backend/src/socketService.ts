import http from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export function initializeSocket(server: http.Server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("join_mission", ({ missionId }: { missionId: string }) => {
      if (missionId) {
        socket.join(missionId);
        console.log(`➡️ Socket ${socket.id} joined mission ${missionId}`);
      }
    });

    socket.on(
      "code_update",
      ({ missionId, code }: { missionId: string; code: string }) => {
        if (missionId) {
          socket.to(missionId).emit("code_update", { code, sender: socket.id });
        }
      }
    );

    socket.on(
      "cursor_move",
      ({ missionId, cursor }: { missionId: string; cursor: any }) => {
        if (missionId) {
          socket.to(missionId).emit("cursor_move", { cursor, sender: socket.id });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
}
