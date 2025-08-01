import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ProposalForm from "../components/ProposalForm";
import { toast } from "react-toastify";
import "../styles/pagesstyle.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(null);
    setProject(null);
    setLoading(true);

    axios
      .get(`/api/projects/${id}`)
      .then((res) => {
        setProject(res.data.data); // Assumes backend sends { data: { ...project } }
        setLoading(false);
      })
      .catch(() => {
        setError("❌ Failed to fetch project. Please try again.");
        setLoading(false);
      });
  }, [id]);

  const handleProposalSubmit = async ({ portfolioLink, contactInfo }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to submit a proposal.");
        return;
      }

      await axios.post(
        `/api/projects/${id}/apply`,
        { portfolioLink, contactInfo },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✅ Proposal submitted!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Error submitting proposal");
    }
  };

  if (loading) return <p className="loading-text">Loading project...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="project-details-container">
      <h2 className="section-title">{project.title || "Untitled Project"}</h2>
      <p className="project-description">
        {project.description || "No description provided."}
      </p>

      <div className="project-meta">
        <span className="budget-tag">💰 Budget: ₹{project.budget ?? "N/A"}</span>
        <span className="project-deadline">
          🕒 Deadline:{" "}
          {project.deadline
            ? new Date(project.deadline).toLocaleDateString()
            : "Flexible"}
        </span>
      </div>

      {!submitted ? (
        <>
          <h3 className="section-subtitle">Submit Your Proposal</h3>
          <ProposalForm onSubmit={handleProposalSubmit} />
        </>
      ) : (
        <p className="success-message">
          ✅ Thank you for your proposal! The client will review it soon.
        </p>
      )}
    </div>
  );
};

export default ProjectDetails;
