// Routes/comment.router.js
import express from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { createComment, getCommentsWithReplies, deleteComment } from "../Controllers/comment.controller.js";

const commentRouter = express.Router();

commentRouter.post("/:postId", authMiddleware, createComment);
commentRouter.get("/:postId", getCommentsWithReplies);
commentRouter.delete("/:id", authMiddleware, deleteComment);

export default commentRouter;
