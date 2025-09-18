import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../BaseURL";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("❌ Invalid verification link.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(`${BaseURL}/api/v1/user/verify-email`,{token});
        setMessage(`✅ ${res.data.message || "Email verified successfully!"}`);
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setMessage(`❌ ${err.response?.data?.message || "Verification failed."}`);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md text-center">
        <img src="/src/assets/logo.png" alt="SewaSetu" className="mx-auto mb-4 h-14" />
        <h1 className="text-2xl font-bold text-[#19398a] mb-2">Email Verification</h1>
        <p className={`mt-2 text-lg font-medium ${loading ? "text-gray-600" : message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
        {!loading && (
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-[#19398a] text-white rounded-lg font-semibold hover:bg-[#2e58c2] transition"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
