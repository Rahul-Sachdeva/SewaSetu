import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"; // Import useAuth to get user info

const Request = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from context

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    coordinates: "",
    category: "",
    description: "",
    priority: "Normal",
    file: null,
  });

  // Use useEffect to set initial formData if user details exist
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/select-ngo", { state: { formData } });
  };

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
        <section style={{ width: "100%", maxWidth: 800, background: "#fff", borderRadius: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.08)", padding: "3rem 2.5rem", transition: "all 0.3s" }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: "700", marginBottom: "2.5rem", color: "#0f2a66", textAlign: "center" }}>
            Need Help? Submit Your Request
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "2rem" }}>
            {/* Full Name */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Jane Doe" required
                style={{ width: "100%", padding: "1rem 1.2rem", border: "1px solid #d1d5db", borderRadius: 12, fontSize: "1rem", outline: "none", transition: "all 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Contact Information */}
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {/* Phone */}
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                  pattern="^\d{10}$"
                  title="Please enter a valid 10-digit phone number"
                  style={{
                    width: "100%",
                    padding: "1rem 1.2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    fontSize: "1rem",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              {/* Email */}
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="email@gmail.com"
                  title="Please enter a valid Gmail address"
                  style={{
                    width: "100%",
                    padding: "1rem 1.2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    fontSize: "1rem",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>



            </div>

            {/* Address */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, Anytown" required
                style={{ width: "100%", padding: "1rem 1.2rem", border: "1px solid #d1d5db", borderRadius: 12, fontSize: "1rem", outline: "none", transition: "all 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>


            {/* Coordinates */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Current Location Coordinates (optional)</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input
                  type="text"
                  name="coordinates"
                  value={formData.coordinates}
                  onChange={handleChange}
                  placeholder="e.g., 30.7333, 76.7794"
                  style={{
                    flex: 1,
                    padding: "1rem 1.2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    fontSize: "1rem",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
                          setFormData((prev) => ({ ...prev, coordinates: coords }));
                        },
                        (error) => {
                          console.error("Error fetching location:", error);
                          alert("Unable to fetch location. Please allow location access or enter manually.");
                        }
                      );
                    } else {
                      alert("Geolocation is not supported by your browser.");
                    }
                  }}
                  style={{
                    padding: "0.8rem 1rem",
                    borderRadius: 8,
                    border: "1px solid #0f2a66",
                    background: "#0f2a66",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#0c1f52")}
                  onMouseLeave={(e) => (e.target.style.background = "#0f2a66")}
                >
                  Use my location
                </button>
              </div>
            </div>


            {/* Category */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Assistance Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                style={{ width: "100%", padding: "1rem 1.2rem", border: "1px solid #d1d5db", borderRadius: 12, fontSize: "1rem", outline: "none", transition: "all 0.2s" }}
              >
                <option value="">Select Category</option>
                <option value="Food & Shelter">Food & Shelter</option>
                <option value="Clothes">Clothes</option>
                <option value="Medical">Medical Help</option>
                <option value="Education Support">Education Support</option>
                <option value="Financial Help">Financial Help</option>
                <option value="Legal Assistance">Legal Assistance</option>
                <option value="Emergency/Disaster Relief">Emergency/Disaster Relief</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Describe Your Need</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Explain what kind of help you need..." required
                style={{ width: "100%", padding: "1rem 1.2rem", border: "1px solid #d1d5db", borderRadius: 12, minHeight: 120, fontSize: "1rem", outline: "none", transition: "all 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Priority
              </label>
              <div style={{ display: "flex", gap: "1rem", marginTop: 6 }}>
                {["Normal", "Emergency"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: type })}
                    style={{
                      flex: 1,
                      padding: "0.8rem 1rem",
                      borderRadius: 8,
                      border: formData.priority === type ? "2px solid #0f2a66" : "1px solid #d1d5db",
                      background: formData.priority === type ? "#0f2a66" : "#fff",
                      color: formData.priority === type ? "#fff" : "#374151",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.3s",
                    }}
                  >
                    {type} Help
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                marginTop: "1.5rem",
                background: "#0f2a66",
                color: "#fff",
                padding: "1.2rem",
                fontSize: "1.1rem",
                fontWeight: "700",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#0c1f52")}
              onMouseLeave={(e) => (e.target.style.background = "#0f2a66")}
            >
              Select NGOs
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Request;
