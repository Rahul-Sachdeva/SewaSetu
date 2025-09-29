import React from "react";
import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div
      style={{
        fontFamily: "'Inter', Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f2e7e8ff",
        color: "#721c24",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Access Denied
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        style={{
          fontSize: "1rem",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          backgroundColor: "#721c24",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "600",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotAuthorized;
