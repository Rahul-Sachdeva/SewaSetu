import express from "express";
import {
    registerNGO,
    updateNGO,
    getNGOById,
    listNGOs,
    updateNGOStatus
} from "../Controllers/ngo.controller.js";

import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const ngoRouter = express.Router();

ngoRouter.post("/register", upload.fields([
        { name: "profile_image", maxCount: 1 },
        { name: "documents", maxCount: 5 },
        { name: "gallery", maxCount: 20 }
    ]), registerNGO);
ngoRouter.put("/:id", upload.fields([
        { name: "profile_image", maxCount: 1 },
        { name: "documents", maxCount: 5 },
        { name: "gallery", maxCount: 20 }]), authMiddleware, updateNGO);
ngoRouter.get("/:id", getNGOById);
ngoRouter.get("/", listNGOs);

ngoRouter.put("/:id/status", authMiddleware, roleMiddleware(["admin"]), updateNGOStatus);

export default ngoRouter;
