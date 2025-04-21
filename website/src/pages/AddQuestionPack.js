import React, { useState } from 'react';
import { categories, difficulties, questionPacks, saveQuestionPack } from '../utils/dummyData';
import './AddQuestionPack.css';

function AddQuestionPack({ navigateTo, packId }) {
  const existingPack = packId ? questionPacks.find(pack => pack.id === parseInt(packId)) : null;
  
  const [packDetails, setPackDetails] = useState({
    title: existingPack?.title || '',
    description: existingPack?.description || '',
    timeGiven: existingPack?.timeGiven || 30,
    difficulty: existingPack?.difficulty || 'Easy',
    category: existingPack?.category || categories[0]?.name || '',
  });
  
  const [questions, setQuestions] = useState(existingPack?.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: [
      { id: 1, text: '', isCorrect: true },
      { id: 2, text: '', isCorrect: false },
    ]
  });
  const [saveMessage, setSaveMessage] = useState({ show: false, type: '', text: '' });

  const handlePackDetailsChange = (e) => {
    const { name, value } = e.target;
    setPackDetails({
      ...packDetails,
      [name]: value
    });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value
    });
  };

  const handleOptionChange = (id, value) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map(option => 
        option.id === id ? { ...option, text: value } : option
      )
    });
  };

  const handleCorrectOptionChange = (id) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map(option => 
        ({ ...option, isCorrect: option.id === id })
      )
    });
  };

  const addOption = () => {
    const newId = Math.max(...currentQuestion.options.map(o => o.id)) + 1;
    setCurrentQuestion({
      ...currentQuestion,
      options: [
        ...currentQuestion.options,
        { id: newId, text: '', isCorrect: false }
      ]
    });
  };

  const removeOption = (id) => {
    // Prevent removing if there are only 2 options
    if (currentQuestion.options.length <= 2) return;
    
    // Check if removing the correct option
    const isRemovingCorrect = currentQuestion.options.find(o => o.id === id)?.isCorrect;
    
    let updatedOptions = currentQuestion.options.filter(option => option.id !== id);
    
    // If removing the correct option, make the first option correct
    if (isRemovingCorrect) {
      updatedOptions = updatedOptions.map((option, index) => 
        index === 0 ? { ...option, isCorrect: true } : option
      );
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const addQuestion = () => {
    // Validate question
    if (!currentQuestion.text.trim() || 
        currentQuestion.options.some(o => !o.text.trim()) ||
        !currentQuestion.options.some(o => o.isCorrect)) {
      showMessage('error', 'Please fill all fields and select a correct answer');
      return;
    }
    
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    const newQuestion = { ...currentQuestion, id: newId };
    
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      text: '',
      options: [
        { id: 1, text: '', isCorrect: true },
        { id: 2, text: '', isCorrect: false },
      ]
    });

    showMessage('success', 'Question added successfully');
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    showMessage('success', 'Question removed successfully');
  };

  const showMessage = (type, text) => {
    setSaveMessage({ show: true, type, text });
    setTimeout(() => {
      setSaveMessage({ show: false, type: '', text: '' });
    }, 3000);
  };

  const handleSavePack = () => {
    // Validate pack details
    if (!packDetails.title.trim() || !packDetails.description.trim() || !packDetails.category) {
      showMessage('error', 'Please fill all pack details');
      return;
    }

    // Validate that we have at least one question
    if (questions.length === 0) {
      showMessage('error', 'Please add at least one question to the pack');
      return;
    }
    
    // Create the pack data object
    const packData = {
      ...packDetails,
      questions,
      // Keep the original ID if editing, undefined if creating new
      id: existingPack?.id
    };
    
    // Save the pack
    saveQuestionPack(packData);
    
    showMessage('success', `Pack ${existingPack ? 'updated' : 'created'} successfully`);
    
    // Navigate back to question packs after a short delay to show the message
    setTimeout(() => {
      navigateTo('question-packs');
    }, 1500);
  };

  return (
    <div className="add-question-pack">
      <h1>{packId ? 'Edit' : 'Add'} Question Pack</h1>
      
      {saveMessage.show && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}
      
      <div className="pack-form">
        <div className="form-section">
          <h2>Pack Details</h2>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={packDetails.title}
              onChange={handlePackDetailsChange}
              placeholder="Enter pack title"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={packDetails.description}
              onChange={handlePackDetailsChange}
              placeholder="Enter pack description"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Time Given (minutes)</label>
              <input
                type="number"
                name="timeGiven"
                value={packDetails.timeGiven}
                onChange={handlePackDetailsChange}
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Difficulty</label>
              <select
                name="difficulty"
                value={packDetails.difficulty}
                onChange={handlePackDetailsChange}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={packDetails.category}
                onChange={handlePackDetailsChange}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Question Creator</h2>
          
          <div className="form-group">
            <label>Question Text</label>
            <input
              type="text"
              value={currentQuestion.text}
              onChange={handleQuestionChange}
              placeholder="Enter question text"
            />
          </div>
          
          <div className="options-list">
            <label>Options</label>
            
            {currentQuestion.options.map(option => (
              <div className="option-row" key={option.id}>
                <input
                  type="radio"
                  name="correctOption"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectOptionChange(option.id)}
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder="Enter option text"
                />
                <button 
                  className="remove-btn"
                  onClick={() => removeOption(option.id)}
                  disabled={currentQuestion.options.length <= 2}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button className="add-option-btn" onClick={addOption}>
              + Add Option
            </button>
          </div>
          
          <button className="add-question-btn" onClick={addQuestion}>
            Add Question
          </button>
        </div>
      </div>
      
      {questions.length > 0 && (
        <div className="questions-list">
          <h2>Added Questions ({questions.length})</h2>
          
          {questions.map((question, index) => (
            <div className="question-item" key={question.id}>
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <button 
                  className="remove-question-btn"
                  onClick={() => removeQuestion(question.id)}
                >
                  Delete
                </button>
              </div>
              <div className="question-text">{question.text}</div>
              <div className="question-options">
                {question.options.map(option => (
                  <div 
                    className={`question-option ${option.isCorrect ? 'correct' : ''}`} 
                    key={option.id}
                  >
                    {option.text}
                    {option.isCorrect && <span className="correct-badge">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button className="save-pack-btn" onClick={handleSavePack}>
        {packId ? 'Update' : 'Save'} Pack
      </button>
    </div>
  );
}

export default AddQuestionPack; 