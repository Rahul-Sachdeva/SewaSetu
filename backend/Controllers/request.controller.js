import { AssistanceRequest } from "../Models/assistance.model.js";
import { RequestHandling } from "../Models/requestHandling.model.js";
import { NGO } from "../Models/ngo.model.js";
import { sendNotification } from "../Utils/firebase.js";

// ------------------------
// 1️⃣ Create new request
// ------------------------
export const createRequest = async (req, res) => {
    try {
        const {
            full_name,
            phone,
            address,
            current_location_coordinates,
            assistance_category,
            description,
            priority,
            ngo_ids // selected by user (max 3)
        } = req.body;

        // Validate required fields
        if (!full_name || !address || !assistance_category || !description || !priority || !ngo_ids || !ngo_ids.length) {
            return res.status(400).json({ message: "All required fields must be provided and at least one NGO selected" });
        }

        // Limit to max 3 NGOs
        if (ngo_ids.length > 3) {
            return res.status(400).json({ message: "You can select up to 3 NGOs only" });
        }

        // Create AssistanceRequest (all requests start as 'open')
        const request = await AssistanceRequest.create({
            full_name,
            phone,
            address,
            current_location_coordinates,
            assistance_category,
            description,
            priority,
            requestedBy: req.user._id,
            selectedNGOs: ngo_ids,
            status: "open"
        });

        // Create RequestHandling entries for selected NGOs and send notifications
        const assignments = await Promise.all(
            ngo_ids.map(async (ngoId) => {
                const handling = await RequestHandling.create({
                    request_id: request._id,
                    ngo_id: ngoId,
                    status: "pending",
                    assignedAt: new Date()
                });

                // Notify NGO via Firebase
                await sendNotification(ngoId, {
                    title: "New Assistance Request",
                    message: `A new assistance request has been submitted by ${full_name}.`,
                    requestId: request._id
                });

                return handling;
            })
        );

        return res.status(201).json({
            message: "Request submitted successfully",
            request,
            assignments
        });

    } catch (err) {
        console.error("Create Request Error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------------
// 2️⃣ Get all requests for logged-in user
// ------------------------
export const getUserRequests = async (req, res) => {
    try {
        const requests = await AssistanceRequest.find({ requestedBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'requestedBy',
                select: 'name email phone'
            })
            .populate({
                path: 'selectedNGOs',
                select: 'name email'
            });

        // For each request, fetch RequestHandling entries to show status per NGO
        const result = await Promise.all(requests.map(async (reqItem) => {
            const handling = await RequestHandling.find({ request_id: reqItem._id })
                .populate('ngo_id', 'name email');
            return {
                ...reqItem.toObject(),
                handling
            };
        }));

        return res.status(200).json(result);

    } catch (err) {
        console.error("Get User Requests Error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------------
// 3️⃣ NGO updates request status (accept/reject/schedule/completed)
// ------------------------
export const updateRequestStatus = async (req, res) => {
    try {
        const { requestHandlingId, status, scheduled_details } = req.body;

        if (!requestHandlingId || !status) {
            return res.status(400).json({ message: "RequestHandling ID and status are required" });
        }

        // Update RequestHandling record
        const handling = await RequestHandling.findByIdAndUpdate(
            requestHandlingId,
            { status, scheduled_details, updatedAt: new Date() },
            { new: true }
        ).populate('request_id');

        if (!handling) return res.status(404).json({ message: "RequestHandling not found" });

        // Notify user about status update
        await sendNotification(handling.request_id.requestedBy, {
            title: `Assistance Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your request "${handling.request_id.assistance_category}" has been ${status} by NGO.`,
            requestId: handling.request_id._id
        });

        // If this request is confirmed with one NGO, close all other NGO requests for this AssistanceRequest
        if (status === "scheduled") {
            await RequestHandling.updateMany(
                {
                    request_id: handling.request_id._id,
                    _id: { $ne: handling._id },
                    status: "pending"
                },
                { status: "cancelled" }
            );
        }

        return res.status(200).json({ message: "Request status updated successfully", handling });

    } catch (err) {
        console.error("Update Request Status Error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------------
// 4️⃣ Get all incoming requests for a particular NGO
// ------------------------
export const getIncomingRequestsForNGO = async (req, res) => {
    try {
        const ngoId = req.user.ngo; // assuming logged-in user is NGO
        const incoming = await RequestHandling.find({ ngo_id: ngoId })
            .sort({ assignedAt: -1 })
            .populate({
                path: 'request_id',
                populate: { path: 'requestedBy', select: 'name email phone' }
            });

        return res.status(200).json(incoming);

    } catch (err) {
        console.error("Get Incoming Requests Error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
