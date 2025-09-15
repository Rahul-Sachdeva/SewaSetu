import express from "express";

import {
    createCampaign,
    listCampaigns,
    getCampaignById,
    registerForCampaign
} from "../Controllers/campaign.controller.js";

import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const campaignRouter = express.Router();

campaignRouter.post("/", authMiddleware, roleMiddleware(["ngo_member", "admin"]), createCampaign);
campaignRouter.get("/", listCampaigns);
campaignRouter.get("/:id", getCampaignById);
campaignRouter.post("/:id/register", authMiddleware, roleMiddleware(["member","volunteer"]), registerForCampaign);

export default campaignRouter;
