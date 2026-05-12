import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectModal from '../components/ProjectModal';
import api from '../utils/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const PROJECT_ICONS = ['🚀', '🎨', '⚡', '🔧', '🌟', '📱', '🌍', '🎯', '🧩', '💡'];

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      const res = await api.put(`/projects/${editProject._id}`, form);
      setProjects(projects.map((p) => (p._id === editProject._id ? { ...p, ...res.data } : p)));
      setEditProject(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditProject(project);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="dashboard-header">
          <div>
            <h2>My Projects</h2>
            <p>Manage all your projects in one place</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" /> Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No projects yet</h3>
            <p>Create your first project to start managing tasks.</p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              + Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project, i) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="project-card"
              >
                <div className="project-card-header">
                  <div className="project-card-icon">
                    {PROJECT_ICONS[i % PROJECT_ICONS.length]}
                  </div>
                  <div className="project-card-actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={(e) => openEdit(e, project)}
                    >✏️</button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      onClick={(e) => handleDelete(e, project._id)}
                    >🗑️</button>
                  </div>
                </div>
                <h3>{project.name}</h3>
                <p>{project.description || 'No description provided.'}</p>
                <div className="project-card-footer">
                  <div className="task-count">
                    <strong>{project.taskCount ?? 0}</strong> tasks
                  </div>
                  <span className="project-date">{formatDate(project.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        loading={saving}
      />
      <ProjectModal
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleEdit}
        initialData={editProject}
        loading={saving}
      />
    </div>
  );
}
