import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/pagesstyle.css";
const ProjectApplicants = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (freelancerId, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `/api/projects/${projectId}/applicants/${freelancerId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Applicant ${status}!`);
      fetchProjectDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>No project found.</p>;

  return (
    <div className="container">
      <h1 className="heading">Applicants for: {project.title}</h1>
      <p>{project.description}</p>

      <p>
        Status:{" "}
        <span className={`status-badge ${project.status.toLowerCase()}`}>
          {project.status}
        </span>
      </p>

      {project.applications?.length > 0 ? (
        <ul className="applicant-list">
          {project.applications.map((app, index) => (
            <li key={index} className="applicant-item">
              <Link
                to={`/freelancer/${app.freelancerId?._id}`}
                className="applicant-toggle-button"
                style={{ fontWeight: "bold", fontSize: "1.1em" }}
              >
                {app.freelancerId?.name || "Unnamed Freelancer"}
              </Link>
              <p>
                <strong>Email:</strong> {app.freelancerId?.email || "N/A"}
              </p>
              <p>
                <strong>Portfolio:</strong>{" "}
                <a
                  href={app.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="applicant-portfolio-link"
                >
                  {app.portfolioLink}
                </a>
              </p>
              {app.contactInfo && (
                <p>
                  <strong>Contact Info:</strong> {app.contactInfo}
                </p>
              )}
              <p>
                <strong>Status:</strong>{" "}
                <button
                  disabled={app.status === "shortlisted"}
                  onClick={() =>
                    handleStatusUpdate(app.freelancerId._id, "shortlisted")
                  }
                  className={`status-btn ${
                    app.status === "shortlisted" ? "btn-shortlisted" : "btn-default"
                  }`}
                >
                  Shortlist
                </button>

                <button
                  disabled={app.status === "hired"}
                  onClick={() =>
                    handleStatusUpdate(app.freelancerId._id, "hired")
                  }
                  className={`status-btn ${
                    app.status === "hired" ? "btn-hired" : "btn-default"
                  }`}
                >
                  Hire
                </button>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No applicants yet.</p>
      )}

      <Link to="/client-dashboard" className="btn-secondary">
        ← Back to Dashboard
      </Link>
    </div>
  );
};

export default ProjectApplicants;
