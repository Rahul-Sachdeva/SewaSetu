import express from "express";
import {sendMessage, getMessages} from "../Controllers/message.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";

const messageRouter = express.Router();

messageRouter.post("/", authMiddleware, sendMessage);
messageRouter.get("/:id", authMiddleware, getMessages);

export default messageRouter;

