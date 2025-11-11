import { User } from "../Models/user.model.js";
import { NGO } from "../Models/ngo.model.js";
import { DonationNotification } from "../Models/don_notification.model.js";
import { sendFirebaseNotification } from "./firebase.js"; // corrected import

export const sendDonationNotification = async (recipientId, recipientModel, payload, push = true) => {
  try {
    const { title, message, type, referenceId, referenceModel } = payload;

    // // Save Notification in DB
    // await Notification.create({
    //   user: recipientId,
    //   userModel: recipientModel,
    //   type,
    //   title,
    //   message,
    //   reference: referenceId || null,
    //   referenceModel: referenceModel || null
    // });

    if (push) {
      // Fetch recipient device token
      let recipientDoc;
      if (recipientModel === "User") recipientDoc = await User.findById(recipientId);
      else if (recipientModel === "NGO") recipientDoc = await NGO.findById(recipientId);

      console.log("Sending notification to", recipientId, "model", recipientModel);
      if (!recipientDoc) console.warn("Recipient document not found");
      if (!recipientDoc?.deviceTokens) console.warn("Recipient device token not found");

      if (!recipientDoc || !recipientDoc.deviceTokens) {
        console.warn("Recipient device token not found");
        return true; // notification saved, just no push sent
      }

      const token = recipientDoc.deviceTokens;

      // Prepare Firebase payload with deep link for PWA
      const fbPayload = {
        notification: {
          title,
          body: message,
        },
        data: {
          type,
          referenceId: referenceId?.toString() || "",
          referenceModel: referenceModel || "",
          click_action: "/notifications",
        }
      };


      await sendFirebaseNotification(token, fbPayload);
    }

    return true;
  } catch (err) {
    console.error("Notification Error:", err);
    return false;
  }
};
