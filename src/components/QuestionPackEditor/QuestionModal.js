import React, { useState, useEffect } from 'react';
import './QuestionModal.css';

const QuestionModal = ({ show, question, isEdit, onClose, onSave }) => {
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false }
    ]
  });

  // Update state when question prop changes
  useEffect(() => {
    if (question) {
      setCurrentQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
    }
  }, [question]);

  if (!show) return null;

  // Update question text
  const handleQuestionTextChange = (e) => {
    setCurrentQuestion(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  // Update option text
  const handleOptionTextChange = (index, text) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      text
    };
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  // Set correct option
  const handleCorrectOptionChange = (index) => {
    const updatedOptions = currentQuestion.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  // Add new option
  const addOption = () => {
    if (currentQuestion.options.length >= 6) {
      alert('Maximum 6 options allowed per question.');
      return;
    }

    setCurrentQuestion(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { text: '', isCorrect: false }
      ]
    }));
  };

  // Remove option
  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      alert('Minimum 2 options required per question.');
      return;
    }

    // Check if removing the correct option
    const isRemovingCorrectOption = currentQuestion.options[index].isCorrect;
    
    const updatedOptions = [...currentQuestion.options];
    updatedOptions.splice(index, 1);
    
    // If removing correct option, set first option as correct
    if (isRemovingCorrectOption && updatedOptions.length > 0) {
      updatedOptions[0].isCorrect = true;
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  // Save question
  const handleSave = () => {
    // Validate question text
    if (!currentQuestion.text.trim()) {
      alert('Please enter a question text.');
      return;
    }

    // Validate options
    for (const option of currentQuestion.options) {
      if (!option.text.trim()) {
        alert('All options must have text.');
        return;
      }
    }

    // Validate at least one correct option
    const hasCorrectOption = currentQuestion.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      alert('Please mark at least one option as correct.');
      return;
    }

    onSave(currentQuestion);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Question' : 'Add Question'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="question-text" className="required-label">Question Text</label>
            <input 
              type="text" 
              id="question-text" 
              value={currentQuestion.text}
              onChange={handleQuestionTextChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="required-label">Options (Min: 2, Max: 6)</label>
            <p className="text-sm text-hint">Select one option as the correct answer</p>
            
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="option-group">
                  <input 
                    type="radio" 
                    name="correct-option" 
                    className="option-radio" 
                    checked={option.isCorrect}
                    onChange={() => handleCorrectOptionChange(index)}
                  />
                  <input 
                    type="text" 
                    className="option-input" 
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(index, e.target.value)}
                    placeholder="Option text" 
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={() => removeOption(index)}
                    disabled={currentQuestion.options.length <= 2}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              className="btn btn-secondary btn-icon add-option-btn"
              onClick={addOption}
              disabled={currentQuestion.options.length >= 6}
            >
              <i className="fas fa-plus"></i>
              Add Option
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-icon" onClick={handleSave}>
            <i className="fas fa-save"></i>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;