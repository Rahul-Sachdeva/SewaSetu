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
      await fetch(`${BaseURL}/api/notifications/${id}/read`, {
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
      if (notification.userModel === "NGO"){
        navigate("/ngo-requests");
      }
      else{
        navigate("/user-requests");
      }
    }
  };

  return (
    <>
      <Navbar />
      <main
        style={{
          maxWidth: 750,
          margin: "40px auto",
          fontFamily: "'Inter', Arial, sans-serif",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 8px 24px rgba(25,57,138,0.08)",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            background: "linear-gradient(90deg, #19398a 80%, #2747bb 100%)",
            color: "#fff",
            padding: "18px 32px",
            fontSize: "2rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #2747bb",
            borderRadius: "18px 18px 0 0",
          }}
        >
          <span>
            <span style={{ verticalAlign: "middle" }}>🔔</span> Notifications
          </span>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span
              style={{
                backgroundColor: "#ff1744",
                color: "#fff",
                borderRadius: "9999px",
                padding: "5px 15px",
                fontSize: "1rem",
                fontWeight: "bold",
                marginLeft: 12,
                boxShadow: "0 0 7px #ff1744",
                animation: "pulse 2s infinite",
              }}
            >
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </header>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span
              style={{
                display: "inline-block",
                borderRadius: "50%",
                width: 36,
                height: 36,
                background: "#e3f2fd",
                marginRight: 12,
                animation: "spin 1s linear infinite",
                verticalAlign: "middle",
              }}
            ></span>
            <span style={{ fontSize: "1.05rem", color: "#2747bb" }}>
              Loading notifications...
            </span>
          </div>
        ) : error ? (
          <div style={{ color: "#f44336", textAlign: "center", padding: "24px 0" }}>
            <strong>Error:</strong> {error}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <span style={{ fontSize: "1.4rem", marginRight: 8 }}>📭</span>
            No notifications found
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
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
                tabIndex={0}
                style={{
                  background: n.isRead
                    ? "#f8fafd"
                    : "linear-gradient(90deg, #e3f2fd 85%, #bbdefb 100%)",
                  borderBottom: "1px solid #e3e7ea",
                  margin: "0 18px",
                  borderRadius: 12,
                  boxShadow: n.isRead ? "none" : "0 2px 10px #90caf9",
                  transition: "background 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  padding: "22px 28px",
                  marginTop: 18,
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(90deg, #bbdefb 90%, #e3f2fd 100%)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = n.isRead
                    ? "#f8fafd"
                    : "linear-gradient(90deg, #e3f2fd 85%, #bbdefb 100%)";
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(90deg, #bbdefb 90%, #e3f2fd 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 18px #42a5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = n.isRead
                    ? "#f8fafd"
                    : "linear-gradient(90deg, #e3f2fd 85%, #bbdefb 100%)";
                  e.currentTarget.style.boxShadow = n.isRead
                    ? "none"
                    : "0 2px 10px #90caf9";
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      marginRight: 14,
                      fontSize: "1.3rem",
                      color: n.isRead ? "#90caf9" : "#19398a"
                    }}
                  >
                    {n.isRead ? "📖" : "🕑"}
                  </span>
                  <strong style={{ fontSize: "1.1rem", color: "#19398a" }}>
                    {n.title}
                  </strong>
                </div>
                <p
                  style={{
                    margin: "8px 0 0 34px",
                    color: "#333",
                    fontSize: "1rem",
                    fontWeight: 500
                  }}
                >
                  {n.message}
                </p>
                <small
                  style={{
                    marginLeft: 34,
                    color: "#999",
                    fontSize: "0.87rem",
                    letterSpacing: "0.04em"
                  }}
                >
                  {new Date(n.createdAt).toLocaleString([], {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </small>
              </li>
            ))}
          </ul>
        )}
      </main>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg);}
        }
        ul::-webkit-scrollbar {
          width: 7px;
        }
        ul::-webkit-scrollbar-thumb {
          background-color: #90caf9;
          border-radius: 4px;
        }
        ul::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </>
  );
};

export default Notification;
