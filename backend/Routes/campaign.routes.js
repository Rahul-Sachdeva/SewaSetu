import express from "express";
import multer from "multer";

import {
    createCampaign,
    listCampaigns,
    getCampaignById,
    registerForCampaign,
    updateParticipantStatus
} from "../Controllers/campaign.controller.js";

import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

// Multer setup for in-memory file storage (no disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const campaignRouter = express.Router();

// Create campaign (NGO/Admin) with optional banner upload
campaignRouter.post(
    "/",
    authMiddleware,
    roleMiddleware(["ngo", "admin"]),
    upload.single("bannerImage"),
    createCampaign
);

// List all campaigns
campaignRouter.get("/", listCampaigns);

// Get campaign by ID
campaignRouter.get("/:id", getCampaignById);

// Register a user for a campaign
campaignRouter.post(
    "/:id/register",
    authMiddleware,
    roleMiddleware(["ngo", "admin"]),
    registerForCampaign
);

// Update participant status (approve/reject) - NGO/Admin only
campaignRouter.post(
    "/:id/participant-status",
    authMiddleware,
    roleMiddleware(["ngo", "admin"]),
    updateParticipantStatus
);

export default campaignRouter;
