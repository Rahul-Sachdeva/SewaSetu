import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!formData) {
      navigate("/request");
      return;
    }

    console.log("Fetching NGOs with:", {
      verification_status: "pending",
      city: user?.city,
      category: formData.category,
    });

    // Build query parameters including verification_status, city from logged-in user, and category from form
    const fetchNgos = async () => {
      try {
<<<<<<< HEAD
        const res = await fetch("http://localhost:3000/api/v1/ngo");
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
=======
        const params = new URLSearchParams({
          verification_status: "pending",
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
>>>>>>> 8794c1d (Implementing Request Assistance Workflow, NGO Dashboard, User Dashboard, Notification setup)
      }
    };

    fetchNgos();
  }, [formData, user?.city, navigate]);

 const toggleNgoSelection = (ngoId) => {
  setSelectedNgos((prevSelected) => {
    if (prevSelected.includes(ngoId)) {
      setError("");
      return prevSelected.filter(id => id !== ngoId);
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

useEffect(() => {
  console.log("selectedNgos updated:", selectedNgos);
}, [selectedNgos]);


  const handleConfirm = async () => {
    if (selectedNgos.length === 0) {
      setError("Please select at least one NGO");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("selectedNgos:", selectedNgos);
      const reqBody = {
        full_name: formData.name,                // rename from name to full_name
        phone: formData.phone || "",
        address: formData.address,
        category: formData.category,
        description: formData.description,
        priority: formData.priority || "Normal",
        requestedBy: user?.id,                    // user id from AuthContext
        selectedNGOs: selectedNgos,              // rename from ngosRequested to selectedNGOs
        // Add coordinates if backend supports or expects them
        location_coordinates: formData.coordinates
          ? formData.coordinates.split(",").map(coord => parseFloat(coord.trim()))
          : undefined,
      };

      console.log("Submitting request body:", reqBody);


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

  if (!formData) return null; // or a loader

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", minHeight: "100vh", background: "#f4f6f8" }}>
      <Navbar />
      <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: "#0f2a66", marginBottom: 20, fontSize: 30, fontWeight: 700 }}>Select NGOs to Request Assistance</h1>

        {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

<<<<<<< HEAD
                {/* NGO Details */}
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#0f2a66" }}>{ngo.name}</h3>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>City:</strong> {ngo.city}, {ngo.state}
                </p>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Contact:</strong> {ngo.phone} {ngo.email ? ` / ${ngo.email}` : ""}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1rem" }}>
                  {ngo.description && ngo.description?.length > 100 ? ngo.description.slice(0, 100) + "..." : ngo.description}
                </p>
=======
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {ngos.length === 0 && <p>No NGOs found for this category and city.</p>}
>>>>>>> 8794c1d (Implementing Request Assistance Workflow, NGO Dashboard, User Dashboard, Notification setup)

          {ngos.map((ngo) => (
            <div
              key={ngo._id}
              onClick={() => toggleNgoSelection(ngo._id)}
              style={{
                border: selectedNgos.includes(ngo._id) ? "2px solid #19398a" : "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                cursor: "pointer",
                backgroundColor: selectedNgos.includes(ngo._id) ? "#dbeafe" : "#fff",
                userSelect: "none",
                transition: "background-color 0.3s, border-color 0.3s",
              }}
            >
              <h3 style={{ margin: "0 0 8px" }}>{ngo.name}</h3>
              <p style={{ fontSize: 14, color: "#555" }}>{ngo.description || "No description available."}</p>
              <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
                Location: {ngo.city}, {ngo.state}
              </p>
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
    </div>
  );
};

export default SelectNGOs;
