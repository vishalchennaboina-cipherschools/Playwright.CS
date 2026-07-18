import { io, Socket } from "socket.io-client";
import { logger } from "./logger";
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
    logger.info("Connected to backend Socket.IO server", { category: logger.CATEGORIES.SOCKET });
  });

  socket.on("disconnect", (reason) => {
    logger.info(`Disconnected from backend Socket.IO server: ${reason}`, { category: logger.CATEGORIES.SOCKET });
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
