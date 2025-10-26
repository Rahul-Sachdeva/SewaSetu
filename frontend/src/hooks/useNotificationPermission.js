import { useEffect, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from "../utils/firebaseClient"; // Your Firebase app init
import { BaseURL } from "../BaseURL";

const messaging = getMessaging(firebaseApp);

const useNotificationPermission = (trigger) => {
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

  useEffect(() => {
    if (!trigger) return;

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        fetchAndSendToken();
      } else if (Notification.permission === "default") {
        Notification.requestPermission()
          .then((permission) => {
            setPermissionStatus(permission);
            if (permission === "granted") {
              fetchAndSendToken();
            } else if (permission === "denied") {
              console.warn("User denied notification permission.");
            }
          })
          .catch((err) => {
            console.error("Notification permission request error:", err);
          });
      } else if (Notification.permission === "denied") {
        console.warn("Notification permission previously denied.");
      }
    }

    async function fetchAndSendToken() {
      try {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // ✅ pulled from .env
        });

        if (token) {
          // Send token to backend
          await fetch(`${BaseURL}/api/v1/user/device-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ token }),
          });
        }
      } catch (err) {
        console.error("Failed to get/save FCM token", err);
      }
    }
  }, [trigger]);

  return permissionStatus;
};

export default useNotificationPermission;
