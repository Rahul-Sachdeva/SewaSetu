import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Named export for sending notification
export const sendNotification = async (token, payload) => {
  try {
    const response = await admin.messaging().sendToDevice(token, payload);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};
