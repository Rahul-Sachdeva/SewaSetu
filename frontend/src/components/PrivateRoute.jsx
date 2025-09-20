// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/authUtils";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check user's role
  if (roles && roles.length > 0 && !roles.includes(user.user_type)) {
    return <Navigate to="/" replace />; 
    // You can create a custom "Unauthorized" page or redirect home
  }

  return children;
};

export default PrivateRoute;
