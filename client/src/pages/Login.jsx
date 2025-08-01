import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/authform.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      const userId = res.data.user._id || res.data.user.id;
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setFormData({ email: "", password: "" });

      toast.success("Login successful!", {
        onClose: () => {
          const { role } = res.data.user;
          navigate(
            role === "client"
              ? "/client-dashboard"
              : role === "freelancer"
              ? "/projects" // ✅ Redirect freelancer to browse projects
              : "/admin-dashboard"
          );
        },
        autoClose: 1500,
        pauseOnHover: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Log in to your account</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <button type="submit">Login</button>
        </form>
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

        <p>
          Don't have an account? <Link to="/">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
