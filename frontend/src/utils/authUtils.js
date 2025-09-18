// src/utils/authUtils.js
import {jwtDecode} from "jwt-decode";

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    // check expiry (exp is in seconds → convert to ms)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};
