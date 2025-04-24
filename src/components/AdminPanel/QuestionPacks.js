import React from 'react';
import { Link } from 'react-router-dom';
import './QuestionPacks.css';

const QuestionPacks = ({ packs, onDeletePack }) => {
  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'badge-easy';
      case 'medium':
        return 'badge-medium';
      case 'hard':
        return 'badge-hard';
      default:
        return '';
    }
  };

  return (
    <div id="packs-section">
      <div className="page-header">
        <h2>Question Packs</h2>
        <Link to="/admin/question-pack-editor" className="btn btn-primary">
          <i className="fas fa-plus"></i> New Question Pack
        </Link>
      </div>
      
      <div className="card">
        <div className="card-body">
          <table id="packs-table">
            <thead>
              <tr>
                <th width="30%">Pack Name</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Questions</th>
                <th width="20%">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packs.length > 0 ? (
                packs.map(pack => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.categoryName}</td>
                    <td>
                      <span className={`badge ${getDifficultyBadgeClass(pack.difficulty)}`}>
                        {pack.difficulty}
                      </span>
                    </td>
                    <td>{pack.questionCount}</td>
                    <td>
                      <Link 
                        to={`/admin/question-pack-editor/${pack.id}`} 
                        className="btn btn-edit btn-sm"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                      <button 
                        className="btn btn-delete btn-sm"
                        onClick={() => onDeletePack(pack.id, pack.name)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-text">No question packs found. Create your first pack!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionPacks; 