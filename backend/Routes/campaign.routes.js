import express from "express";
import multer from "multer";

import {
    createCampaign,
    listCampaigns,
    getCampaignById,
    registerForCampaign,
    updateParticipantStatus,
    unregisterFromCampaign,
    getCampaignParticipants,
    updateCampaign,
    deleteCampaign,
    getCampaignsByNGO,
    getTopDonors,
    getCampaignDonations,
    initiateCampaignDonation
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

campaignRouter.get("/:id/donations",authMiddleware,roleMiddleware(["ngo", "admin"]),getCampaignDonations);

// Frontend calls this to initiate a donation (creates Fund / Razorpay order)
campaignRouter.post("/:id/donate",authMiddleware,initiateCampaignDonation);

campaignRouter.get("/ngo/:ngoId",authMiddleware,roleMiddleware(["ngo", "admin"]),getCampaignsByNGO);
campaignRouter.get("/top-donors",authMiddleware,getTopDonors);

// 🔹 New Features
campaignRouter.get("/:id/participants", authMiddleware, roleMiddleware(["ngo", "admin"]), getCampaignParticipants);
campaignRouter.put("/:id", authMiddleware, roleMiddleware(["ngo", "admin"]), upload.single("bannerImage"), updateCampaign);
campaignRouter.delete("/:id", authMiddleware, roleMiddleware(["ngo", "admin"]), deleteCampaign);

// Get campaign by ID
campaignRouter.get("/:id", getCampaignById);
// List all campaigns
campaignRouter.get("/", listCampaigns);


// Register/Unregister
campaignRouter.post("/:id/register", authMiddleware, registerForCampaign);
campaignRouter.post("/:id/unregister", authMiddleware, unregisterFromCampaign);


// Update participant status (approve/reject) - NGO/Admin only
campaignRouter.post("/:id/participant-status",authMiddleware,roleMiddleware(["ngo", "admin"]),updateParticipantStatus);



export default campaignRouter;
