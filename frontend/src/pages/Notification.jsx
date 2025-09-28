import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../BaseURL";

const Notification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BaseURL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleClick = (notification) => {
    markAsRead(notification._id);
    if (notification.referenceModel === "RequestHandling") {
      navigate("/user-requests");
    } else if (notification.referenceModel === "AssistanceRequest") {
      navigate("/ngo-requests");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          maxWidth: 600,
          margin: "40px auto",
          fontFamily: "'Inter', Arial, sans-serif",
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          overflow: "hidden",
          paddingBottom: 20,
        }}
      >
        <header
          style={{
            backgroundColor: "#19398a",
            color: "white",
            padding: "12px 24px",
            fontSize: "1.8rem",
            fontWeight: "700",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "2px solid #2e58c2",
            borderRadius: "12px 12px 0 0",
          }}
        >
          Notifications
          {notifications.length > 0 && (
            <span
              style={{
                backgroundColor: "#ff3b3f",
                color: "#fff",
                borderRadius: "9999px",
                padding: "4px 14px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginLeft: 12,
                boxShadow: "0 0 6px #ff3b3f",
                animation: "pulse 2s infinite",
              }}
            >
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </header>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: 20 }}>Loading notifications...</p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</p>
        ) : notifications.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 20 }}>No notifications found</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              maxHeight: "65vh",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#90caf9 transparent",
            }}
          >
            {notifications.map((n) => (
              <li
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  backgroundColor: n.isRead ? "#f9fafb" : "#e1f5fe",
                  padding: "15px 20px",
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                  boxShadow: n.isRead ? "none" : "0 0 10px #29b6f6",
                  transition: "background-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#bbdefb";
                  e.currentTarget.style.boxShadow = "0 0 15px #42a5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = n.isRead ? "#f9fafb" : "#e1f5fe";
                  e.currentTarget.style.boxShadow = n.isRead ? "none" : "0 0 10px #29b6f6";
                }}
              >
                <strong style={{ fontSize: "1.1rem", color: "#19398a" }}>{n.title}</strong>
                <p style={{ margin: "6px 0", color: "#555", fontSize: "0.9rem" }}>{n.message}</p>
                <small style={{ color: "#999", fontSize: "0.75rem" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.85;
          }
        }
        ul::-webkit-scrollbar {
          width: 6px;
        }
        ul::-webkit-scrollbar-thumb {
          background-color: #90caf9;
          border-radius: 3px;
        }
        ul::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </>
  );
};

export default Notification;
