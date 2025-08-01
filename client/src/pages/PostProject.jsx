import React, { useState } from "react";
import axios from "axios";
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
  const [success, setSuccess] = useState(false); // ✅ Success flag

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, budget, skillsRequired, deadline } = form;

    if (
      !title.trim() ||
      !description.trim() ||
      !budget ||
      !skillsRequired.trim() ||
      !deadline
    ) {
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
      skillsRequired: skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      deadline: new Date(deadline).toISOString(),
    };

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in as a client to post a project");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/projects", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Project posted successfully!");
      setSuccess(true); // ✅ Show success message

      // Reset form
      setForm({
        title: "",
        description: "",
        budget: "",
        skillsRequired: "",
        deadline: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

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
              autoFocus
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

          {/* ✅ Success Message */}
          {success && (
            <p className="success-message" style={{ marginTop: "1rem", color: "green" }}>
              ✅ Project posted successfully! You can view it in your dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostProject;
