import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import api from '../utils/api';

const STATUS_COLUMNS = [
  { key: 'todo', label: 'To Do', dotClass: 'dot-todo' },
  { key: 'in-progress', label: 'In Progress', dotClass: 'dot-inprogress' },
  { key: 'done', label: 'Done', dotClass: 'dot-done' },
];

const STATUS_BADGE = {
  'todo': { label: 'To Do', cls: 'badge-todo' },
  'in-progress': { label: 'In Progress', cls: 'badge-in-progress' },
  'done': { label: 'Done', cls: 'badge-done' },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleAddTask = async (form) => {
    setSaving(true);
    try {
      const res = await api.post(`/projects/${id}/tasks`, form);
      setTasks([res.data, ...tasks]);
      setTaskModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTask = async (form) => {
    setSaving(true);
    try {
      const res = await api.put(`/tasks/${editTask._id}`, form);
      setTasks(tasks.map((t) => (t._id === editTask._id ? res.data : t)));
      setEditTask(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered & searched tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [tasks, search, filterStatus]);

  const getColumnTasks = (status) => filteredTasks.filter((t) => t.status === status);

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-spinner"><div className="spinner" /> Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-content">
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3>Project not found</h3>
            <Link to="/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span>›</span>
          <span>{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="project-detail-header">
          <h1 className="project-detail-title">{project.name}</h1>
          {project.description && (
            <p className="project-detail-desc">{project.description}</p>
          )}

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-chip">
              <span>📋</span><strong>{tasks.length}</strong> total tasks
            </div>
            <div className="stat-chip">
              <span>⚡</span><strong>{inProgressTasks}</strong> in progress
            </div>
            <div className="stat-chip">
              <span>✅</span><strong>{doneTasks}</strong> done
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="task-controls">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>
            + Add Task
          </button>
        </div>

        {/* Kanban Board */}
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✏️</div>
            <h3>No tasks yet</h3>
            <p>Add your first task to get started on this project.</p>
            <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>
              + Add Task
            </button>
          </div>
        ) : (
          <div className="task-columns">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = getColumnTasks(col.key);
              return (
                <div key={col.key} className="task-column">
                  <div className="task-column-header">
                    <div className="task-column-title">
                      <div className={`column-dot ${col.dotClass}`} />
                      {col.label}
                    </div>
                    <span className="column-count">{colTasks.length}</span>
                  </div>

                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No tasks here
                    </div>
                  ) : (
                    <div className="task-list">
                      {colTasks.map((task) => {
                        const badge = STATUS_BADGE[task.status];
                        return (
                          <div key={task._id} className="task-card">
                            <div className="task-card-title">{task.title}</div>
                            {task.description && (
                              <div className="task-card-desc">{task.description}</div>
                            )}

                            {/* Quick status change */}
                            <div style={{ marginBottom: '0.5rem' }}>
                              <select
                                className="form-select"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 1.75rem 0.25rem 0.5rem' }}
                                value={task.status}
                                onChange={(e) => handleStatusChange(task, e.target.value)}
                              >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>

                            <div className="task-card-footer">
                              <div className="task-assignee">
                                {task.assignedTo ? (
                                  <><span>👤</span>{task.assignedTo}</>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    {formatDate(task.createdAt)}
                                  </span>
                                )}
                              </div>
                              <div className="task-actions">
                                <button
                                  className="icon-btn"
                                  title="Edit task"
                                  onClick={() => setEditTask(task)}
                                >✏️</button>
                                <button
                                  className="icon-btn danger"
                                  title="Delete task"
                                  onClick={() => handleDeleteTask(task._id)}
                                >🗑️</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Search/filter empty state */}
        {tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="empty-state" style={{ paddingTop: '2rem' }}>
            <div className="empty-icon">🔍</div>
            <h3>No matching tasks</h3>
            <p>Try a different search term or filter.</p>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleAddTask}
        loading={saving}
      />
      <TaskModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleEditTask}
        initialData={editTask}
        loading={saving}
      />
    </div>
  );
}
