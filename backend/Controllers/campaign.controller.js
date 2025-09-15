import { Campaign } from "../Models/campaign.model.js";

export const createCampaign = async(req, res) => {
    try {
        const {title, description, type, startDate, endDate, location} = req.body;

        const campaign = await Campaign.create({
            title,
            description,
            type,
            startDate,
            endDate,
            location,
            createdBy: req.user._id
        });

        return res.status(201).json({message: "Campaign created", campaign});
    } catch (err) {
        return res.status(500).json({ message: "Error creating campaign", error: err.message});
    }
}

export const listCampaigns = async(req, res) => {
    try {
        const {type, status, ngoId} = req.query;
        const filter = {};

        if(type) filter.type = type;
        if(status) filter.status = status;
        if(ngoId) filter.createdBy = ngoId;

        const campaigns = await Campaign.find(filter)
            .populate("createdBy", "name")
            .populate("participants", "name email");
        
            return res.status(200).json(campaign);
    } catch (err) {
        return res.status(500).json({message: "Error fetching campaigns", error: err.message});
    }
}

export const getCampaignById = async(req, res) => {
    try {
        const campaign = await campaign.findById(req.params.id)
            .populate("createdBy", "name")
            .populate("participants", "name email");
        
        if(!campaign) return res.status(404).json({message: "Campaign not found"});
        return res.status(200).json(campaign);
    } catch (err) {
        return res.status(500).json({message: "Error fetching campagin", error: err.message});
    }
}

export const registerForCampaign = async(req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if(!campaign) return res.status(404).json({message: "Campaign not found"});

        if(campaign.participants.includes(req.user._id)){
            return res.status(400).json({message: "Already registered"});
        }

        campaign.participants.push(req.user._id);
        await campaign.save();

        return res.status(200).json({message: "User registered successfully", campaign});

    } catch (err) {
        return res.status(500).json({message: "Error registering for campaign", error: err.message});
    }
};
