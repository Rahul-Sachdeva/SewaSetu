// src/components/DonationForm.jsx
import { useState } from "react";
import api from "../services/api";

export default function DonationForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    type: "",
    description: "",
    quantity: "",
    image: null,
    pickupDate: "",
    pickupTime: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      await api.post("/donations", formData);
      alert("✅ Donation submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting donation.");
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
        justifyContent: "center",
        alignItems: "center",
        padding: "0rem",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: '1600px',
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          padding: "3rem 2.5rem",
          margin: "0 auto"
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
          One Click to Donate, One Visit to Collect
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "2rem",
          }}
        >
          {/* Name */}
          <div>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={{
                width: "100%",
                padding: "1rem 1.2rem",
                border: "1px solid #d1d5db",
                borderRadius: 12,
                fontSize: "1rem",
                outline: "none",
              }}
            />
          </div>

          {/* Contact */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="1234567890"
                required
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Email (optional)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>


          {/* Location */}
          <div>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Pickup Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="123 Main St, City"
              required
              style={{
                width: "100%",
                padding: "1rem 1.2rem",
                border: "1px solid #d1d5db",
                borderRadius: 12,
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Item Type */}
          <div>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Item Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "1rem",
                border: "1px solid #d1d5db",
                borderRadius: 12,
                fontSize: "1rem",
              }}
            >
              <option value="">Select Item Type</option>
              <option value="Food">Food</option>
              <option value="Clothes">Clothes</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description + Quantity */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the items you want to donate"
                required
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  minHeight: 100,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="Enter quantity"
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                }}
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Upload Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                border: "1px dashed #d1d5db",
                borderRadius: 12,
              }}
            />
          </div>

          {/* Pickup Date & Time */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Pickup Date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={form.pickupDate}
                onChange={handleChange}
                required
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} 
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Pickup Time
              </label>
              <input
                type="time"
                name="pickupTime"
                value={form.pickupTime}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                }}
              />
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
          >
            Submit Donation
          </button>
        </form>
      </section>
    </div>
  );
}
