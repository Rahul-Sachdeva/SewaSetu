import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ adjust path if needed

const UserDonation = () => {
  const [donations, setDonations] = useState([]);

  // Simulate fetching donations — replace with API call later
  useEffect(() => {
    const mockDonations = [
      {
        _id: "1",
        title: "Winter Clothes for Kids",
        type: "Clothes",
        quantity: 50,
        status: "Pending",
        createdAt: "2025-09-10",
      },
      {
        _id: "2",
        title: "Books for Community Library",
        type: "Books",
        quantity: 120,
        status: "Accepted",
        createdAt: "2025-08-18",
      },
    ];
    setDonations(mockDonations);
  }, []);

  return (
    <>
      {/* ✅ Navbar added here */}
      <Navbar />

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>📦 My Donations</h1>
          <Link to="/donate" style={styles.addBtn}>
            + Make a New Donation
          </Link>
        </header>

        {donations.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You haven’t made any donations yet.</p>
            <Link to="/donate" style={styles.primaryBtn}>
              Make your first donation
            </Link>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td style={styles.td}>{d.title}</td>
                    <td style={styles.td}>{d.type}</td>
                    <td style={styles.td}>{d.quantity}</td>
                    <td
                      style={{
                        ...styles.td,
                        color:
                          d.status === "Accepted"
                            ? "green"
                            : d.status === "Rejected"
                            ? "red"
                            : "#123180ff",
                        fontWeight: "600",
                      }}
                    >
                      {d.status}
                    </td>
                    <td style={styles.td}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

// ✅ Inline styles (optional: move to CSS)
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#123180ff",
  },
  addBtn: {
    background: "#123180ff",
    color: "#fff",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    marginTop: "3rem",
    fontSize: "1.2rem",
  },
  primaryBtn: {
    display: "inline-block",
    marginTop: "1rem",
    background: "#123180ff",
    color: "#fff",
    padding: "0.7rem 1.4rem",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  th: {
    background: "#f4f6fb",
    color: "#333",
    padding: "1rem",
    textAlign: "left",
  },
  td: {
    padding: "0.9rem 1rem",
    borderBottom: "1px solid #eee",
  },
};

export default UserDonation;
