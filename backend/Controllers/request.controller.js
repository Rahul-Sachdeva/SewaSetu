import { AssistanceRequest } from "../Models/assistance.model.js";
import { RequestHandling } from "../Models/requestHandling.model.js";
import { NGO } from "../Models/ngo.model.js";
import { Notification } from "../Models/notification.model.js";
import { sendNotification } from "../Utils/notification.utils.js";

// ------------------------
// Create new request
// ------------------------
export const createRequest = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      address,
      location_coordinates,
      category,
      description,
      priority,
      requestedBy,
      selectedNGOs // selected by user (max 3)
    } = req.body;

    if (!full_name || !address || !category || !description || !priority || !selectedNGOs || !selectedNGOs.length) {
      return res.status(400).json({ message: "All required fields must be provided and at least one NGO selected" });
    }

    if (selectedNGOs.length > 3) {
      return res.status(400).json({ message: "You can select up to 3 NGOs only" });
    }

    // Create AssistanceRequest
    const request = await AssistanceRequest.create({
      full_name,
      phone,
      address,
      location_coordinates,
      category,
      description,
      priority,
      requestedBy,
      selectedNGOs,
      status: "open"
    });
    console.log("Request Created")

    // Assign to selected NGOs & send notifications
    const assignments = await Promise.all(
      selectedNGOs.map(async (ngoId) => {
        const handling = await RequestHandling.create({
          request_id: request._id,
          handledBy: ngoId,
          status: "pending",
          assignedAt: new Date()
        });

        // Persist notification with userModel
        await Notification.create({
          user: ngoId,
          userModel: "NGO",
          type: "request_received",
          title: "New Assistance Request",
          message: `A new assistance request has been submitted by ${full_name}.`,
          reference: request._id
        });

        // Push notification (optional)
        await sendNotification(ngoId, "NGO", {
          title: "New Assistance Request",
          message: `A new assistance request has been submitted by ${full_name}.`,
          type: "request_received",
          referenceId: request._id,
          referenceModel: "AssistanceRequest"
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
// Get all requests for logged-in user
// ------------------------
export const getUserRequests = async (req, res) => {
  try {
    const requests = await AssistanceRequest.find({ requestedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'selectedNGOs',
        select: 'name email'
      });

    const result = await Promise.all(requests.map(async (reqItem) => {
      const handling = await RequestHandling.find({ request_id: reqItem._id })
        .populate('handledBy', 'name email');
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
// NGO updates request status (accept/reject/schedule/completed)
// ------------------------
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestHandlingId, status, scheduled_details } = req.body;

    if (!requestHandlingId || !status) {
      return res.status(400).json({ message: "RequestHandling ID and status are required" });
    }

    const handling = await RequestHandling.findByIdAndUpdate(
      requestHandlingId,
      { status, scheduled_details, updatedAt: new Date() },
      { new: true }
    ).populate('request_id');

    if (!handling) return res.status(404).json({ message: "RequestHandling not found" });

    if (!handling.request_id) {
      console.error("RequestHandling exists but request_id is null");
      return res.status(500).json({ message: "Associated AssistanceRequest not found" });
    }

    console.log("Updating notifications for user:", handling.request_id.requestedBy);

    // Determine userModel for notification, assuming req.user has role
    const userModel = req.user.role === "ngo" ? "NGO" : "User";

    await Notification.create({
      user: handling.request_id.requestedBy,
      userModel,
      type: "request_status_update",
      title: `Assistance Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your request "${handling.request_id.category}" has been ${status} by NGO.`,
      reference: handling._id
    });

    await sendNotification(handling.request_id.requestedBy, userModel, {
      title: `Assistance Request ID ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your request for assistance for "${handling.request_id.category}" has been ${status} by NGO.`,
      type: "request_status_update",
      referenceId: handling.request_id._id,
    });

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

    if (status === "accepted") {
      await updateNGOPoints(handling.handledBy, "request_accepted", 10);
    } else if (status === "completed") {
      await updateNGOPoints(handling.handledBy, "request_completed", 20);
    }

    return res.status(200).json({ message: "Request status updated successfully", handling });
  } catch (err) {
    console.error("Update Request Status Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------
// Get all incoming requests for a particular NGO
// ------------------------
export const getIncomingRequestsForNGO = async (req, res) => {
  try {
    const ngoId = req.user.ngo; // logged-in NGO
    console.log("NGO ID:", ngoId);
    const incoming = await RequestHandling.find({ handledBy: ngoId })
      .sort({ assignedAt: -1 })
      .populate({
        path: 'request_id',
        populate: { path: 'requestedBy', select: 'name email phone' }
      });
    console.log("Incoming requests count:", incoming.length);
    return res.status(200).json(incoming);

  } catch (err) {
    console.error("Get Incoming Requests Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
