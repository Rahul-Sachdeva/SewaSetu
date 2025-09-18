import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, verifyEmail } from "../Controllers/user.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import multer from "multer";

const storage = multer.memoryStorage(); // no files saved to disk
const upload = multer({ storage });

const userRouter = express.Router();

userRouter.post("/register", upload.single("profile_image"), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.post("/verify-email", verifyEmail);

export default userRouter;
