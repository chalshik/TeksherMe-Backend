import React from 'react';
import './QuestionItem.css';

const QuestionItem = ({ question, index, onEdit, onDelete }) => {
  const correctCount = question.options.filter(option => option.isCorrect).length;
  
  return (
    <div className="question-item">
      <div className="question-header">
        <div>
          <span className="question-number">Q{index + 1}:</span>
          <span className="question-text">{question.text}</span>
        </div>
        <div className="question-info">
          {question.options.length} options ({correctCount} correct)
        </div>
      </div>
      
      <div className="question-content">
        <div className="option-list">
          {question.options.map((option, optionIndex) => (
            <div 
              key={optionIndex}
              className={`option-item ${option.isCorrect ? 'option-correct' : 'option-incorrect'}`}
            >
              {option.isCorrect ? 
                <i className="fas fa-check-circle"></i> : 
                <i className="fas fa-circle"></i>
              }
              {option.text}
            </div>
          ))}
        </div>
        
        <div className="question-actions">
          <button className="btn btn-secondary btn-icon" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Edit
          </button>
          <button className="btn btn-danger btn-icon" onClick={onDelete}>
            <i className="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionItem; 