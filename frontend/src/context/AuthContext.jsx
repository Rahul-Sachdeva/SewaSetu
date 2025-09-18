import React, { createContext, useState, useContext } from "react";
import { BaseURL } from "../BaseURL.jsx";
import axios from "axios";
import { isLoggedIn } from "../utils/authUtils.js";

// Step 1: Create Context;
const AuthContext = createContext();

// Step 2: Create Provider
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
      if (isLoggedIn()) {
        return JSON.parse(localStorage.getItem("user"));
      }
      return null;
    });

    const login = async (email, password) => {
        try {
            const res = await axios.post(
                `${BaseURL}/api/v1/user/login`,
                { email, password },
                { withCredentials: true }
            );

            const userData = res.data.user;
            setUser(userData);

            // store token & user for persistence
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(userData));

            return { success: true, user: userData, message: res.data.message };
        } catch (err) {
            // backend sends { message: "..."} for errors
            const errorMsg = err.response?.data?.message || "Login failed";
            return { success: false, message: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    return (
        <AuthContext.Provider value = {{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

// Step 3: Custom hoook to use auth
export const useAuth = () => {
    return useContext(AuthContext);
}
