import { RequestHandling } from "../Models/requestHandling.model.js";
import { AssistanceRequest } from "../Models/AssistanceRequest.js";
import { sendNotification } from "../Utils/firebase.js";

// ------------------------
// 1️⃣ NGO accepts or rejects a request
// ------------------------
export const respondToRequest = async (req, res) => {
    try {
        const { requestHandlingId, action } = req.body; 
        // action = 'accept' or 'reject'

        if (!requestHandlingId || !action || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Valid requestHandlingId and action are required" });
        }

        const handling = await RequestHandling.findById(requestHandlingId).populate('request_id');
        if (!handling) return res.status(404).json({ message: "RequestHandling not found" });

        // Update status based on action
        handling.status = action === 'accept' ? 'accepted' : 'rejected';
        handling.updatedAt = new Date();
        await handling.save();

        // Notify the user
        await sendNotification(handling.request_id.requestedBy, {
            title: `Assistance Request ${handling.status.charAt(0).toUpperCase() + handling.status.slice(1)}`,
            message: `Your assistance request "${handling.request_id.assistance_category}" has been ${handling.status} by NGO.`,
            requestId: handling.request_id._id
        });

        res.status(200).json({ message: `Request ${handling.status} successfully`, handling });

    } catch (err) {
        console.error("Respond to Request Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------------
// 2️⃣ NGO schedules pickup/drop with volunteer
// ------------------------
export const scheduleRequest = async (req, res) => {
    try {
        const { requestHandlingId, volunteer_name, volunteer_contact, schedule_date, schedule_time } = req.body;

        if (!requestHandlingId || !volunteer_name || !volunteer_contact || !schedule_date || !schedule_time) {
            return res.status(400).json({ message: "All scheduling details are required" });
        }

        const handling = await RequestHandling.findById(requestHandlingId).populate('request_id');
        if (!handling) return res.status(404).json({ message: "RequestHandling not found" });

        // Update handling with schedule details
        handling.status = "scheduled";
        handling.scheduled_details = {
            volunteer_name,
            volunteer_contact,
            schedule_date,
            schedule_time
        };
        handling.updatedAt = new Date();
        await handling.save();

        // Cancel all other NGO requests for this AssistanceRequest
        await RequestHandling.updateMany(
            {
                request_id: handling.request_id._id,
                _id: { $ne: handling._id },
                status: "pending"
            },
            { status: "cancelled" }
        );

        // Notify user about scheduled pickup
        await sendNotification(handling.request_id.requestedBy, {
            title: "Assistance Request Scheduled",
            message: `Your assistance request has been scheduled. Volunteer: ${volunteer_name}, Contact: ${volunteer_contact}`,
            requestId: handling.request_id._id
        });

        res.status(200).json({ message: "Request scheduled successfully", handling });

    } catch (err) {
        console.error("Schedule Request Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------------
// 3️⃣ NGO marks request as completed
// ------------------------
export const completeRequest = async (req, res) => {
    try {
        const { requestHandlingId } = req.body;

        if (!requestHandlingId) return res.status(400).json({ message: "RequestHandling ID is required" });

        const handling = await RequestHandling.findById(requestHandlingId).populate('request_id');
        if (!handling) return res.status(404).json({ message: "RequestHandling not found" });

        handling.status = "completed";
        handling.updatedAt = new Date();
        await handling.save();

        // Notify user to give feedback
        await sendNotification(handling.request_id.requestedBy, {
            title: "Assistance Request Completed",
            message: `Your assistance request "${handling.request_id.assistance_category}" has been completed. Please provide feedback for the NGO.`,
            requestId: handling.request_id._id
        });

        res.status(200).json({ message: "Request marked as completed", handling });

    } catch (err) {
        console.error("Complete Request Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------------
// 4️⃣ Get all incoming requests for NGO dashboard
// ------------------------
export const getIncomingRequests = async (req, res) => {
    try {
        const ngoId = req.user.ngo; // assuming logged-in user is NGO

        const requests = await RequestHandling.find({ ngo_id: ngoId })
            .sort({ assignedAt: -1 })
            .populate({
                path: 'request_id',
                populate: { path: 'requestedBy', select: 'name email phone description' } 
            });

        res.status(200).json(requests);

    } catch (err) {
        console.error("Get Incoming Requests Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
