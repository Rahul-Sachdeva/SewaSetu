import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BaseURL } from "../BaseURL";
import { useAuth } from "../context/AuthContext";

const SelectNGOs = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Form data passed from previous page
  const formData = state?.formData;

  const [ngos, setNgos] = useState([]);
  const [selectedNgos, setSelectedNgos] = useState([]);
  const [error, setError] = useState("");
  const [selectedNgoForDetails, setSelectedNgoForDetails] = useState(null); // For modal

  useEffect(() => {
    if (!formData) {
      navigate("/request");
      return;
    }
    const fetchNgos = async () => {
      try {
        const params = new URLSearchParams({
          verification_status: "verified",
          city: user?.city || "",
          category: formData.category || "",
        });
        const res = await fetch(`${BaseURL}/api/v1/ngo/filtered?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch NGOs");
        const data = await res.json();
        setNgos(data);
      } catch (err) {
        console.error("Error fetching NGOs:", err);
        setError("Failed to load NGOs. Please try again.");
      }
    };
    fetchNgos();
  }, [formData, user?.city, navigate]);

  const toggleNgoSelection = (ngoId) => {
    setSelectedNgos((prevSelected) => {
      if (prevSelected.includes(ngoId)) {
        setError("");
        return prevSelected.filter((id) => id !== ngoId);
      } else {
        if (prevSelected.length >= 3) {
          setError("You can select a maximum of 3 NGOs");
          return prevSelected;
        }
        setError("");
        return [...prevSelected, ngoId];
      }
    });
  };

  const handleConfirm = async () => {
    if (selectedNgos.length === 0) {
      setError("Please select at least one NGO");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const reqBody = {
        full_name: formData.name,
        phone: formData.phone || "",
        address: formData.address,
        category: formData.category,
        description: formData.description,
        priority: formData.priority || "Normal",
        requestedBy: user?.id,
        selectedNGOs: selectedNgos,
        location_coordinates: formData.coordinates
          ? formData.coordinates.split(",").map((coord) => parseFloat(coord.trim()))
          : undefined,
      };
      const res = await fetch(`${BaseURL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reqBody),
      });
      if (res.ok) {
        alert("Request submitted successfully!");
        navigate("/user-requests");
      } else {
        const errData = await res.json();
        alert("Failed to submit request: " + (errData.message || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (!formData) return null; // or loader

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", minHeight: "100vh", background: "#f4f6f8" }}>
      <Navbar />
      <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: "#0f2a66", marginBottom: 20, fontSize: 30, fontWeight: 700 }}>
          Select NGOs to Request Assistance
        </h1>

        {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {ngos.length === 0 && <p>No NGOs found for this category and city.</p>}

          {ngos.map((ngo) => (
            <div
              key={ngo._id}
              style={{
                border: selectedNgos.includes(ngo._id) ? "2px solid #19398a" : "1px solid #cbd5e0",
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                backgroundColor: selectedNgos.includes(ngo._id) ? "#dbeafe" : "#fff",
                boxShadow: selectedNgos.includes(ngo._id)
                  ? "0 8px 20px rgba(25, 57, 138, 0.2)"
                  : "0 2px 6px rgba(0,0,0,0.1)",
                userSelect: "none",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: "0 0 12px", color: "#0f2a66", fontWeight: "700", fontSize: "1.15rem", lineHeight: "1.3" }}>
                {ngo.name}
              </h3>
              <p style={{ fontSize: 14, color: "#4a5568", flexGrow: 1, marginBottom: 12, minHeight: 48 }}>
                {ngo.description || "No description available."}
              </p>
              <p style={{ fontSize: 12, color: "#718096", fontWeight: "600" }}>
                Location: {ngo.city}, {ngo.state}
              </p>

              <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "space-between" }}>
                <button
                  onClick={() => toggleNgoSelection(ngo._id)}
                  style={{
                    flex: 1,
                    backgroundColor: selectedNgos.includes(ngo._id) ? "#19398a" : "#e2e8f0",
                    color: selectedNgos.includes(ngo._id) ? "#fff" : "#333",
                    border: "none",
                    padding: "8px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {selectedNgos.includes(ngo._id) ? "Deselect" : "Select"}
                </button>
                <button
                  onClick={() => setSelectedNgoForDetails(ngo)}
                  style={{
                    flex: 1,
                    backgroundColor: "#0f2a66",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          style={{
            marginTop: 30,
            backgroundColor: "#0f2a66",
            color: "#fff",
            padding: "12px 24px",
            fontWeight: "700",
            borderRadius: 8,
            cursor: "pointer",
            border: "none",
            display: "block",
            width: "100%",
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Confirm Selection
        </button>
      </main>

      {/* Modal for NGO Details */}
      {selectedNgoForDetails && (
        <div
          onClick={() => setSelectedNgoForDetails(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              maxWidth: 700,
              width: "90%",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedNgoForDetails(null)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                cursor: "pointer",
                background: "transparent",
                border: "none",
                fontSize: 24,
                lineHeight: 1,
              }}
              aria-label="Close details"
            >
              &times;
            </button>
            <h2 style={{ marginTop: 0, marginBottom: 12, color: "#0f2a66" }}>{selectedNgoForDetails.name}</h2>
            <p><strong>Category:</strong>
              <span style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                {(selectedNgoForDetails.category || "")
                  .map(cat => (
                    <span
                      key={cat.trim()}
                      style={{
                        backgroundColor: "#dbeafe",
                        color: "#19398a",
                        padding: "6px 18px",
                        borderRadius: 9,
                        fontWeight: 300,
                        fontSize: "0.8rem",
                        marginBottom: 3,
                        display: "inline-block",
                        letterSpacing: "0.5px",
                      }}>
                      {cat.trim()}
                    </span>
                  ))
                }
              </span>
            </p>

            <p style={{ marginTop: 20}}><strong>Description:</strong> {selectedNgoForDetails.description || "No description available."}</p>
            <p><strong>Location:</strong> {selectedNgoForDetails.city}, {selectedNgoForDetails.state}</p>
            <p><strong>Contact Email:</strong> {selectedNgoForDetails.email || "N/A"}</p>
            <p><strong>Phone:</strong> {selectedNgoForDetails.phone || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectNGOs;
