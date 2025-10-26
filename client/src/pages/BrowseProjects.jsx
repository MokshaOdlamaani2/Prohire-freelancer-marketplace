import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Axios instance configured with baseURL
import "../styles/pagesstylef.css";

// Utility: chunk an array into smaller arrays of given size
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
    const fetchProjects = async () => {
      try {
        // ✅ Correct endpoint (no duplicate /api)
        const res = await api.get("/projects");

        console.log("✅ API response:", res.data);

        const data = res.data.data || [];
        if (Array.isArray(data)) setProjects(data);
        else {
          console.error("❌ Unexpected API format:", res.data);
          setProjects([]);
        }
      } catch (err) {
        console.error("🚨 Failed to fetch projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
          {/* Desktop view */}
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

          {/* Mobile view */}
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
