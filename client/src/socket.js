import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"], // Optional: improve reliability
});

export default socket;
