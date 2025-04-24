import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, onNavigation }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Quiz Admin</h1>
      </div>
      
      <div 
        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} 
        onClick={() => onNavigation('dashboard')}
      >
        <i className="fas fa-home"></i>
        <span>Dashboard</span>
      </div>
      
      <div 
        className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`} 
        onClick={() => onNavigation('categories')}
      >
        <i className="fas fa-folder"></i>
        <span>Categories</span>
      </div>
      
      <div 
        className={`nav-item ${activeSection === 'packs' ? 'active' : ''}`} 
        onClick={() => onNavigation('packs')}
      >
        <i className="fas fa-book"></i>
        <span>Question Packs</span>
      </div>
    </div>
  );
};

export default Sidebar; 