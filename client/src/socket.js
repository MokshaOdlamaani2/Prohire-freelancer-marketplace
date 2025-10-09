// socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ["websocket"], // Force WebSocket connection
  withCredentials: true,
});

export default socket;
