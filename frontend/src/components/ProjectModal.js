import React, { useState, useEffect } from 'react';

export default function ProjectModal({ isOpen, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name || '', description: initialData.description || '' });
    } else {
      setForm({ name: '', description: '' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
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
          <h3>{initialData ? 'Edit Project' : 'New Project'}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({}); }}
              autoFocus
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
