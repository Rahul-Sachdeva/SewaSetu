// socket.js
import { BaseURL } from "@/BaseURL";
import { io } from "socket.io-client";

export const socket = io(BaseURL, {
  withCredentials: true,
});
