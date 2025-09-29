import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";  // import Link
import './css/Login.css';
import { useAuth } from "../context/AuthContext.jsx";
import AuthWrapper from "../components/AuthWrapper.jsx";
// also import your notification hook or utilities
import useNotificationPermission from "../hooks/useNotificationPermission"; // example

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // local state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // State to track when permission prompt needed
  const [notifyPromptNeeded, setNotifyPromptNeeded] = useState(false);

  // Call your custom hook that requests notification permission & registers token
  useNotificationPermission(notifyPromptNeeded);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.email || !formData.password) {
      setMessage("❌ Please fill in all fields.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("❌ Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage("❌ Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const res = await login(formData.email, formData.password);

    if (res.success) {
      setMessage("✅ Login Successful!");
      // If backend says notification permission is needed, trigger prompt
      if (res.user.notificationPermissionNeeded) {
        setNotifyPromptNeeded(true);
      }
      setTimeout(() => navigate("/"), 1000);
    } else {
      setMessage(`❌ ${res.message}`);
    }
    setLoading(false);
  };

    return (
        <AuthWrapper>
            <div className="login-container">
                <div className="login-logo-section">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src="/src/assets/logo.png"
                            alt="SewaSetu"
                            style={{ height: 48, marginRight: 12 }}
                        />
                        <span
                            style={{
                                color: "#123180ff",
                                fontWeight: "bold",
                                fontSize: "1.6rem",
                            }}
                        >
                            SewaSetu
                        </span>
                    </div>
                    <p className="login-title">Welcome Back!</p>
                    <p className="login-title">Login</p>
                </div>

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button
                        type="submit"
                        variant="primary"
                        className="w-full px-4 py-3 rounded-lg font-semibold pointer bg-[#19398a] hover:bg-[#2e58c2] text-white"
                        disabled={loading}
                    >
                        {loading? "Logging In": "Log In"}
                    </button>
                </form>

                {/* Error / Success Messages */}
                {message && <p className="my-2 font-semibold text-red-500">{message}</p>}

                {/* Links */}
                <div className="login-links">
                    <Link to="/forgot-password" className="login-forgot">
                        Forgot password?
                    </Link>
                    <p className="login-register-link">
                        Don’t have an account?{" "}
                        <Link to="/register-user" className="login-highlight">
                            Register&nbsp;Here!
                        </Link>
                    </p>
                    <p className="mt-1 login-register-link">
                        Are you an NGO?{" "}
                        <Link to="/register-ngo" className="login-highlight">
                            Register&nbsp;your&nbsp;NGO!
                        </Link>
                    </p>
                </div>
            </div>
        </AuthWrapper>
    )
}

export default Login;
