// src/pages/PostProject.jsx
import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ Use your configured axios instance
import { toast } from "react-toastify";
import "../styles/pagesstyle.css";

const PostProject = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    skillsRequired: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, budget, skillsRequired, deadline } = form;

    // ✅ Basic validation
    if (!title || !description || !budget || !skillsRequired || !deadline) {
      toast.error("Please fill in all fields");
      return;
    }

    if (Number(budget) <= 0) {
      toast.error("Budget must be greater than ₹0");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
      skillsRequired: skillsRequired.split(",").map((s) => s.trim()),
      deadline: new Date(deadline).toISOString(),
    };

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in as a client to post a project");
      return;
    }

    try {
      setLoading(true);

      // ✅ Post project using configured API (which already includes baseURL)
      await api.post("/projects", payload);

      toast.success("Project posted successfully!");
      setSuccess(true);
      setForm({
        title: "",
        description: "",
        budget: "",
        skillsRequired: "",
        deadline: "",
      });
    } catch (err) {
      console.error("❌ Error posting project:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="postproject-overlay">
      <div className="postproject-wrapper">
        <div className="postproject-card">
          <h2>Post a New Project</h2>
          <p className="subtext">
            Reach talented freelancers by posting your requirements.
          </p>

          <form onSubmit={handleSubmit} className="postproject-form">
            <input
              type="text"
              name="title"
              placeholder="Project Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Describe your project (max 300 characters)"
              value={form.description}
              onChange={handleChange}
              maxLength={300}
              required
            />

            <input
              type="number"
              name="budget"
              placeholder="Budget in ₹"
              value={form.budget}
              onChange={handleChange}
              min="1"
              required
            />

            <input
              type="text"
              name="skillsRequired"
              placeholder="Skills required (comma separated)"
              value={form.skillsRequired}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Project"}
            </button>
          </form>

          {success && (
            <p
              className="success-message"
              style={{ color: "green", marginTop: "1rem" }}
            >
              ✅ Project posted successfully! You can view it in your dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostProject;
