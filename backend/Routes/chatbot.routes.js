import express from "express";
import { chatbotHandler } from "../Controllers/chatbot.controller.js";

const chatbotRouter = express.Router();
chatbotRouter.post("/", chatbotHandler);

export default chatbotRouter;
