// src/socket.js
import { io } from "socket.io-client";

/**
 * Use VITE_SOCKET_URL first (explicit), fall back to VITE_API_BASE_URL,
 * then fall back to same origin ("/") to be resilient in different envs.
 */
const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "/";

const socket = io(socketUrl, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
