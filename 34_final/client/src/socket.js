import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET;

const socket = io(URL, {
  path: "/socket.io",
  reconnection: false,
});

export default socket;
