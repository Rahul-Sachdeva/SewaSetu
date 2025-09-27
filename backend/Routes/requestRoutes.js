import express from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { createRequest, getUserRequests } from "../Controllers/request.controller.js";
// import { assignNGOsToRequest } from "../Controllers/request.controller.js";

// Assign selected NGOs to a request
const router = express.Router();

// Create new request
router.post("/", authMiddleware, createRequest);
// router.post("/assign-ngos", assignNGOsToRequest);

// Get all requests by logged-in user
router.get("/user", authMiddleware, getUserRequests);

export default router;
