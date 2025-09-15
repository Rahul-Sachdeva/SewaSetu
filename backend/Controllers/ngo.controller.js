import { NGO } from "../Models/ngo.model.js";

// NGO Registration
export const registerNGO = async(requestAnimationFrame, res) => {
    try {
        const {name, registrationNumber, email, phone, address, city, state, documents, description} = req.body;
        const existing = await NGO.findOne({registrationNumber});
        if(existing) return res.status(400).json({message: "NGO already registered"});

        const ngo = await NGO.create({
            name, 
            registrationNumber, 
            email,
            phone, 
            address,
            city,
            state, 
            documents,
            description,
            website,
            createdBy: req.user._id,
            members: [req.user._id],
        })
        return res.status(201).json({message: "NGO registered successfully, verification pending", ngo});
    } catch (err) {
        return res.status(500).json({message: "Error registering NGO", error: err.message});
    }
};

export const updateNGO = async(req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id);
        if(!ngo) return res.status(404).json({message: "NGO not found"});

        if(ngo.createdBy.toString() !==req.user._id.toString() && req.user.user_type !== "admin"){
            return res.status(403).json({message: "Unauthorized"});
        } 

        const updates = req.body;
        const updatedNGO = await NGO.findByIdAndUpdate(req.params.id, updates, {new: true});

        return res.status(200).json({message: "NGO updated", ngo: updatedNGO});
    } catch (err) {
        return res.status(500).json({message: "Error updating NGO", error: err.message});
    }
}

export const getNGOById = async(req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id).populate("members","name email user_type");
        if(!ngo) return res.status(404).json({message: "NGO not found"});
        return res.status(200).json(ngo);
    } catch (err) {
        return res.status(500).json({message: "Error fetching NGO", error: err.message});
    }
};

export const listNGOs = async(req, res) => {
    try {
        const {city, status} = req.query;
        const filter = {};
        if(city) filter.city = city;
        if(status) filter.status = status;

        const ngos = await NGO.find(filter).select("name city status createdAt");
        return res.status(200).json(ngos);
    } catch (err) {
        return res.status(500).json({message: "Error listing NGOs", error: err.message});
    }
};

export const updateNGOStaus = async(req, res) =>{
    try {
        if(req.user.user_type !== "admin"){
            return res.status(403).json({message: "Only admin can approve NGOs"});
        }

        const {status} = req.body;
        if(!["approved", "rejected"].includes(status)){
            return res.status(400).json({message: "Invalid status"});
        }

        const ngo = await NGO.findByIdAndUpdate(req.params.id, {status}, {new: true});
        if(!ngo) return res.status(404).json({message: "NGO not found"});

        return res.status(200).json({message: `NGO updated to status: ${status}`, ngo});
    } catch (err) {
        return res.status(500).json({message: "Error updating status", error: err.message});
    }
};


