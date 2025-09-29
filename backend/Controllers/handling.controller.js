import { RequestHandling } from "../Models/requestHandling.model.js";
import { AssistanceRequest } from "../Models/assistance.model.js";
import { sendNotification } from "../Utils/notification.utils.js";


// ------------------------
// NGO accepts or rejects a request
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
    await sendNotification(handling.request_id.requestedBy, "User", {
      type: "request_status_update",
      title: `Assistance Request ${handling.status.charAt(0).toUpperCase() + handling.status.slice(1)}`,
      message: `Your assistance request "${handling.request_id.category || handling.request_id.assistance_category}" has been ${handling.status} by NGO.`,
      referenceId: handling.request_id._id,
      referenceModel: "AssistanceRequest"
    });


    res.status(200).json({ message: `Request ${handling.status} successfully`, handling });
  } catch (err) {
    console.error("Respond to Request Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// NGO schedules pickup/drop with volunteer
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
      schedule_date: new Date(schedule_date),  // Ensure date type
      schedule_time
    };
    handling.updatedAt = new Date();
    await handling.save();


    // Cancel all other NGO requests for this AssistanceRequest that are still pending
    await RequestHandling.updateMany(
      {
        request_id: handling.request_id._id,
        _id: { $ne: handling._id },
        status: "pending"
      },
      { status: "cancelled" }
    );


    // Notify user about scheduled pickup
    await sendNotification(handling.request_id.requestedBy, "User", {
      type: "request_status_update",
      title: "Assistance Request Scheduled",
      message: `Your assistance request has been scheduled. Volunteer: ${volunteer_name}, Contact: ${volunteer_contact}`,
      referenceId: handling.request_id._id,
      referenceModel: "AssistanceRequest"
    });


    res.status(200).json({ message: "Request scheduled successfully", handling });
  } catch (err) {
    console.error("Schedule Request Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// NGO marks request as completed
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
    await sendNotification(handling.request_id.requestedBy, "User", {
      type: "request_status_update",
      title: "Assistance Request Completed",
      message: `Your assistance request for "${handling.request_id.category || handling.request_id.assistance_category}" has been completed. Please provide feedback for the NGO.`,
      referenceId: handling.request_id._id,
      referenceModel: "AssistanceRequest"
    });


    res.status(200).json({ message: "Request marked as completed", handling });
  } catch (err) {
    console.error("Complete Request Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// User confirms pick up
// ------------------------
export const confirmPickup = async (req, res) => {
  try {
    const { requestHandlingId } = req.body;
    if (!requestHandlingId) return res.status(400).json({ message: "RequestHandling ID is required" });


    const handling = await RequestHandling.findById(requestHandlingId).populate('request_id');
    if (!handling) return res.status(404).json({ message: "RequestHandling not found" });


    handling.userConfirmed = true;
    handling.updatedAt = new Date();
    await handling.save();


    // Notify NGO about user confirmation
    await sendNotification(handling.handledBy, "NGO", {
      type: "request_status_update",
      title: `Pickup Confirmed by User - Request ID: ${handling.request_id._id}`,
      message: `User has confirmed the pickup for request "${handling.request_id.category || handling.request_id.assistance_category}" (Request ID: ${handling.request_id._id}).`,
      referenceId: handling.request_id._id,
      referenceModel: "AssistanceRequest"
    });



    res.status(200).json({ message: "Pick up confirmed by user", handling });
  } catch (err) {
    console.error("Confirm Pickup Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// Submit feedback for a request
// ------------------------
export const submitFeedback = async (req, res) => {
  try {
    const { requestHandlingId, rating, comments } = req.body;
    if (!requestHandlingId || !rating) {
      return res.status(400).json({ message: "RequestHandling ID and rating are required" });
    }

    const handling = await RequestHandling.findById(requestHandlingId).populate('request_id');
    if (!handling) return res.status(404).json({ message: "RequestHandling not found" });


    handling.feedbackGiven = true;
    handling.feedbackRating = rating;
    handling.feedbackComments = comments || "";
    handling.feedbackDate = new Date();
    await handling.save();


    // Notify NGO about feedback received
    await sendNotification(handling.handledBy, "NGO", {
      type: "request_status_update",
      title: "Feedback Received",
      message: `User has submitted feedback: (${rating} stars) for request "${handling.request_id.category || handling.request_id.assistance_category}" (Request ID: ${handling.request_id._id}).`,
      referenceId: handling.request_id._id,
      referenceModel: "AssistanceRequest"
    });


    res.status(200).json({ message: "Feedback submitted", handling });
  } catch (err) {
    console.error("Submit Feedback Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// Get all incoming requests for NGO dashboard
// ------------------------
export const getIncomingRequests = async (req, res) => {
  try {
    const ngoId = req.user.ngo; // logged-in NGO
    const requests = await RequestHandling.find({ handledBy: ngoId })
      .sort({ assignedAt: -1 })
      .populate({
        path: "request_id",
        populate: { path: "requestedBy", select: "name email phone description" },
      });
    res.status(200).json(requests);
  } catch (err) {
    console.error("Get Incoming Requests Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
