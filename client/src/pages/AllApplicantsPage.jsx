import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/pagesstyle.css";

const AllApplicantsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/projects/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const projectsWithToggle = (res.data.data || res.data).map((project) => ({
          ...project,
          applications:
            project.applications?.map((app) => ({
              ...app,
              _showProposal: false,
            })) || [],
        }));

        setProjects(projectsWithToggle);
      } catch (err) {
        setError("Failed to fetch projects.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleProposal = (projectId, appIndex) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project._id !== projectId) return project;
        const updatedApplications = project.applications.map((app, index) =>
          index === appIndex ? { ...app, _showProposal: !app._showProposal } : app
        );
        return { ...project, applications: updatedApplications };
      })
    );
  };

  return (
    <div className="container">
    <div className="project-grid-container">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && projects.length === 0 && <p>No projects found.</p>}

      {projects.map((project) => (
        <div key={project._id} className="project-cardf">
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <p>💰 Budget: ₹{project.budget}</p>
          <p>
            Status: <span className={`status-badge ${project.status}`}>{project.status}</span>
          </p>

          <Link to={`/projects/${project._id}/applicants`} className="btn-view">
            👀 View Applicants
          </Link>

          {project.applications?.length > 0 ? (
            <ul className="applicant-list">
              {project.applications.map((app, index) => (
                <li key={index} className="applicant-item">
                  <strong>
                    <button
                      type="button"
                      onClick={() => toggleProposal(project._id, index)}
                      className="applicant-toggle-button"
                      aria-expanded={app._showProposal}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#10b981",
                        cursor: "pointer",
                        fontWeight: "bold",
                        padding: 0,
                        fontSize: "inherit",
                      }}
                    >
                      {app.freelancerId?.name || "Unnamed Freelancer"}
                    </button>
                  </strong>

                  {app._showProposal && (
                    <div className="proposal-details" style={{ marginTop: "6px", paddingLeft: "1em" }}>
                      <p>
                        <em>Proposal:</em> {app.proposalText}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No applicants yet.</p>
          )}
        </div>
      ))}
    </div></div>
  );
};

export default AllApplicantsPage;
