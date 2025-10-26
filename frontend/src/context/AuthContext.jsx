import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { BaseURL } from "../BaseURL.jsx";
import axios from "axios";
import { isLoggedIn } from "../utils/authUtils.js";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// ✅ Load Firebase config from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ✅ Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Step 1: Create Context
const AuthContext = createContext();

// Step 2: Create Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (isLoggedIn()) {
      return JSON.parse(localStorage.getItem("user"));
    }
    return null;
  });

  // ✅ Request notification permission & register FCM token
  const requestNotificationPermission = useCallback(async (userId) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // ✅ now from .env
          });

          if (token) {
            await axios.post(
              `${BaseURL}/api/users/device-token`,
              { token, userId },
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setUser((prev) => ({ ...prev, notificationRequested: true }));
          }
        }
      } catch (err) {
        console.error("Notification permission or token error:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id && user?.notificationNeeded) {
      requestNotificationPermission(user.id);
    }
  }, [user, requestNotificationPermission]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/user/login`,
        { email, password },
        { withCredentials: true }
      );

      const userData = res.data.user;
      console.log("User data from login response:", userData);

      setUser(userData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.notificationNeeded) {
        await requestNotificationPermission(userData.id);
      }

      return { success: true, user: userData, message: res.data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 3: Custom Hook
export const useAuth = () => useContext(AuthContext);
