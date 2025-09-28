import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../BaseURL";

const Notification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications API
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

  // Mark notification read by ID
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Handle click on notification to navigate
  const handleClick = (notification) => {
    markAsRead(notification._id);
    // Example deep link routing based on notification data
    if (notification.referenceModel === "RequestHandling") {
      navigate("/user-requests");
    } else if (notification.referenceModel === "AssistanceRequest") {
      navigate("/ngo-requests");
    } else {
      navigate("/"); // fallback
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!notifications.length) return <p>No notifications found</p>;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>
        Notifications {unreadCount > 0 && (
          <span style={{
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            padding: "0 8px",
            marginLeft: 8,
            fontSize: "0.8rem"
          }}>
            {unreadCount}
          </span>
        )}
      </h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {notifications.map((n) => (
          <li
            key={n._id}
            onClick={() => handleClick(n)}
            style={{
              backgroundColor: n.isRead ? "#f6f6f6" : "#e0f7fa",
              padding: "10px 15px",
              marginBottom: 10,
              borderRadius: 6,
              cursor: "pointer",
              boxShadow: n.isRead ? "none" : "0 0 8px #00acc1"
            }}
          >
            <strong>{n.title}</strong>
            <p style={{ margin: "4px 0" }}>{n.message}</p>
            <small style={{ color: "#666" }}>{new Date(n.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
