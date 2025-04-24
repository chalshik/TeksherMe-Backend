import React from 'react';
import './Dashboard.css';

const Dashboard = ({ categories, packs }) => {
  // Calculate total questions
  const totalQuestions = packs.reduce((total, pack) => total + pack.questionCount, 0);

  return (
    <div id="dashboard-section">
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="user-info">
          <span>👤 Admin</span>
        </div>
      </div>
      
      <div className="stats-cards">
        <div className="row">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-label">
                <i className="fas fa-folder"></i>
                Categories
              </div>
              <div className="stat-value">{categories.length}</div>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-label">
                <i className="fas fa-book"></i>
                Question Packs
              </div>
              <div className="stat-value">{packs.length}</div>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-label">
                <i className="fas fa-question-circle"></i>
                Questions
              </div>
              <div className="stat-value">{totalQuestions}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>Recent Categories</h3>
        </div>
        <div className="card-body">
          {categories.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Question Packs</th>
                </tr>
              </thead>
              <tbody>
                {categories.slice(0, 5).map(category => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.questionPackCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-text">No categories to display.</p>
          )}
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>Recent Question Packs</h3>
        </div>
        <div className="card-body">
          {packs.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Pack Name</th>
                  <th>Category</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {packs.slice(0, 5).map(pack => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.categoryName}</td>
                    <td>{pack.questionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-text">No question packs to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 