import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.js";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendFirebaseNotification = async (tokens, payload) => {
  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data || {},
    });

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.error(
          `Failed for token ${tokens[idx]}:`,
          resp.error.code,
          resp.error.message
        );
      }
    });

    return response;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    throw error;
  }
};
