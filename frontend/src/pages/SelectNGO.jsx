// src/pages/SelectNGO.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const SelectNGO = () => {
  const navigate = useNavigate();
  const { requestId } = useParams(); // From previous page
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/ngo");
        if (res.ok) {
          const data = await res.json();
          setNgos(data);
        } else {
          alert("Failed to fetch NGOs");
        }
      } catch (error) {
        console.error(error);
        alert("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchNGOs();
  }, []);

  const handleSelectNGO = (ngoId) => {
    // Redirect to a page to confirm request with selected NGO
    navigate(`/confirm-request/${requestId}/${ngoId}`);
  };

  if (loading) return <div>Loading NGOs...</div>;

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", color: "#0f2a66" }}>
          Select an NGO to handle your request
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", width: "100%", maxWidth: 1000 }}>
          {ngos.length === 0 ? (
            <p>No NGOs available at the moment.</p>
          ) : (
            ngos.map((ngo) => (
              <div
                key={ngo._id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "1.5rem",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Logo */}
                {ngo.logo && (
                  <img
                    src={ngo.logo}
                    alt={ngo.name}
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, marginBottom: "1rem" }}
                  />
                )}

                {/* NGO Details */}
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#0f2a66" }}>{ngo.name}</h3>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>City:</strong> {ngo.city}, {ngo.state}
                </p>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Contact:</strong> {ngo.phone} {ngo.email ? ` / ${ngo.email}` : ""}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1rem" }}>
                  {ngo.description.length > 100 ? ngo.description.slice(0, 100) + "..." : ngo.description}
                </p>

                <button
                  onClick={() => handleSelectNGO(ngo._id)}
                  style={{
                    padding: "0.8rem 1rem",
                    borderRadius: 8,
                    border: "none",
                    background: "#0f2a66",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#0c1f52")}
                  onMouseLeave={(e) => (e.target.style.background = "#0f2a66")}
                >
                  Select NGO
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectNGO;
