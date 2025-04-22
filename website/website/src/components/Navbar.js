import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/website/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/website">TeksherMe</Link>
      </div>
      <div className="navbar-links">
        <Link to="/website">Home</Link>
        <Link to="/website/categories">Categories</Link>
        <Link to="/website/question-packs">Question Packs</Link>
        <Link to="/website/add-question-pack">Add Question Pack</Link>
      </div>
      <div className="navbar-user">
        {user && (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 