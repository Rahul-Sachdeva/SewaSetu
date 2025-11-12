import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Donate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    coordinates: "",
    category: "",
    description: "",
    quantity: "",
    images: [],
  });

  // /* -------------------------------------------------------------------------- */
  // /* 🧠 1️⃣ Prefill from chatbot (localStorage + live event listener)           */
  // /* -------------------------------------------------------------------------- */
  // const applyPrefillData = () => {
  //   const storedPrefill = localStorage.getItem("prefillRequestForm");
  //   if (storedPrefill) {
  //     try {
  //       const prefillData = JSON.parse(storedPrefill);

  //       // Filter out empty or undefined values
  //       const validFields = Object.entries(prefillData).reduce((acc, [key, value]) => {
  //         if (value !== "" && value !== null && value !== undefined) acc[key] = value;
  //         return acc;
  //       }, {});

  //       setFormData((prev) => ({ ...prev, ...validFields }));

  //       // ✅ Clear prefill after applying
  //       localStorage.removeItem("prefillRequestForm");
  //     } catch (err) {
  //       console.error("⚠️ Invalid prefill data:", err);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   // Load prefill on mount
  //   applyPrefillData();

  //   // Listen for live chatbot prefill events
  //   window.addEventListener("chatbotPrefill", applyPrefillData);
  //   return () => window.removeEventListener("chatbotPrefill", applyPrefillData);
  // }, []);

  /* -------------------------------------------------------------------------- */
  /* 👤 2️⃣ User defaults from Auth context                                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
        address: prev.address || user.address || "",
      }));
    }
  }, [user]);

  /* -------------------------------------------------------------------------- */
  /* 🧾 3️⃣ Form Logic (same as before)                                         */
  /* -------------------------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/select-ngo-don", { state: { formData } });
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 4️⃣ Form Layout                                                        */
  /* -------------------------------------------------------------------------- */
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
            One Click to Donate, One Visit to Collect
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "2rem" }}>
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
                }}
              />
            </div>

            {/* Phone + Email */}
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                  pattern="^\d{10}$"
                  style={{
                    width: "100%",
                    padding: "1rem 1.2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@gmail.com"
                  style={{
                    width: "100%",
                    padding: "1rem 1.2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                  }}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Anytown"
                required
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Donation Category
              </label>
              <select
                name="category"
                value={formData.category}
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
                <option value="">Select Category</option>
                <option value="Food & Shelter">Food</option>
                <option value="Clothes">Clothes</option>
                <option value="Medical">Health & Medicine</option>
                <option value="Education Support">Books</option>
                <option value="Emergency/Disaster Relief">Electronics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Describe Your Donation
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain what kind of help you need..."
                required
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  minHeight: 120,
                }}
              />
            </div>

            {/* Quantity */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity (e.g., 10 food packets)"
                required
                min="1"
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  fontSize: "1rem",
                }}
              />
            </div>


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
              Select NGOs
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Donate;
