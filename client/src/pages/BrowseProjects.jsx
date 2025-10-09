import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/pagesstylef.css";

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/projects/")
      .then((res) => setProjects(res.data.data || res.data))
      .catch((err) => console.error("Failed to fetch projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const projectRows = useMemo(() => chunkArray(projects, 3), [projects]);

  const handleApplyClick = (projectId) => {
    navigate(`/proposal-form?projectId=${projectId}`);
  };

  return (
    <div className="container">
      <h2 className="section-heading">Available Projects</h2>

      {loading ? (
        <p>⏳ Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects available right now.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <table className="projects-table desktop-only">
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

          {/* Mobile Stack */}
          <div className="projects-mobile mobile-only">
            {projects.map((project) => (
              <div key={project._id} className="project-card">
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
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseProjects;
