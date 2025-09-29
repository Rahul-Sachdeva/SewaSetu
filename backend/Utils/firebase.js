import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };


// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
export const sendFirebaseNotification = async (tokens, payload) => {
  try {
    console.log("tokens: ", tokens);
    console.log("payload: ", payload);

    const response = await admin.messaging().sendEachForMulticast({ 
      tokens: tokens, 
      notification: payload.notification, 
      data: payload.data || {}, 
    });

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.error(`Failed for token ${tokens[idx]}:`, resp.error.code, resp.error.message);
      }
    });

    console.log("FCM response: ", response);
    return response;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    throw error;
  }
};
