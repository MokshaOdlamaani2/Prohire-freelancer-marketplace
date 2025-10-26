import React, { useState, useRef } from "react";
import api from "../api"; // axios instance with baseURL
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/landingBanner.css";

import leftImg from "../assets/left.jpg";
import rightImg from "../assets/right.jpg";
import section1Img from "../assets/section1.jpg";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let { name, email, password, role } = formData;

    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (!name || !email || !password)
      return toast.error("Please fill in all required fields.");
    if (!validateEmail(email)) return toast.error("Invalid email format.");

    try {
      setLoading(true);

      // ✅ Correct endpoints — no double `/api`
      await api.post("/auth/register", { name, email, password, role });
      toast.success("Registration successful!");

      const loginRes = await api.post("/auth/login", { email, password });
      const { token, user } = loginRes.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");

      setTimeout(() => {
        navigate(
          user.role === "freelancer"
            ? "/freelancer-dashboard"
            : "/client-dashboard"
        );
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration/Login failed");
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      {/* Banner Section */}
      <section className="banner-section">
        <div
          className="banner-image banner-left"
          style={{ backgroundImage: `url(${leftImg})` }}
        />
        <div className="banner-overlay">
          <h1 className="banner-title">Work Your Way with Our "ProHire"</h1>
          <p className="banner-subtitle">
            Connect, collaborate, and grow — whether you're a client or freelancer.
          </p>
          <button className="btn-primary cta-button" onClick={scrollToForm}>
            Get Started
          </button>
        </div>
        <div
          className="banner-image banner-right"
          style={{ backgroundImage: `url(${rightImg})` }}
        />
      </section>

      {/* Benefit + Why Choose Us Sections */}
      <div className="dual-banner-container">
        <section className="banner-section2">
          <h2 className="benefits-title">What You Get</h2>
          <div className="benefit-cards">
            <div className="benefit-card">
              <h3>🌟 Quality Freelancers</h3>
            </div>
            <div className="benefit-card">
              <h3>⚡ Fast Hiring</h3>
            </div>
            <div className="benefit-card">
              <h3>🔔 Real-Time Notifications</h3>
            </div>
          </div>
        </section>

        <section className="banner-section1">
          <div className="banner-overlay1">
            <div className="banner-text">
              <h1 className="banner-title">Why Choose Us?</h1>
              <p className="banner-subtitle">
                We empower you with a secure platform, talented freelancers, and tools to
                manage your projects efficiently. Whether you're hiring or offering skills —
                we're here to make it seamless.
              </p>
              <button className="btn-primary cta-button" onClick={scrollToForm}>
                Join Now
              </button>
            </div>
            <div
              className="single-banner-image"
              style={{ backgroundImage: `url(${section1Img})` }}
            />
          </div>
        </section>

        <section
          className="banner-section3"
          aria-labelledby="freelancer-marketplace-heading"
        >
          <h2 className="benefits-title" id="freelancer-marketplace-heading">
            Freelancer Marketplace
          </h2>
          <p className="banner-subtitle">
            Our freelancer marketplace connects you with talented professionals around the world —
            from developers to designers — all ready to bring your ideas to life.
          </p>
        </section>
      </div>

      {/* Registration Form */}
      <div ref={formRef} className="form-card animated-form">
        <h2 className="form-title">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="form-body">
          <input
            className="input-field hover-input"
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="input-field hover-input"
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="input-field hover-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select
            className="input-field hover-input"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>

          <button type="submit" className="btn-primary hover-glow" disabled={loading}>
            {loading && <span className="spinner" style={{ marginRight: 8 }}>⏳</span>}
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="form-footer">
          Already have an account?{" "}
          <Link to="/login" className="link-text">
            Login here
          </Link>
        </p>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </main>
  );
};

export default Register;
