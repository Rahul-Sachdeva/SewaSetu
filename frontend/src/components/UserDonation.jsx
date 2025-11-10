import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BaseURL } from "../BaseURL";


const UserDonation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);

    // Redirect non-users
    useEffect(() => {
        if (!user) navigate("/login");
        else if (user.role !== "user") navigate("/not-authorized");
    }, [user, navigate]);

    //  Fetch donations from backend
    useEffect(() => {
        const fetchMyDonations = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${BaseURL}/api/v1/donations/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });


                // Filter donations for this user (if backend doesn't already)
                const myDonations = res.data.filter(
                    (d) => d.donor?._id === user?._id
                );

                setDonations(myDonations);
            } catch (err) {
                console.error("Error fetching donations:", err);
            }
        };

        if (user) fetchMyDonations();
    }, [user]);

    if (!user) return null;

    return (
        <div
            style={{
                fontFamily: "'Inter', Arial, sans-serif",
                background: "#f4f6f8",
                minHeight: "100vh",
            }}
        >
            <Navbar />
            <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                    }}
                >
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f2a66" }}>
                        📦 My Donations
                    </h1>
                    <Link
                        to="/donate"
                        style={{
                            backgroundColor: "#19398a",
                            color: "#fff",
                            padding: "12px 20px",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 16,
                            boxShadow: "0 4px 8px rgba(25, 57, 138, 0.3)",
                        }}
                    >
                        + Make a New Donation
                    </Link>
                </div>

                {donations.length === 0 ? (
                    <p style={{ textAlign: "center", marginTop: 20 }}>
                        You haven’t made any donations yet. Click “Make a New Donation” to
                        start helping others!
                    </p>
                ) : (
                    donations.map((donation) => (
                        <div
                            key={donation._id}
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                                marginBottom: 20,
                                padding: 20,
                            }}
                        >
                            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#123180" }}>
                                {donation.title}
                            </h2>
                            <p>
                                <strong>Donation ID:</strong> {donation.donation_id}
                            </p>
                            <p>
                                <strong>Type:</strong> {donation.type}
                            </p>
                            <p>
                                <strong>Quantity:</strong> {donation.quantity}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span
                                    style={{
                                        color:
                                            donation.status === "pending"
                                                ? "#d97706"
                                                : donation.status === "accepted"
                                                    ? "#16a34a"
                                                    : donation.status === "rejected"
                                                        ? "#dc2626"
                                                        : "#2563eb",
                                        fontWeight: 600,
                                    }}
                                >
                                    {donation.status}
                                </span>
                            </p>
                            <p>
                                <strong>Pickup Date:</strong>{" "}
                                {donation.pickupDate || "Not Scheduled"}
                            </p>
                            <p>
                                <strong>Pickup Time:</strong>{" "}
                                {donation.pickupTime || "Not Scheduled"}
                            </p>
                            <p>
                                <strong>Location:</strong> {donation.location}
                            </p>
                            <p>
                                <strong>Description:</strong> {donation.description}
                            </p>

                            {donation.images && donation.images.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <strong>Images:</strong>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 10,
                                            marginTop: 6,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {donation.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`donation-${idx}`}
                                                style={{
                                                    width: 120,
                                                    height: 100,
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                    border: "1px solid #ddd",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default UserDonation;
