import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getAllCategories, 
  getQuestionPack, 
  updateQuestionPack, 
  saveQuestionPack 
} from '../../firebase/firestore';
import QuestionItem from './QuestionItem';
import QuestionModal from './QuestionModal';
import './QuestionPackEditor.css';

const QuestionPackEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // State
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false }
    ]
  });
  
  // Pack data
  const [pack, setPack] = useState({
    name: '',
    description: '',
    time: 10,
    difficulty: 'easy',
    categoryId: '',
    categoryName: '',
    questions: []
  });
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load categories
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // If edit mode, load pack data
        if (isEditMode) {
          const packData = await getQuestionPack(id);
          if (!packData) {
            alert('Question pack not found!');
            navigate('/admin');
            return;
          }
          setPack(packData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, navigate]);
  
  // Update pack fields
  const handlePackChange = (e) => {
    const { name, value } = e.target;
    setPack(prev => ({
      ...prev,
      [name]: name === 'time' ? parseInt(value) || 10 : value
    }));
  };
  
  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
      setPack(prev => ({
        ...prev,
        categoryId,
        categoryName: selectedCategory.name
      }));
    } else {
      setPack(prev => ({
        ...prev,
        categoryId: '',
        categoryName: ''
      }));
    }
  };
  
  // Open modal to add new question
  const openAddQuestionModal = () => {
    setCurrentQuestion({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]
    });
    setEditingQuestionIndex(-1);
    setShowQuestionModal(true);
  };
  
  // Open modal to edit existing question
  const openEditQuestionModal = (index) => {
    const question = pack.questions[index];
    setCurrentQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
    setEditingQuestionIndex(index);
    setShowQuestionModal(true);
  };
  
  // Close question modal
  const closeQuestionModal = () => {
    setShowQuestionModal(false);
  };
  
  // Save question from modal
  const saveQuestion = (question) => {
    if (editingQuestionIndex >= 0) {
      // Update existing question
      const updatedQuestions = [...pack.questions];
      updatedQuestions[editingQuestionIndex] = question;
      setPack(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    } else {
      // Add new question
      setPack(prev => ({
        ...prev,
        questions: [...prev.questions, question]
      }));
    }
    closeQuestionModal();
  };
  
  // Delete question
  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = [...pack.questions];
      updatedQuestions.splice(index, 1);
      setPack(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };
  
  // Save the entire pack
  const savePack = async () => {
    // Validation
    if (!pack.name.trim()) {
      alert('Please enter a pack name.');
      return;
    }
    
    if (!pack.categoryId) {
      alert('Please select a category.');
      return;
    }
    
    if (pack.questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }
    
    try {
      if (isEditMode) {
        await updateQuestionPack(id, pack);
        alert('Question pack updated successfully!');
      } else {
        await saveQuestionPack(pack);
        alert('Question pack created successfully!');
      }
      
      // Navigate back to admin page
      navigate('/admin');
    } catch (error) {
      console.error('Error saving question pack:', error);
      alert('Failed to save question pack. Please try again.');
    }
  };
  
  // Check if save button should be enabled
  const isSaveEnabled = !!(pack.name && pack.categoryId && pack.questions.length > 0);
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="question-pack-editor">
      {/* Header */}
      <div className="header">
        <Link to="/admin" className="back-btn">
          <i className="fas fa-arrow-left"></i>
          Back to Admin
        </Link>
        <h1 id="page-title" className="page-title">
          {isEditMode ? 'Edit Question Pack' : 'Create Question Pack'}
        </h1>
        <button 
          id="save-pack-btn" 
          className="btn btn-primary" 
          disabled={!isSaveEnabled}
          onClick={savePack}
        >
          <i className="fas fa-save"></i>
          Save Pack
        </button>
      </div>
      
      <div className="container">
        {/* Pack Details Section */}
        <div className="card">
          <div className="card-header">
            <h2>Pack Details</h2>
          </div>
          <div className="card-body">
            <div className="flex-row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="pack-name" className="required-label">Pack Name</label>
                  <input 
                    type="text" 
                    id="pack-name"
                    name="name"
                    value={pack.name}
                    onChange={handlePackChange}
                    placeholder="Enter a name for this question pack" 
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="pack-category" className="required-label">Category</label>
                  <select 
                    id="pack-category"
                    value={pack.categoryId}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="pack-difficulty" className="required-label">Difficulty</label>
                  <select 
                    id="pack-difficulty"
                    name="difficulty"
                    value={pack.difficulty}
                    onChange={handlePackChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="pack-time">Time Limit (minutes)</label>
                  <input 
                    type="number" 
                    id="pack-time"
                    name="time"
                    value={pack.time}
                    onChange={handlePackChange}
                    min="1" 
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="pack-description">Description</label>
              <textarea 
                id="pack-description"
                name="description"
                value={pack.description}
                onChange={handlePackChange}
                rows="3" 
                placeholder="Enter a description for this question pack"
              ></textarea>
            </div>
            
            <div id="question-count-info" className="counter-badge">
              <i className="fas fa-list-ul"></i>
              Questions: {pack.questions.length}
            </div>
          </div>
        </div>
        
        {/* Add New Question Button */}
        <div className="card">
          <div className="card-header">
            <h2>Questions</h2>
            <button 
              className="btn btn-primary btn-icon"
              onClick={openAddQuestionModal}
            >
              <i className="fas fa-plus"></i>
              Add Question
            </button>
          </div>
          <div className="card-body">
            {pack.questions.length > 0 ? (
              <div id="questions-container" className="question-list">
                {pack.questions.map((question, index) => (
                  <QuestionItem 
                    key={index}
                    question={question}
                    index={index}
                    onEdit={() => openEditQuestionModal(index)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
              </div>
            ) : (
              <div id="no-questions-message" className="empty-state">
                <i className="fas fa-question-circle"></i>
                <p>No questions added yet</p>
                <p className="text-sm">Add questions using the button above</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Question Modal */}
      <QuestionModal 
        show={showQuestionModal}
        question={currentQuestion}
        isEdit={editingQuestionIndex >= 0}
        onClose={closeQuestionModal}
        onSave={saveQuestion}
      />
    </div>
  );
};

export default QuestionPackEditor; 