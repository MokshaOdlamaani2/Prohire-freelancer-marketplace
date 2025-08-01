import React, { useEffect, useState } from "react";
import axios from "axios";
import ProposalForm from "../components/ProposalForm";
import "../styles/pagesstylef.css";

// Helper to break array into chunks of 3
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [applyingProjectId, setApplyingProjectId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/projects/");
        setProjects(res.data.data || res.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // Prevent page scroll when modal is open
  useEffect(() => {
    if (applyingProjectId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [applyingProjectId]);

  const handleApplyClick = (projectId) => {
    setApplyingProjectId(projectId);
    setMessage("");
  };

  const handleSubmitProposal = async ({ contactInfo, portfolioLink }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ You must be logged in to apply.");
        return;
      }

      await axios.post(
        `/api/projects/${applyingProjectId}/apply`,
        { contactInfo, portfolioLink },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Application submitted successfully!");
      setApplyingProjectId(null);
    } catch (err) {
      console.error("Failed to submit proposal", err);
      setMessage("❌ Failed to submit application. Try again.");
    }
  };

  const projectRows = chunkArray(projects, 3);

  return (
    <div className="container">
      <h2 className="section-heading">Available Projects</h2>

      {message && <p className="alert-info">{message}</p>}

      {projects.length === 0 ? (
        <p>No projects available right now.</p>
      ) : (
        <>
          <table className="projects-table">
            <tbody>
              {projectRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((project) => (
                    <td key={project._id} className="project-cell">
                      <div className="project-card">
                        <h3>{project.title}</h3>
                        <p>{project.description?.slice(0, 100)}...</p>
                        <p>
                          <strong>Budget:</strong> ₹{project.budget}
                        </p>
                        <p>
                          <strong>Deadline:</strong>{" "}
                          {new Date(project.deadline).toLocaleDateString()}
                        </p>

                        <button
                          className="btn-primary"
                          onClick={() => handleApplyClick(project._id)}
                        >
                          Apply Now
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal with proposal form */}
          {applyingProjectId && (
            <div className="modal-overlay">
              <div className="modal-card">
                <button
                  className="modal-close"
                  aria-label="Close proposal form"
                  onClick={() => setApplyingProjectId(null)}
                >
                  &times;
                </button>
                <h3>Submit Your Proposal</h3>
                <ProposalForm onSubmit={handleSubmitProposal} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseProjects;
