// Routes/like.router.js
import express from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { toggleLike } from "../Controllers/like.controller.js";

const likeRouter = express.Router();

likeRouter.post("/:postId/toggle", authMiddleware, toggleLike);

export default likeRouter;
