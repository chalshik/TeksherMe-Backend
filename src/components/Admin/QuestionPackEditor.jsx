import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories, useQuestionPacks } from '../../firebase/hooks';
import './QuestionPackEditor.css';

const QuestionPackEditor = () => {
  // Get pack ID from URL if editing existing pack
  const { packId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!packId;

  // State variables
  const [packDetails, setPackDetails] = useState({
    name: '',
    description: '',
    time: 15,
    difficulty: 'easy',
    categoryId: '',
    categoryName: '',
    questions: []
  });
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use our custom hooks instead of direct Firebase calls
  const { categories, loading: categoriesLoading } = useCategories();
  const { 
    getQuestionPackById, 
    addQuestionPack: saveQuestionPack, 
    updateQuestionPackById: updateQuestionPack,
    loading: questionPacksLoading 
  } = useQuestionPacks();

  // Combined loading state
  const isLoading = categoriesLoading || questionPacksLoading;

  const fetchPackData = useCallback(async () => {
    if (!isEditing || !packId) return;
    
    try {
      const packData = await getQuestionPackById(packId);
      if (packData) {
        setPackDetails(packData);
      } else {
        setError('Question pack not found');
        navigate('/admin');
      }
    } catch (err) {
      setError('Error loading data: ' + err.message);
    }
  }, [packId, isEditing, navigate, getQuestionPackById]);

  useEffect(() => {
    fetchPackData();
  }, [packId, isEditing, navigate]);

  // Handle pack details changes
  const handlePackDetailChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setPackDetails({
        ...packDetails,
        categoryId: value,
        categoryName: selectedCategory ? selectedCategory.name : ''
      });
    } else {
      setPackDetails({
        ...packDetails,
        [name]: value
      });
    }
  };

  // Handle new question changes
  const handleNewQuestionChange = (e) => {
    setNewQuestion({
      ...newQuestion,
      text: e.target.value
    });
  };

  // Handle new option changes
  const handleOptionChange = (index, e) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = e.target.value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Handle correct option selection
  const handleCorrectOptionChange = (index) => {
    const updatedOptions = newQuestion.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Add new option to question
  const handleAddOption = () => {
    const updatedOptions = [...newQuestion.options, { text: '', isCorrect: false }];
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Add new option to editing question
  const handleAddEditOption = () => {
    if (editingQuestion) {
      const updatedOptions = [...editingQuestion.options, { text: '', isCorrect: false }];
      setEditingQuestion({
        ...editingQuestion,
        options: updatedOptions
      });
    }
  };

  // Add new question to pack
  const handleAddQuestion = (e) => {
    e.preventDefault();
    
    // Validate question
    if (!newQuestion.text.trim()) {
      setError('Question text is required');
      return;
    }
    
    // Validate options
    const filledOptions = newQuestion.options.filter(option => option.text.trim() !== '');
    if (filledOptions.length < 2) {
      setError('At least two options are required');
      return;
    }
    
    // Check if there's a correct option with text
    const hasCorrectOption = newQuestion.options.some(option => option.isCorrect && option.text.trim() !== '');
    if (!hasCorrectOption) {
      setError('Please mark one option as correct and ensure it has text');
      return;
    }
    
    // Add question to pack
    const updatedQuestions = [...packDetails.questions];
    const cleanedOptions = newQuestion.options
      .filter(option => option.text.trim() !== '')
      .map(option => ({
        text: option.text.trim(),
        isCorrect: option.isCorrect
      }));
      
    updatedQuestions.push({
      id: Date.now().toString(),
      text: newQuestion.text.trim(),
      options: cleanedOptions
    });
    
    setPackDetails({
      ...packDetails,
      questions: updatedQuestions
    });
    
    // Reset form
    setNewQuestion({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
    
    setError('');
    setSuccess('Question added successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  // Edit question
  const handleEditQuestion = (index) => {
    const questionToEdit = packDetails.questions[index];
    
    // Ensure we have 4 options, fill with empty ones if needed
    let optionsToEdit = [...questionToEdit.options];
    while (optionsToEdit.length < 4) {
      optionsToEdit.push({ text: '', isCorrect: false });
    }
    
    setEditingQuestion({
      ...questionToEdit,
      options: optionsToEdit
    });
    setEditingQuestionIndex(index);
    setShowModal(true);
  };

  // Handle changes in the editing question
  const handleEditQuestionChange = (e) => {
    setEditingQuestion({
      ...editingQuestion,
      text: e.target.value
    });
  };

  // Handle changes in options of the editing question
  const handleEditOptionChange = (index, e) => {
    const updatedOptions = [...editingQuestion.options];
    updatedOptions[index].text = e.target.value;
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions
    });
  };

  // Handle correct option selection in the editing question
  const handleEditCorrectOptionChange = (index) => {
    const updatedOptions = editingQuestion.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions
    });
  };

  // Save edited question
  const handleSaveEditedQuestion = () => {
    // Validate question
    if (!editingQuestion.text.trim()) {
      setError('Question text is required');
      return;
    }
    
    // Validate options
    const filledOptions = editingQuestion.options.filter(option => option.text.trim() !== '');
    if (filledOptions.length < 2) {
      setError('At least two options are required');
      return;
    }
    
    // Check if there's a correct option with text
    const hasCorrectOption = editingQuestion.options.some(option => option.isCorrect && option.text.trim() !== '');
    if (!hasCorrectOption) {
      setError('Please mark one option as correct and ensure it has text');
      return;
    }
    
    // Update question in pack
    const updatedQuestions = [...packDetails.questions];
    const cleanedOptions = editingQuestion.options
      .filter(option => option.text.trim() !== '')
      .map(option => ({
        text: option.text.trim(),
        isCorrect: option.isCorrect
      }));
      
    updatedQuestions[editingQuestionIndex] = {
      ...editingQuestion,
      text: editingQuestion.text.trim(),
      options: cleanedOptions
    };
    
    setPackDetails({
      ...packDetails,
      questions: updatedQuestions
    });
    
    setShowModal(false);
    setEditingQuestionIndex(null);
    setEditingQuestion(null);
    setError('');
    setSuccess('Question updated successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  // Delete question
  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = [...packDetails.questions];
      updatedQuestions.splice(index, 1);
      
      setPackDetails({
        ...packDetails,
        questions: updatedQuestions
      });
      
      setSuccess('Question deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestionIndex(null);
    setEditingQuestion(null);
    setError('');
  };

  // Save question pack
  const handleSavePack = async () => {
    // Validate pack details
    if (!packDetails.name.trim()) {
      setError('Pack name is required');
      return;
    }
    
    if (!packDetails.categoryId) {
      setError('Category is required');
      return;
    }
    
    if (packDetails.questions.length < 1) {
      setError('At least one question is required');
      return;
    }
    
    try {
      console.log("Saving pack with questions:", packDetails.questions);
      
      // Ensure questions have valid format for Firebase
      const formattedQuestions = packDetails.questions.map(q => ({
        text: q.text,
        options: q.options.map(o => ({
          text: o.text,
          isCorrect: o.isCorrect
        }))
      }));
      
      const packDataToSave = {
        ...packDetails,
        questions: formattedQuestions
      };
      
      console.log("Formatted packDetails for Firebase:", packDataToSave);
      
      // Create or update question pack
      if (isEditing) {
        await updateQuestionPack(packId, packDataToSave);
        setSuccess('Question pack updated successfully');
      } else {
        await saveQuestionPack(packDataToSave);
        setSuccess('Question pack created successfully');
      }
      
      // Navigate back to admin after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      console.error("Error saving question pack:", err);
      setError('Error saving question pack: ' + err.message);
    }
  };

  // Cancel and go back to admin
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/admin');
    }
  };

  return (
    <div className="question-pack-editor">
      <div className="editor-header">
        <div className="container">
          <h1>{isEditing ? 'Edit Question Pack' : 'Create New Question Pack'}</h1>
          <div className="editor-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSavePack} disabled={isLoading}>
              <i className="fas fa-save"></i> Save Pack
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">Loading...</div>
          </div>
        ) : (
          <>
            {/* Pack Details Section */}
            <div className="card pack-details">
              <div className="card-header">
                <h2>Pack Details</h2>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="required-label">Pack Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={packDetails.name}
                      onChange={handlePackDetailChange}
                      placeholder="Enter pack name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="required-label">Category</label>
                    <select
                      className="form-control"
                      name="categoryId"
                      value={packDetails.categoryId}
                      onChange={handlePackDetailChange}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={packDetails.description}
                      onChange={handlePackDetailChange}
                      placeholder="Enter pack description"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="time"
                      value={packDetails.time}
                      onChange={handlePackDetailChange}
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      className="form-control"
                      name="difficulty"
                      value={packDetails.difficulty}
                      onChange={handlePackDetailChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Question Section */}
            <div className="card add-question">
              <div className="card-header">
                <h2>Add New Question</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddQuestion}>
                  <div className="form-group">
                    <label className="required-label">Question</label>
                    <textarea
                      className="form-control"
                      value={newQuestion.text}
                      onChange={handleNewQuestionChange}
                      placeholder="Enter question text"
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <div className="options-container">
                    <label className="required-label">Options (minimum 2)</label>
                    
                    {newQuestion.options.map((option, index) => (
                      <div className="option-row" key={index}>
                        <div className="option-input">
                          <input
                            type="text"
                            className="form-control"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e)}
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                        <div className="option-correct">
                          <label className="option-label">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={option.isCorrect}
                              onChange={() => handleCorrectOptionChange(index)}
                            />
                            <span className={`correct-toggle ${option.isCorrect ? 'correct-toggle-active' : ''}`}>
                              <i className="fas fa-check"></i> Correct
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm add-option-btn" 
                      onClick={handleAddOption}
                    >
                      <i className="fas fa-plus"></i> Add Option
                    </button>
                  </div>
                  
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus"></i> Add Question
                  </button>
                </form>
              </div>
            </div>

            {/* Questions List Section */}
            <div className="card questions-list">
              <div className="card-header">
                <h2>Questions ({packDetails.questions.length})</h2>
              </div>
              <div className="card-body">
                {packDetails.questions.length === 0 ? (
                  <div className="empty-state">
                    No questions added yet. Use the form above to add questions.
                  </div>
                ) : (
                  <div className="questions-container">
                    {packDetails.questions.map((question, index) => (
                      <div className="question-item" key={question.id || index}>
                        <div className="question-content">
                          <div className="question-number">Q{index + 1}</div>
                          <div className="question-text">{question.text}</div>
                        </div>
                        <div className="question-options">
                          {question.options.map((option, optIndex) => (
                            <div 
                              className={`question-option ${option.isCorrect ? 'correct' : ''}`}
                              key={optIndex}
                            >
                              {option.text}
                              {option.isCorrect && <span className="correct-badge">Correct</span>}
                            </div>
                          ))}
                        </div>
                        <div className="question-actions">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEditQuestion(index)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteQuestion(index)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Question Modal */}
      {showModal && editingQuestion && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Question</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="required-label">Question</label>
                <textarea
                  className="form-control"
                  value={editingQuestion.text}
                  onChange={handleEditQuestionChange}
                  placeholder="Enter question text"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="options-container">
                <label className="required-label">Options (minimum 2)</label>
                
                {editingQuestion.options.map((option, index) => (
                  <div className="option-row" key={index}>
                    <div className="option-input">
                      <input
                        type="text"
                        className="form-control"
                        value={option.text}
                        onChange={(e) => handleEditOptionChange(index, e)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                    <div className="option-correct">
                      <label className="option-label">
                        <input
                          type="radio"
                          name="editCorrectOption"
                          checked={option.isCorrect}
                          onChange={() => handleEditCorrectOptionChange(index)}
                        />
                        <span className={`correct-toggle ${option.isCorrect ? 'correct-toggle-active' : ''}`}>
                          <i className="fas fa-check"></i> Correct
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm add-option-btn" 
                  onClick={handleAddEditOption}
                >
                  <i className="fas fa-plus"></i> Add Option
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEditedQuestion}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPackEditor; 