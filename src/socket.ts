import { io } from "socket.io-client";

// socket.io connection
export const socket = io("http://localhost:3001", {
  reconnection: true,
});
