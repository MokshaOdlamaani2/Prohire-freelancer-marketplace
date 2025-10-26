import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProposalForm from "../components/ProposalForm";
import api from "../api";
import "../styles/pagesstylef.css";

const ProposalFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [projectId, setProjectId] = useState(null);

  // Extract projectId from URL query
  useEffect(() => {
    const pid = new URLSearchParams(location.search).get("projectId");
    console.log("🔹 Project ID from URL:", pid);

    if (!pid) {
      setMessage("❌ Project ID is missing in the URL.");
      setProjectId(null);
    } else {
      setProjectId(pid);
    }
  }, [location.search]);

  const handleSubmit = async ({ contactInfo, portfolioLink }) => {
    if (!projectId) {
      setMessage("❌ Cannot submit: Project ID is missing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in to submit a proposal.");
      return;
    }

    setSubmitting(true);
    setMessage("Submitting proposal...");

    try {
      // Validate projectId format
      if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
        setMessage("❌ Invalid Project ID format.");
        setSubmitting(false);
        return;
      }

      const url = `/projects/${projectId}/apply`;
      console.log("🔹 Axios full request URL:", `${api.defaults.baseURL}${url}`);
      console.log("🔹 Payload:", { contactInfo, portfolioLink });

      const response = await api.post(url, { contactInfo, portfolioLink });
      console.log("✅ Response from server:", response.data);

      setMessage("✅ Proposal submitted successfully!");
      setTimeout(() => navigate("/projects"), 2000);
    } catch (err) {
      console.error("❌ AxiosError:", err);

      if (err.response) {
        setMessage(
          `❌ ${err.response.data.message || "Failed to submit proposal."} (Status: ${err.response.status})`
        );
      } else if (err.request) {
        setMessage("❌ No response from server. Check backend is running.");
      } else {
        setMessage(`❌ Error: ${err.message}`);
      }
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
