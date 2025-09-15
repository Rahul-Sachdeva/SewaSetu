import express from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../Controllers/user.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, updateProfile);

export default userRouter;
