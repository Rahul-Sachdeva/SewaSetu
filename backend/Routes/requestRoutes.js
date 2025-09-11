import express from "express";
import AssistanceRequest from "../Models/AssistanceRequest.js";

const router = express.Router();

// @desc Create new request
// @route POST /api/requests
router.post("/", async (req, res) => {
  try {
    const request = new AssistanceRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc Get all requests
// @route GET /api/requests
router.get("/", async (req, res) => {
  try {
    const requests = await AssistanceRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Update status
// @route PUT /api/requests/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const request = await AssistanceRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

