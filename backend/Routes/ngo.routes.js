import express from "express";
import {
    registerNGO,
    updateNGO,
    listFilteredNGOs,
    listNGOs,
    getNGOById,
    updateNGOStatus,
    getPendingNGOs,
    getNGOPoints,
    getNGOLeaderboard,
    getNGORank,
} from "../Controllers/ngo.controller.js";
import { NGO } from "../Models/ngo.model.js"; // import NGO model


import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const ngoRouter = express.Router();

ngoRouter.get("/filtered", listFilteredNGOs);
ngoRouter.get("/:id/points", getNGOPoints);
ngoRouter.get("/ngo-leaderboard", getNGOLeaderboard);

ngoRouter.get("/:id/rank", getNGORank);
// Get all verified NGOs for normal request selection
ngoRouter.get("/verified", async (req, res) => {
    try {
        const ngos = await NGO.find({ verification_status: "approved" }).select("name city state email phone");
        return res.status(200).json(ngos);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching NGOs", error: err.message });
    }
});

ngoRouter.get("/", listNGOs);
ngoRouter.get("/pending", authMiddleware, roleMiddleware(["admin"]),getPendingNGOs);

ngoRouter.put("/:id/status", authMiddleware, roleMiddleware(["admin"]), updateNGOStatus);
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

export default ngoRouter;
