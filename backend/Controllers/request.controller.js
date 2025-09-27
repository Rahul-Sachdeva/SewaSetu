import { AssistanceRequest } from "../Models/AssistanceRequest.js";
import { RequestHandling } from "../Models/requestHandling.model.js";
import { NGO } from "../Models/ngo.model.js";
import { sendNotification } from "../Utils/firebase.js";

// Create new request
export const createRequest = async (req, res) => {
    try {
        const { title, description, category, priority, location_coordinates, address } = req.body;

        if (!title || !description || !category || !priority || !location_coordinates || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const request = await AssistanceRequest.create({
            title,
            description,
            category,
            priority,
            status: priority === "Emergency" ? "in_progress" : "open",
            location_coordinates,
            address,
            requestedBy: req.user._id
        });

        // If emergency, assign nearest NGO(s)
        if (priority === "Emergency") {
            const ngos = await NGO.find({ verified: true }); // For now fetch all verified NGOs
            if (ngos.length) {
                ngos.forEach(async (ngo) => {
                    await RequestHandling.create({
                        request_id: request._id,
                        handlerType: "ngo",
                        handledBy: ngo._id,
                        status: "assigned"
                    });

                    // Send PWA notification
                    await sendNotification(ngo._id, {
                        title: "Emergency Assistance Request",
                        message: `New emergency request submitted near you!`,
                        requestId: request._id
                    });
                });
            }
        }

        res.status(201).json({ message: "Request submitted successfully", request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Fetch all requests by logged-in user
export const getUserRequests = async (req, res) => {
    try {
        const requests = await AssistanceRequest.find({ requestedBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'requestedBy',
                select: 'name email phone'
            })
            .populate({
                path: 'requestHandling',
                populate: { path: 'handledBy', select: 'name email' }
            });

        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const assignNGOsToRequest = async (req, res) => {
    try {
        const { requestId, ngoIds } = req.body;

        if (!requestId || !ngoIds || !ngoIds.length) {
            return res.status(400).json({ message: "Request ID and at least one NGO ID are required" });
        }

        const assignments = await Promise.all(
            ngoIds.map(async (ngoId) => {
                const handling = await RequestHandling.create({
                    request_id: requestId,
                    handlerType: "ngo",
                    handledBy: ngoId,
                    status: "assigned",
                    assignedAt: new Date()
                });

                // Send Firebase notification
                await sendNotification(ngoId, {
                    title: "New Assistance Request",
                    message: `A new request has been assigned to you.`,
                    requestId
                });

                return handling;
            })
        );

        return res.status(201).json({ message: "NGOs assigned successfully", assignments });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
