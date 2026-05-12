import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        Task<span>Flow</span>
      </Link>
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-badge">👤 {user.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
