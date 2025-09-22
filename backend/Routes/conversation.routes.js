import express from "express";
import {createConversation, getUserConversations} from "../Controllers/conversation.controller.js";
import {authMiddleware} from "../Middlewares/auth.middleware.js";

const conversationRouter = express.Router();

conversationRouter.post("/", authMiddleware, createConversation);
conversationRouter.get("/", authMiddleware, getUserConversations);

export default conversationRouter;
