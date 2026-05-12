import React, { useState, useEffect } from 'react';

export default function TaskModal({ isOpen, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', assignedTo: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        assignedTo: initialData.assignedTo || '',
      });
    } else {
      setForm({ title: '', description: '', status: 'todo', assignedTo: '' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Task' : 'Add Task'}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Create landing page"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({}); }}
              autoFocus
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input
                className="form-input"
                type="text"
                placeholder="Name (optional)"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
