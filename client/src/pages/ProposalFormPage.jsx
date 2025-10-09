import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProposalForm from "../components/ProposalForm";
import axios from "axios";
import "../styles/pagesstylef.css";

const ProposalFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async ({ contactInfo, portfolioLink }) => {
    if (!projectId) {
      setMessage("❌ Project ID is missing in the URL.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ You must be logged in to submit a proposal.");
        return;
      }

      await axios.post(
        `/api/projects/${projectId}/apply`,
        { contactInfo, portfolioLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Proposal submitted successfully!");
      setTimeout(() => navigate("/projects"), 2000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit proposal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2>Submit Your Proposal</h2>

      {message && <p className="alert-info">{message}</p>}

      <ProposalForm onSubmit={handleSubmit} submitting={submitting} />

      <button className="btn-link" onClick={() => navigate("/projects")}>
        ← Back to Projects
      </button>
    </div>
  );
};

export default ProposalFormPage;
