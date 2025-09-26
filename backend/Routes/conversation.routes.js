import express from "express";
import {createConversation, getConversation, getUserConversations} from "../Controllers/conversation.controller.js";
import {authMiddleware} from "../Middlewares/auth.middleware.js";

const conversationRouter = express.Router();

conversationRouter.post("/", authMiddleware, createConversation);
conversationRouter.get("/", authMiddleware, getUserConversations);
conversationRouter.get("/:id", authMiddleware, getConversation);

export default conversationRouter;
