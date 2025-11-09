import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, verifyEmail, getUser, unfollowNGO, followNGO, checkFollowing, saveDeviceToken } from "../Controllers/user.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { getUserPoints, getUserLeaderboard, getUserRank } from "../Controllers/user.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const userRouter = express.Router();
userRouter.post("/device-token", authMiddleware, saveDeviceToken);

userRouter.get("/points", authMiddleware, getUserPoints);
userRouter.get("/leaderboard", authMiddleware, getUserLeaderboard);
userRouter.get("/rank/:id", authMiddleware, getUserRank);
userRouter.post("/register", upload.single("profile_image"), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.get("/:id", authMiddleware, getUser);
userRouter.put("/profile", upload.single("profile_image"), authMiddleware, updateProfile);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/follow/:id", authMiddleware, followNGO);
userRouter.post("/unfollow/:id", authMiddleware, unfollowNGO);
userRouter.get("/following/:ngoId", authMiddleware, checkFollowing);


export default userRouter;
