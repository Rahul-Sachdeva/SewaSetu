import express from "express";
import {createConversation, getUserConversation} from "../Controllers/campaign.controller.js";
import {authMiddleware} from "../Middlewares/auth.middleware.js";

const conversationRouter = express.router();

conversationRouter.post("/", authMiddleware, createConversation);
conversationRouter.get("/", authMiddleware, getUserConversation);

export default conversationRouter;
