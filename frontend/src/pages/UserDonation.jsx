import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BaseURL } from "../BaseURL";
import { Link } from "react-router-dom";

// Feedback Modal component
const FeedbackModal = ({ isOpen, onClose, ngoId, donationHandlingId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ ngoId, donationHandlingId, rating, comments });
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000,
    }}>
      <form style={{ background: "#fff", padding: 20, borderRadius: 8, width: 320 }}
        onSubmit={handleSubmit}>
        <h3>Give Feedback</h3>
        <label>
          Rating:
          <select value={rating} onChange={e => setRating(parseInt(e.target.value))} style={{ width: "100%", marginBottom: 10 }}>
            {[5, 4, 3, 2, 1].map(val => (<option key={val} value={val}>{val} Stars</option>))}
          </select>
        </label>
        <label>
          Comments:
          <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} style={{ width: "100%", marginBottom: 10 }} />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ backgroundColor: "#38a169", color: "#fff", padding: "6px 12px", borderRadius: 4 }}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

const UserDonation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For feedback modal
  const [feedbackModalInfo, setFeedbackModalInfo] = useState({ isOpen: false, ngoId: null, donationHandlingId: null });

  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "user") navigate("/not-authorized");
  }, [user, navigate]);

  const fetchUserDonations = async () => {
    if (!user || user.role !== "user") return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BaseURL}/api/v1/donations/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch donations");
      const data = await res.json();
      setDonations(data);
    } catch (err) {
      console.error("Failed to fetch user donations", err);
      setError("Failed to load your donations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDonations();
  }, [user]);

  // Status bar helper
  const renderStatusBar = (status) => {
    const stages = ["pending", "accepted", "scheduled", "completed"];
    return (
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        {stages.map((stage) => (
          <div
            key={stage}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: stages.indexOf(stage) <= stages.indexOf(status) ? "#3182ce" : "#e2e8f0",
            }}
          />
        ))}
      </div>
    );
  };

  // Confirm pickup API call
  const confirmPickUp = async (handlingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BaseURL}/api/v1/donations/confirm-pickup`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ donationHandlingId: handlingId }),
      });
      if (res.ok) {
        // Update local state
        setDonations((prev) =>
          prev.map((req) =>
            req.handling?.some(h => h._id === handlingId)
              ? {
                ...req,
                handling: req.handling.map(h =>
                  h._id === handlingId ? { ...h, userConfirmed: true } : h
                )
              }
              : req
          )
        );
      } else {
        console.error("Failed to confirm pickup");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openFeedbackModal = (ngoId, donationHandlingId) => {
    setFeedbackModalInfo({ isOpen: true, ngoId, donationHandlingId });
  };

  const closeFeedbackModal = () => {
    setFeedbackModalInfo({ isOpen: false, ngoId: null, donationHandlingId: null });
  };

  // Submit feedback API call
  const submitFeedback = async ({ ngoId, donationHandlingId, rating, comments }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BaseURL}/api/v1/donations/feedback`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ngoId, donationHandlingId, rating, comments }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      // Optionally update local state to mark feedback given
      setDonations((prev) =>
        prev.map((req) => ({
          ...req,
          handling: req.handling.map((h) =>
            h._id === donationHandlingId ? { ...h, feedbackGiven: true } : h
          ),
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback. Please try again later.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading your donations...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#0f2a66", textAlign: "center" }}>
          Your Donations & NGO Acceptance Status
        </h1>

        {donations.length === 0 ? (
          <>
            <p style={{ textAlign: "center", paddingBottom: 40 }}>
              No donations found. You can create a new donation to donate.
            </p>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Link
                to="/donate"
                style={{
                  backgroundColor: "#19398a",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: 16,
                  boxShadow: "0 4px 8px rgba(25, 57, 138, 0.3)",
                }}
              >
                Donations
              </Link>
            </div>
          </>
        ) : (
          donations.map((donation) => (
            <div key={donation._id} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 10px 20px rgba(0,0,0,0.05)", marginBottom: 20, padding: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#123180" }}>
                Donation ID: {donation._id}
              </h2>
              <p><strong>Category:</strong> {donation.category}</p>
              <p><strong>Description:</strong> {donation.description}</p>
              <p><strong>Quantity:</strong> {donation.quantity || "Not specified"}</p>
              <p><strong>Location:</strong> {donation.address}</p>
              <p><strong>Date Submitted:</strong> {new Date(donation.createdAt).toLocaleDateString()}</p>

              <details style={{ marginTop: 15 }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#0f2a66" }}>
                  NGOs Requested ({donation.selectedNGOs.length || 0})
                </summary>

                <div style={{ marginTop: 10 }}>
                  {donation.handling && donation.handling.length > 0 ? (
                    donation.handling.map((handle) => (
                      <div key={handle._id} style={{
                        border: "1px solid #cbd5e0",
                        borderRadius: 10,
                        padding: "10px 15px",
                        marginBottom: 10,
                        backgroundColor: handle.status === "completed" ? "#e6fffa" : "#f9fafb",
                      }}>
                        <h4 style={{ marginBottom: 6, fontWeight: "600", color: "#2c5282" }}>
                          {handle.handledBy?.name}
                        </h4>
                        <p><strong>Status:</strong> {handle.status.charAt(0).toUpperCase() + handle.status.slice(1)}</p>
                        {renderStatusBar(handle.status)}

                        {handle.scheduled_details && (
                          <div style={{ marginTop: 8 }}>
                            <p><strong>Volunteer:</strong> {handle.scheduled_details.volunteer_name}</p>
                            <p><strong>Contact:</strong> {handle.scheduled_details.volunteer_contact}</p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(handle.scheduled_details.schedule_date).toLocaleDateString()}
                            </p>
                            <p><strong>Time:</strong> {handle.scheduled_details.schedule_time}</p>
                          </div>
                        )}



                        {handle.status === "scheduled" && !handle.userConfirmed && (
                          <button
                            onClick={() => confirmPickUp(handle._id)}
                            style={{
                              marginTop: 12,
                              padding: "8px 16px",
                              backgroundColor: "#3182ce",
                              color: "#fff",
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Confirm Pick Up
                          </button>
                        )}

                        {handle.status === "completed" && !handle.feedbackGiven && (
                          <button
                            onClick={() => openFeedbackModal(handle.handledBy._id, handle._id)}
                            style={{
                              marginTop: 12,
                              padding: "8px 16px",
                              backgroundColor: "#38a169",
                              color: "#fff",
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Give Feedback
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: "italic" }}>No NGO handling info available.</p>
                  )}
                </div>
              </details>
            </div>
          ))
        )}

        <FeedbackModal
          isOpen={feedbackModalInfo.isOpen}
          ngoId={feedbackModalInfo.ngoId}
          donationHandlingId={feedbackModalInfo.donationHandlingId}
          onClose={closeFeedbackModal}
          onSubmit={submitFeedback}
        />
      </main>
    </div>
  );
};

export default UserDonation;