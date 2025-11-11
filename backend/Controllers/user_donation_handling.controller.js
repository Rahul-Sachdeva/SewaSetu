import { DonationHandling } from "../Models/user_donation_handling.model.js";
import { Donation } from "../Models/donation.model.js";
import { sendDonationNotification } from "../Utils/don_notification.utils.js";


// ------------------------
// NGO accepts or rejects a request
// ------------------------
export const respondToDonation = async (req, res) => {
  try {
    const { donationHandlingId, action } = req.body;
    // action = 'accept' or 'reject'


    if (!donationHandlingId || !action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Valid donationHandlingId and action are required" });
    }


    const handling = await DonationHandling.findById(donationHandlingId).populate('donar_id');
    if (!handling) return res.status(404).json({ message: "DonationHandling not found" });


    // Update status based on action
    handling.status = action === 'accept' ? 'accepted' : 'rejected';
    handling.updatedAt = new Date();
    await handling.save();


    // Notify the user
    await sendDonationNotification(handling.donar_id.donatedBy, "User", {
      type: "donation_status_update",
      title: `Donation ${handling.status.charAt(0).toUpperCase() + handling.status.slice(1)}`,
      message: `Your donation "${handling.donar_id.category || handling.donar_id.donation_category}" has been ${handling.status} by NGO.`,
      referenceId: handling.donar_id._id,
      referenceModel: "Donation"
    });


    res.status(200).json({ message: `Donation ${handling.status} successfully`, handling });
  } catch (err) {
    console.error("Respond to Donation Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// NGO schedules pickup/drop with volunteer
// ------------------------
export const scheduleDonation = async (req, res) => {
  try {
    const { donationHandlingId, volunteer_name, volunteer_contact, schedule_date, schedule_time } = req.body;


    if (!donationHandlingId || !volunteer_name || !volunteer_contact || !schedule_date || !schedule_time) {
      return res.status(400).json({ message: "All scheduling details are required" });
    }


    const handling = await DonationHandling.findById(donationHandlingId).populate('donar_id');
    if (!handling) return res.status(404).json({ message: "DonationHandling not found" });


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
    await DonationHandling.updateMany(
      {
        donar_id: handling.donar_id._id,
        _id: { $ne: handling._id },
        status: "pending"
      },
      { status: "cancelled" }
    );


    // Notify user about scheduled pickup
    await sendDonationNotification(handling.donar_id.donatedBy, "User", {
      type: "donation_status_update",
      title: "Donation Scheduled",
      message: `Your donation has been scheduled. Volunteer: ${volunteer_name}, Contact: ${volunteer_contact}`,
      referenceId: handling.donar_id._id,
      referenceModel: "Donation"
    });


    res.status(200).json({ message: "Donation scheduled successfully", handling });
  } catch (err) {
    console.error("Donation Request Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// NGO marks request as completed
// ------------------------
export const completeDonation = async (req, res) => {
  try {
    const { donationHandlingId } = req.body;


    if (!donationHandlingId) return res.status(400).json({ message: "DonationHandling ID is required" });


    const handling = await DonationHandling.findById(donationHandlingId).populate('donar_id');
    if (!handling) return res.status(404).json({ message: "DonationHandling not found" });


    handling.status = "completed";
    handling.updatedAt = new Date();
    await handling.save();


    // Notify user to give feedback
    await sendDonationNotification(handling.donar_id.donatedBy, "User", {
      type: "donation_status_update",
      title: "Donation Completed",
      message: `Your donation for "${handling.donar_id.category || handling.donar_id.donation_category}" has been completed. Please provide feedback for the NGO.`,
      referenceId: handling.donar_id._id,
      referenceModel: "Donation"
    });


    res.status(200).json({ message: "Donation marked as completed", handling });
  } catch (err) {
    console.error("Complete Donation Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// User confirms pick up
// ------------------------
export const confirmPickup = async (req, res) => {
  try {
    const { donationHandlingId } = req.body;
    if (!donationHandlingId) return res.status(400).json({ message: "DonationHandling ID is required" });


    const handling = await DonationHandling.findById(donationHandlingId).populate('donar_id');
    if (!handling) return res.status(404).json({ message: "DonationHandling not found" });


    handling.userConfirmed = true;
    handling.updatedAt = new Date();
    await handling.save();


    // Notify NGO about user confirmation
    await sendDonationNotification(handling.handledBy, "NGO", {
      type: "donation_status_update",
      title: `Pickup Confirmed by User - Donation ID: ${handling.donar_id._id}`,
      message: `User has confirmed the pickup for donation "${handling.donar_id.category || handling.donar_id.assistance_category}" (Donation ID: ${handling.donar_id._id}).`,
      referenceId: handling.donar_id._id,
      referenceModel: "Donation"
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
    const { donationHandlingId, rating, comments } = req.body;
    if (!donationHandlingId || !rating) {
      return res.status(400).json({ message: "DonationHandling ID and rating are required" });
    }

    const handling = await DonationHandling.findById(donationHandlingId).populate('donar_id');
    if (!handling) return res.status(404).json({ message: "DonationHandling not found" });


    handling.feedbackGiven = true;
    handling.feedbackRating = rating;
    handling.feedbackComments = comments || "";
    handling.feedbackDate = new Date();
    await handling.save();


    // Notify NGO about feedback received
    await sendDonationNotification(handling.handledBy, "NGO", {
      type: "donation_status_update",
      title: "Feedback Received",
      message: `User has submitted feedback: (${rating} stars) for donation "${handling.donar_id.category || handling.donar_id.assistance_category}" (Request ID: ${handling.donar_id._id}).`,
      referenceId: handling.donar_id._id,
      referenceModel: "Donation"
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
export const getIncomingDonations = async (req, res) => {
  try {
    const ngoId = req.user.ngo; // logged-in NGO
    const donations = await DonationHandling.find({ handledBy: ngoId })
      .sort({ assignedAt: -1 })
      .populate({
        path: "donar_id",
        populate: { path: "donatedBy", select: "name email phone description" },
      });
    res.status(200).json(donations);
  } catch (err) {
    console.error("Get Incoming Donations Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
