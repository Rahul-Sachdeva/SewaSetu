// src/pages/Request.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";

const Request = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    location: "",
    helpType: "",
    priority: "Regular",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) formDataObj.append(key, formData[key]);
    });

    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        body: formDataObj,
      });

      if (res.ok) {
        alert("✅ Request submitted successfully!");
        setFormData({
          name: "",
          contact: "",
          location: "",
          helpType: "",
          priority: "Regular",
          file: null,
        });
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', Arial, sans-serif",
        background: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 800,
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            padding: "3rem 2.5rem",
            transition: "all 0.3s",
          }}
        >
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: "700",
              marginBottom: "2.5rem",
              color: "#0f2a66",
              textAlign: "center",
            }}
          >
            Need Help? Submit Your Request
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "2rem",
            }}
          >
            {/* Full Name */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
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

            {/* Contact */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Phone / Email
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="1234567890 / email@example.com"
                required
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

            {/* Location */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="123 Main St, Anytown"
                required
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

            {/* Help Type + File */}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Type of Help Needed
                </label>
                <textarea
                  name="helpType"
                  value={formData.helpType}
                  onChange={handleChange}
                  placeholder="Describe your need (food, clothes, medical, etc.)"
                  required
                  style={{
                    width: "100%",
                    padding: "1rem 1.2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    minHeight: 120,
                    fontSize: "1rem",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f2a66")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Upload Photo/Video
                </label>
                <div
                  style={{
                    border: "2px dashed #d1d5db",
                    borderRadius: 12,
                    padding: "2rem 1rem",
                    textAlign: "center",
                    background: "#f9fafb",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => document.getElementById("fileUpload").click()}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f9fafb")}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="fileUpload"
                  />
                  <p style={{ color: "#6b7280", fontSize: "0.95rem", margin: 0 }}>
                    {formData.file ? formData.file.name : "Drag & drop or click to upload"}
                  </p>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Priority
              </label>
              <div style={{ display: "flex", gap: "1rem", marginTop: 6 }}>
                {["Regular", "Emergency"].map((type) => (
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
              Submit Request
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Request;
