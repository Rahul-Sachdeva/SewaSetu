import express from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { createRequest, getUserRequests, getIncomingRequestsForNGO, updateRequestStatus } from "../Controllers/request.controller.js";
import { confirmPickup, submitFeedback } from "../Controllers/handling.controller.js";

// Assign selected NGOs to a request
const router = express.Router();

// Create new request
router.post("/", authMiddleware, createRequest);
// router.post("/assign-ngos", assignNGOsToRequest);

// Get all requests by logged-in user
router.get("/user", authMiddleware, getUserRequests);
router.get("/ngo", authMiddleware, (req, res, next) => {
  console.log("Route /api/requests/ngo reached");
  next();
}, getIncomingRequestsForNGO);
router.put("/update-status", authMiddleware, updateRequestStatus);
router.put("/confirm-pickup", authMiddleware, confirmPickup);
router.post("/feedback", authMiddleware, submitFeedback);


export default router;
