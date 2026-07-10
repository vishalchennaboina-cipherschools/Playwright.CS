import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const url = getApiBaseUrl().replace(/\/+$/, "");
  
  socket = io(url, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.log("Connected to backend Socket.IO server");
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from backend Socket.IO server:", reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
