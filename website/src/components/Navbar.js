import React from 'react';
import './Navbar.css';

function Navbar({ navigateTo }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <a href="#" className="brand-link" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
          Quiz Management
        </a>
      </div>
      <div className="navbar-links">
        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('categories'); }}>
          Category Manager
        </a>
        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('question-packs'); }}>
          Question Pack
        </a>
        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('add-question-pack'); }}>
          Add Question Pack
        </a>
      </div>
    </nav>
  );
}

export default Navbar; 