import express from "express";
import {
    registerNGO,
    updateNGO,
    getNGOById,
    listNGOs,
    updateNGOStatus,
    getPendingNGOs,
} from "../Controllers/ngo.controller.js";
import { NGO } from "../Models/ngo.model.js"; // import NGO model


import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const ngoRouter = express.Router();

ngoRouter.put("/:id/status", authMiddleware, roleMiddleware(["admin"]), updateNGOStatus);
ngoRouter.get("/pending", authMiddleware, roleMiddleware(["admin"]),getPendingNGOs);
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


// Get all verified NGOs for normal request selection
ngoRouter.get("/verified", async (req, res) => {
    try {
        const ngos = await NGO.find({ status: "approved" }).select("name city state email phone");
        return res.status(200).json(ngos);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching NGOs", error: err.message });
    }
});


export default ngoRouter;
