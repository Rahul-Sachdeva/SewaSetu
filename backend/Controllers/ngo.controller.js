import { NGO } from "../Models/ngo.model.js";
import mongoose from "mongoose";
import uploadCloudinary from "../Utils/cloudinary.js";
import { User } from "../Models/user.model.js";

// NGO Registration
export const registerNGO = async (req, res) => {
    try {
        const {
            name,
            registration_number,
            email,
            phone,
            address,
            city,
            state,
            location_coordinates,
            description,
            userId,
        } = req.body;

        // Check mandatory fields
        if (!name || !email || !phone || !registration_number || !city || !state || !address || !location_coordinates) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User Id must be provided" });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User Id" });
        }

        if (!req.files?.documents || req.files.documents.length === 0) {
            return res.status(400).json({ message: "At least one document must be uploaded" });
        }

        // Check if NGO already exists by registration number or email
        const existing = await NGO.findOne({
            $or: [{ registration_number }, { email }]
        });
        if (existing) {
            return res.status(400).json({ message: "NGO with same email or registration Id already registered" });
        }

        // Ensure location coordinates is array of [long, lat]
        let coords = location_coordinates;
        if (typeof coords === "string") {
            coords = coords.split(",").map(Number);
        }
        if (!Array.isArray(coords) || coords.length !== 2) {
            return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
        }

        // --- Handle file uploads ---
        let logoUrl = "";
        let documentUrls = [];
        let galleryUrls = [];

        if (req.files?.profile_image?.[0]) {
            const logoRes = await uploadCloudinary(req.files.profile_image[0].buffer, "sewasetu/ngos/logo");
            logoUrl = logoRes.secure_url;
        }
        if (req.files?.documents?.length) {
            const docsRes = await Promise.all(
                req.files.documents.map(file => uploadCloudinary(file.buffer, "sewasetu/ngos/documents"))
            );
            documentUrls = docsRes.map(doc => doc.secure_url);
        }
        if (req.files?.gallery?.length) {
            const galleryRes = await Promise.all(
                req.files.gallery.map(file => uploadCloudinary(file.buffer, "sewasetu/ngos/gallery"))
            );
            galleryUrls = galleryRes.map(img => img.secure_url);
        }

        // Create NGO
        const ngo = await NGO.create({
            name,
            registration_number,
            email,
            phone,
            address,
            city,
            state,
            location_coordinates: coords,
            documents: documentUrls,   // ✅ only array of strings
            logo: logoUrl,             // ✅ only string
            description,
            gallery: galleryUrls,      // ✅ array of strings
            account: userId,
            members: [userId],
        });

        // Update user to link with NGO
        await User.findByIdAndUpdate(userId, { ngo: ngo._id });

        return res.status(201).json({
            message: "NGO registered successfully, pending admin verification",
            ngo
        });
    } catch (err) {
        console.error("NGO registration error:", err);
        return res.status(500).json({
            message: "Error registering NGO",
            error: err.message
        });
    }
};

export const updateNGO = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id);
        if (!ngo) return res.status(404).json({ message: "NGO not found" });

        // Authorization check (only NGO account user or admin can update)
        if (ngo._id.toString() !== req.user.ngo.toString() && req.user.user_type !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updates = req.body;

        // --- Handle location coordinates ---
        if (updates.location_coordinates) {
            let coords = updates.location_coordinates;
            if (typeof coords === "string") {
                coords = coords.split(",").map(Number);
            }
            if (!Array.isArray(coords) || coords.length !== 2) {
                return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
            }
            updates.location_coordinates = coords;
        }

        // --- Handle file uploads ---
        if (req.files?.profile_image?.[0]) {
            const logoRes = await uploadCloudinary(req.files.profile_image[0].buffer, "sewasetu/ngos/logo");
            updates.logo = logoRes.secure_url;
        }

        if (req.files?.documents?.length) {
            const docsRes = await Promise.all(
                req.files.documents.map(file => uploadCloudinary(file.buffer, "sewasetu/ngos/documents"))
            );
            updates.documents = docsRes.map(doc => doc.secure_url);
        }

        if (req.files?.gallery?.length) {
            const galleryRes = await Promise.all(
                req.files.gallery.map(file => uploadCloudinary(file.buffer, "sewasetu/ngos/gallery"))
            );
            updates.gallery = galleryRes.map(img => img.secure_url);
        }

        // --- Update NGO ---
        const updatedNGO = await NGO.findByIdAndUpdate(req.params.id, updates, { new: true });

        // --- Update linked User (req.user._id) ---
        const userUpdates = {};
        if (updates.name) userUpdates.name = updates.name;
        if (updates.city) userUpdates.city = updates.city;
        if (updates.state) userUpdates.state = updates.state;
        if (updates.address) userUpdates.address = updates.address;
        if (updates.logo) userUpdates.profile_image = updates.logo; // sync NGO logo to user profile
        if (updates.location_coordinates) userUpdates.location_coordinates = updates.location_coordinates;

        let updatedUser = null;
        if (Object.keys(userUpdates).length > 0) {
            updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true }).select("-password");
        }

        return res.status(200).json({
            message: "NGO and linked User updated successfully",
            ngo: updatedNGO,
            user: updatedUser
        });

    } catch (err) {
        console.error("NGO update error:", err);
        return res.status(500).json({ message: "Error updating NGO", error: err.message });
    }
};

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

export const updateNGOStatus = async(req, res) =>{
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


