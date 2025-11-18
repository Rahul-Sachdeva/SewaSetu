import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BaseURL } from "../BaseURL";

const NgoDonation = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState(null); // handle ID of donation being scheduled
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerContact, setVolunteerContact] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect based on auth and role
  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "ngo") navigate("/not-authorized");
  }, [user, navigate]);

  const fetchDonations = async () => {
    if (!user || user.role !== "ngo") return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BaseURL}/api/v1/donations/ngo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const updateStatus = async (handlingId, status, scheduledDetails) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const payload = { donationHandlingId: handlingId, status };

      if (scheduledDetails) payload.scheduled_details = scheduledDetails;

      console.log("Sending update-status payload:", payload);

      const res = await fetch(`${BaseURL}/api/v1/donations/update-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to update status:", errorData);
        alert(`Failed to update status: ${errorData.message || "Unknown error"}`);
        return;
      }

      // On success, update UI state
      setDonations((prev) =>
        prev.map((req) =>
          req._id === handlingId ? { ...req, status, scheduled_details: scheduledDetails } : req
        )
      );

      if (status === "scheduled") closeScheduleModal();
    } catch (err) {
      console.error("Error in updateStatus:", err);
      alert("Unexpected error updating status. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const openScheduleModal = (handlingId) => {
    setScheduleModal(handlingId);
    // Reset form fields on modal open
    setVolunteerName("");
    setVolunteerContact("");
    setScheduleDate("");
    setScheduleTime("");
  };

  const closeScheduleModal = () => {
    setScheduleModal(null);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!volunteerName || !volunteerContact || !scheduleDate || !scheduleTime) {
      alert("Please fill all scheduling details");
      return;
    }
    const scheduledDetails = {
      volunteer_name: volunteerName,
      volunteer_contact: volunteerContact,
      schedule_date: scheduleDate,
      schedule_time: scheduleTime,
    };
    updateStatus(scheduleModal, "scheduled", scheduledDetails);
  };

  // Render status progress bar with stages: pending -> accepted -> scheduled -> completed
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

  if (loading) return <p className="text-center mt-10">Loading donations...</p>;

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "0rem", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0f2a66", textAlign: "center" }}>
          Incoming Donations
        </h2>

        {donations.length === 0 ? (
          <p style={{ textAlign: "center" }}>No incoming donations yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {donations.map((req) => (
              <div key={req._id} style={{ background: "#fff", borderRadius: 20, padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0f2a66", marginBottom: "0.5rem" }}>
                  {req.donar_id?.full_name}
                </h3>
                {req.donar_id?.image && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={req.donar_id.image} // URL/path to the image
                      alt={`Donation ${req.donar_id._id}`}
                      style={{ width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}
                <p><strong>Category:</strong> {req.donar_id?.category}</p>
                <p><strong>Quantity:</strong> {req.donar_id?.quantity || "Not specified"}</p>
                <p><strong>Description:</strong> {req.donar_id?.description}</p>
                <p><strong>Address:</strong> {req.donar_id?.address}</p>
                <p><strong>Phone:</strong> {req.donar_id?.phone || "N/A"}</p>
                <p><strong>Status:</strong> {req.status.charAt(0).toUpperCase() + req.status.slice(1)}</p>

                {renderStatusBar(req.status)}

                {/* Show schedule details if status is scheduled or later and scheduled_details exist */}
                {(req.status === "scheduled" || req.status === "completed") && req.scheduled_details && (
                  <div
                    style={{
                      marginTop: "1rem",
                      backgroundColor: "#f0f6ff",
                      borderRadius: 12,
                      padding: "1rem",
                      boxShadow: "inset 0 0 8px rgba(49, 130, 206, 0.3)",
                      color: "#0f2a66",
                      fontWeight: "500",
                    }}
                  >
                    <p><strong>Volunteer Name:</strong> {req.scheduled_details.volunteer_name}</p>
                    <p><strong>Volunteer Contact:</strong> {req.scheduled_details.volunteer_contact}</p>
                    <p><strong>Scheduled Date:</strong> {req.scheduled_details.schedule_date}</p>
                    <p><strong>Scheduled Time:</strong> {req.scheduled_details.schedule_time}</p>
                  </div>
                )}
                {req.feedbackGiven && (
                  <div
                    style={{
                      marginTop: "1rem",
                      backgroundColor: "#e9f7ef",
                      borderRadius: 12,
                      padding: "1rem",
                      boxShadow: "inset 0 0 8px rgba(72, 180, 97, 0.3)",
                      color: "#276749",
                      fontWeight: "500",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <p><strong>User Feedback</strong></p>
                    <p>Rating: {"⭐".repeat(req.feedbackRating || 0)}</p>
                    <p>Comments: {req.feedbackComments || "No comments provided."}</p>
                    <small>Given on: {req.feedbackDate ? new Date(req.feedbackDate).toLocaleDateString() : "N/A"}</small>
                  </div>
                )}


                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  {/* Buttons logic unchanged */}
                  {req.status === "pending" && (
                    <>
                      <button disabled={actionLoading} onClick={() => updateStatus(req._id, "accepted")}
                        style={{ flex: 1, padding: "0.8rem", borderRadius: 8, background: "#0f2a66", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                        Accept
                      </button>
                      <button disabled={actionLoading} onClick={() => updateStatus(req._id, "rejected")}
                        style={{ flex: 1, padding: "0.8rem", borderRadius: 8, background: "#e53e3e", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === "accepted" && (
                    <button disabled={actionLoading} onClick={() => openScheduleModal(req._id)}
                      style={{ flex: 1, padding: "0.8rem", borderRadius: 8, background: "#3182ce", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                      Schedule
                    </button>
                  )}

                  {req.status === "scheduled" && !req.userConfirmed && (
                    <p style={{ flex: 1, padding: "0.8rem", borderRadius: 8, background: "#f6ad55", color: "#fff", fontWeight: 600, textAlign: "center" }}>
                      Waiting for user pickup confirmation
                    </p>
                  )}

                  {req.status === "scheduled" && req.userConfirmed && (
                    <button disabled={actionLoading} onClick={() => updateStatus(req._id, "completed")}
                      style={{ flex: 1, padding: "0.8rem", borderRadius: 8, background: "#718096", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Scheduling Modal */}
      {scheduleModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <form onSubmit={handleScheduleSubmit} style={{ background: "#fff", padding: 20, borderRadius: 8, width: 320 }}>
            <h3 style={{ marginBottom: 12 }}>Schedule Pickup/Drop</h3>
            <label>
              Volunteer Name:
              <input type="text" value={volunteerName} onChange={(e) => setVolunteerName(e.target.value)} required style={{ width: "100%", marginBottom: 10 }} />
            </label>
            <label>
              Volunteer Contact:
              <input type="text" value={volunteerContact} onChange={(e) => setVolunteerContact(e.target.value)} required style={{ width: "100%", marginBottom: 10 }} />
            </label>
            <label>
              Schedule Date:
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required style={{ width: "100%", marginBottom: 10 }} />
            </label>
            <label>
              Schedule Time:
              <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} required style={{ width: "100%", marginBottom: 10 }} />
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={closeScheduleModal} style={{ padding: "6px 12px" }}>Cancel</button>
              <button type="submit" style={{ padding: "6px 12px", backgroundColor: "#3182ce", color: "#fff" }} disabled={actionLoading}>Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NgoDonation;