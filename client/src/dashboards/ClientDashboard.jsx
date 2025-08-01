import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import "../styles/dashboardstyle.css";

const EditModal = ({ project, onClose, onUpdate, showMessage }) => {
  const [editProject, setEditProject] = useState({
    title: "",
    description: "",
    skillsRequired: [],
    budget: 0,
    deadline: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setEditProject({
        title: project.title || "",
        description: project.description || "",
        skillsRequired: project.skillsRequired || [],
        budget: project.budget || 0,
        deadline: project.deadline ? project.deadline.slice(0, 10) : "",
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "skillsRequired") {
      const skillsArray = value.split(",").map((s) => s.trim()).filter((s) => s);
      setEditProject((prev) => ({ ...prev, skillsRequired: skillsArray }));
    } else {
      setEditProject((prev) => ({ ...prev, [name]: name === "budget" ? Number(value) : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editProject.description.length < 20) {
      toast.error("Description must be at least 20 characters long");
      return;
    }

    if (new Date(editProject.deadline) < new Date()) {
      toast.error("Deadline must be in the future");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(`/api/projects/${project._id}`, editProject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project updated successfully");
      showMessage("✅ Project updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-grid">
        <h2>Edit Project</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>Title:
            <input type="text" name="title" value={editProject.title} onChange={handleChange} required minLength={5} />
          </label>

          <label>Description:
            <textarea name="description" value={editProject.description} onChange={handleChange} required minLength={20} />
          </label>

          <label>Skills (comma separated):
            <input type="text" name="skillsRequired" value={editProject.skillsRequired.join(", ")} onChange={handleChange} required />
          </label>

          <label>Budget:
            <input type="number" name="budget" value={editProject.budget} onChange={handleChange} min={0} required />
          </label>

          <label>Deadline:
            <input type="date" name="deadline" value={editProject.deadline} onChange={handleChange} required />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-green" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button type="button" className="btn-slate" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editProject, setEditProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ New success message state

  useEffect(() => {
    fetchProjects();
  }, []);

  const showMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000); // Auto-dismiss after 3 seconds
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/projects/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.data || res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce((value) => setSearch(value), 300), []);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesTitle = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus ? p.status?.toLowerCase() === filterStatus.toLowerCase() : true;
      return matchesTitle && matchesStatus;
    });
  }, [projects, search, filterStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project deleted successfully");
      showMessage("🗑️ Project deleted successfully!");
      fetchProjects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>📊 Your Projects</h1>
        <div className="search-filter">
          <input type="text" placeholder="Search..." onChange={handleSearchChange} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="Planning">Planning</option>
            <option value="Hiring">Hiring</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </header>

      {/* ✅ Success Message Display */}
      {successMessage && (
        <p className="success-message" style={{ color: "green", marginTop: "1rem" }}>
          {successMessage}
        </p>
      )}

      {loading ? (
        <p className="loading">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="empty-state">No projects found</p>
      ) : (
        <section className="grid-projects">
          {filteredProjects.map((project) => (
            <div className="project-card" key={project._id}>
              <h3>{project.title}</h3>
              <p>{project.description.slice(0, 100)}...</p>
              <p>Status: <strong>{project.status}</strong></p>
              <div className="card-actions">
                <button
                  className="btn-green"
                  onClick={() => {
                    setEditProject(project);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="btn-red" onClick={() => handleDelete(project._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {modalOpen && editProject && (
        <EditModal
          project={editProject}
          onClose={() => setModalOpen(false)}
          onUpdate={fetchProjects}
          showMessage={showMessage} // ✅ pass to modal
        />
      )}
    </main>
  );
};

export default ClientDashboard;
