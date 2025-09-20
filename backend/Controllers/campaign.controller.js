import { Campaign } from "../Models/campaign.model.js";
import uploadCloudinary from "../Utils/cloudinary.js";

// Create a campaign
export const createCampaign = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            startDate,
            endDate,
            location_coordinates,
            address,
            targetFunds,
            targetVolunteers
        } = req.body;

        if (!title || !category || !startDate || !endDate || !location_coordinates) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Ensure location_coordinates is an array of numbers
        let coordinates = location_coordinates;
        if (typeof location_coordinates === "string") {
            try {
                coordinates = location_coordinates.split(",").map(Number);
            } catch (err) {
                return res.status(400).json({ message: "Invalid location_coordinates format" });
            }
        }

        // Handle banner upload
        let bannerImageUrl = "";
        if (req.file && req.file.buffer) {
            const uploadResult = await uploadCloudinary(req.file.buffer);
            bannerImageUrl = uploadResult.secure_url;
        }

        const campaign = await Campaign.create({
            ngo: req.user.ngo || req.user._id,
            title,
            description,
            category,
            startDate,
            endDate,
            location_coordinates: coordinates,
            address,
            bannerImage: bannerImageUrl,
            targetFunds: targetFunds || 0,
            targetVolunteers: targetVolunteers || 0
        });

        return res.status(201).json({ message: "Campaign created successfully", campaign });
    } catch (err) {
        return res.status(500).json({ message: "Error creating campaign", error: err.message });
    }
};

// List campaigns with optional filters
export const listCampaigns = async (req, res) => {
    try {
        const { category, status, ngoId } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (ngoId) filter.ngo = ngoId;

        const campaigns = await Campaign.find(filter)
            .populate("ngo", "name")
            .populate("participants.user", "name email");

        return res.status(200).json(campaigns);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching campaigns", error: err.message });
    }
};

// Get a single campaign by ID
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate("ngo", "name")
            .populate("participants.user", "name email");

        if (!campaign) return res.status(404).json({ message: "Campaign not found" });
        return res.status(200).json(campaign);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching campaign", error: err.message });
    }
};

// Register a user for a campaign
export const registerForCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        const { role } = req.body;

        // Check if already registered
        if (campaign.participants.some(p => p.user.toString() === req.user._id.toString())) {
            return res.status(400).json({ message: "User already registered" });
        }

        // Add participant
        campaign.participants.push({
            user: req.user._id,
            role: role || "attendee",
            registeredAt: new Date(),
            status: "pending"
        });

        await campaign.save();

        return res.status(200).json({ message: "User registered successfully", campaign });
    } catch (err) {
        return res.status(500).json({ message: "Error registering for campaign", error: err.message });
    }
};

// Optional: Approve or reject a participant (NGO only)
export const updateParticipantStatus = async (req, res) => {
    try {
        const { campaignId, participantId, status } = req.body;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        const participant = campaign.participants.id(participantId);
        if (!participant) return res.status(404).json({ message: "Participant not found" });

        participant.status = status; // approved / rejected
        await campaign.save();

        return res.status(200).json({ message: "Participant status updated", participant });
    } catch (err) {
        return res.status(500).json({ message: "Error updating participant status", error: err.message });
    }
};
