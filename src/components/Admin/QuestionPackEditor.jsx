import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories, useQuestionPacks } from '../../firebase/hooks';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/question-pack-editor.css';

const QuestionPackEditor = () => {
  // Get pack ID from URL if editing existing pack
  const { packId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!packId;
  const { theme } = useTheme();

  // Refs for difficulty select
  const difficultySelectRef = useRef(null);

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
  const [activeTab, setActiveTab] = useState('settings');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update difficulty select styling
  useEffect(() => {
    if (difficultySelectRef.current) {
      // Remove all data-value attributes
      difficultySelectRef.current.removeAttribute('data-value');
      // Set the new data-value attribute
      difficultySelectRef.current.setAttribute('data-value', packDetails.difficulty);
      
      // Update styling directly for immediate feedback
      const selectElement = difficultySelectRef.current;
      const difficultyValue = packDetails.difficulty;
      
      // Define colors based on difficulty and theme
      const colors = {
        light: {
          easy: {
            bg: 'rgba(76, 175, 80, 0.08)',
            border: '#4caf50'
          },
          medium: {
            bg: 'rgba(255, 152, 0, 0.08)',
            border: '#ff9800'
          },
          hard: {
            bg: 'rgba(244, 67, 54, 0.08)',
            border: '#f44336'
          }
        },
        dark: {
          easy: {
            bg: 'rgba(76, 175, 80, 0.15)',
            border: '#4caf50'
          },
          medium: {
            bg: 'rgba(255, 152, 0, 0.15)',
            border: '#ff9800'
          },
          hard: {
            bg: 'rgba(244, 67, 54, 0.15)',
            border: '#f44336'
          }
        }
      };
      
      // Apply styles based on theme
      const themeColors = colors[theme === 'dark' ? 'dark' : 'light'];
      if (themeColors[difficultyValue]) {
        selectElement.style.backgroundColor = themeColors[difficultyValue].bg;
        selectElement.style.borderLeft = `3px solid ${themeColors[difficultyValue].border}`;
      }
    }
  }, [packDetails.difficulty, theme]);

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

  // Handle keyboard navigation for option inputs in the add question form
  const handleOptionKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if this is the last option field with content
      const isLastFilledOption = index === newQuestion.options.length - 1 && e.target.value.trim() !== '';
      
      // Find the next input
      const nextInput = document.querySelector(`#option-${index + 1}`);
      
      if (nextInput) {
        // If next input exists, focus it
        nextInput.focus();
      } else if (isLastFilledOption) {
        // If there is no next input and this is the last filled option, add a new one
        handleAddOption();
        // Focus will be set in useEffect after the option is added
      } else {
        // If no next input but not a populated field, submit the form
        const addButton = document.querySelector('button[type="submit"]');
        if (addButton) addButton.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.querySelector(`#option-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.querySelector(`#option-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle keyboard navigation for option inputs in the edit question form
  const handleEditOptionKeyPress = (e, questionIndex, optionIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if this is the last option field with content
      const isLastFilledOption = optionIndex === editingQuestion.options.length - 1 && e.target.value.trim() !== '';
      
      // Find the next input
      const nextInput = document.querySelector(`#edit-option-${questionIndex}-${optionIndex + 1}`);
      
      if (nextInput) {
        // If next input exists, focus it
        nextInput.focus();
      } else if (isLastFilledOption) {
        // If there is no next input and this is the last filled option, add a new one
        handleAddEditOption();
        // Focus will be set in useEffect after the option is added
      } else {
        // If no next input but not a populated field, focus the update button
        const updateButton = document.querySelector('.modal-footer .btn-primary');
        if (updateButton) updateButton.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.querySelector(`#edit-option-${questionIndex}-${optionIndex - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.querySelector(`#edit-option-${questionIndex}-${optionIndex + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Add use effect to focus on new option after adding to new question
  useEffect(() => {
    // Focus on newly added option
    const newOptionIndex = newQuestion.options.length - 1;
    if (newOptionIndex >= 0) {
      const newOptionInput = document.querySelector(`#option-${newOptionIndex}`);
      if (newOptionInput) {
        newOptionInput.focus();
      }
    }
  }, [newQuestion.options.length]);

  // Add use effect to focus on new option after adding to edit question
  useEffect(() => {
    if (editingQuestion) {
      const newOptionIndex = editingQuestion.options.length - 1;
      if (newOptionIndex >= 0) {
        const newOptionInput = document.querySelector(`#edit-option-${editingQuestionIndex}-${newOptionIndex}`);
        if (newOptionInput) {
          newOptionInput.focus();
        }
      }
    }
  }, [editingQuestion?.options.length, editingQuestionIndex]);

  // Drag and drop handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = packDetails.questions.findIndex(q => q.id === active.id);
      const newIndex = packDetails.questions.findIndex(q => q.id === over.id);
      
      setPackDetails({
        ...packDetails,
        questions: arrayMove(packDetails.questions, oldIndex, newIndex)
      });
    }
  };

  // SortableQuestion component for drag and drop
  const SortableQuestion = ({ question, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: question.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    // Find the correct option
    const correctOption = question.options ? question.options.find(opt => opt.isCorrect) : null;
    
    return (
      <div 
        ref={setNodeRef} 
        style={{
          ...style,
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f8f8',
          border: theme === 'dark' ? '1px solid #444444' : '1px solid #dddddd',
          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderLeft: theme === 'dark' ? '4px solid #2196f3' : '4px solid var(--primary)'
        }}
        className="question-item"
      >
        <motion.div 
          className="question-drag-handle" 
          {...attributes} 
          {...listeners}
          whileHover={{ color: theme === 'dark' ? "#2196f3" : "var(--primary)" }}
          style={{
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#666666'
          }}
        >
          <i className="fas fa-grip-vertical"></i>
        </motion.div>
        
        <div className="question-content">
          <div className="question-header">
            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}
            >
              Question {index + 1}
            </motion.h4>
            <div className="question-actions">
              <motion.button 
                type="button" 
                onClick={() => handleEditQuestion(index)}
                title="Edit Question"
                whileHover={{ scale: 1.2, backgroundColor: theme === 'dark' ? "rgba(33, 150, 243, 0.2)" : "rgba(33, 150, 243, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                style={{
                  backgroundColor: theme === 'dark' ? '#3a3a3a' : 'transparent'
                }}
              >
                <i className="fas fa-edit" style={{ color: theme === 'dark' ? '#2196f3' : '#333333' }}></i>
              </motion.button>
              <motion.button 
                type="button" 
                onClick={() => handleDeleteQuestion(index)}
                title="Delete Question"
                whileHover={{ scale: 1.2, backgroundColor: theme === 'dark' ? "rgba(255, 90, 95, 0.2)" : "rgba(255, 90, 95, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                style={{
                  backgroundColor: theme === 'dark' ? '#3a3a3a' : 'transparent'
                }}
              >
                <i className="fas fa-trash-alt" style={{ color: theme === 'dark' ? '#ff5a5f' : '#333333' }}></i>
              </motion.button>
            </div>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ color: theme === 'dark' ? '#EEEEEE' : '#333333' }}
          >
            {question.text}
          </motion.p>
          
          <ul className="options-list">
            {question.options && question.options.map((option, optIndex) => (
              <motion.li 
                key={optIndex} 
                className={`option ${option.isCorrect ? 'correct' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (optIndex * 0.07) }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: theme === 'dark' ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 8px rgba(0,0,0,0.1)",
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                style={{
                  backgroundColor: theme === 'dark' 
                    ? (option.isCorrect ? 'rgba(56, 142, 60, 0.3)' : '#3a3a3a') 
                    : (option.isCorrect ? 'rgba(76, 175, 80, 0.1)' : '#ffffff'),
                  color: theme === 'dark' ? '#ffffff' : '#333333',
                  border: theme === 'dark' 
                    ? (option.isCorrect ? '1px solid #4caf50' : '1px solid #555555') 
                    : '1px solid #dddddd'
                }}
              >
                {option.isCorrect && (
                  <motion.span 
                    className="correct-indicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.3 + (optIndex * 0.07) }}
                    style={{
                      color: theme === 'dark' ? '#76FF03' : '#4caf50'
                    }}
                  >
                    <i className="fas fa-check-circle"></i>
                  </motion.span>
                )}
                {option.text}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    );
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
  // Add this function to your component
  const handleRemoveEditOption = (index) => {
    // Don't allow removing if we only have 2 options (minimum required)
    if (editingQuestion.options.length <= 2) {
      return;
    }
    
    const updatedOptions = [...editingQuestion.options];
    updatedOptions.splice(index, 1);
    
    // If we're removing the correct option, set the first remaining option as correct
    const hasCorrectOption = updatedOptions.some(opt => opt.isCorrect);
    if (!hasCorrectOption && updatedOptions.length > 0) {
      updatedOptions[0].isCorrect = true;
    }
    
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions
    });
  };

  const handleRemoveOption = (index) => {
    // Don't allow removing if we only have 2 options (minimum required)
    if (newQuestion.options.length <= 2) {
      return;
    }
    
    const updatedOptions = [...newQuestion.options];
    updatedOptions.splice(index, 1);
    
    // If we're removing the correct option, set the first remaining option as correct
    const hasCorrectOption = updatedOptions.some(opt => opt.isCorrect);
    if (!hasCorrectOption && updatedOptions.length > 0) {
      updatedOptions[0].isCorrect = true;
    }
    
    setNewQuestion({
      ...newQuestion,
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
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel and go back to admin
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/admin');
    }
  };

  // Replace the handleTabChange function with a smoother version
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="editor-container" style={{ 
      backgroundColor: theme === 'dark' ? '#121212' : 'transparent',
      color: theme === 'dark' ? '#EEEEEE' : 'var(--text-color)'
    }}>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <div className="editor-header" style={{
              backgroundColor: theme === 'dark' ? '#171717' : '',
              borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : ''
            }}>
              <motion.h1 
                className="editor-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ 
                  color: theme === 'dark' ? '#ffffff' : '',
                  WebkitTextFillColor: theme === 'dark' ? '#2196f3' : 'transparent'
                }}
              >
                {isEditing ? 'Edit Question Pack' : 'Create Question Pack'}
              </motion.h1>
              <div className="btn-group">
                <motion.button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333333' : '',
                    color: theme === 'dark' ? '#ffffff' : '',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '',
                    boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : ''
                  }}
                >
                  <i className="fas fa-times mr-2"></i> Cancel
                </motion.button>
                <motion.button 
                  className="btn btn-success save-btn"
                  onClick={handleSavePack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                  style={{
                    background: theme === 'dark' ? 'linear-gradient(90deg, #2196f3, #3f51b5)' : '',
                    color: theme === 'dark' ? '#ffffff' : '',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '',
                    boxShadow: theme === 'dark' ? '0 4px 12px rgba(33, 150, 243, 0.4)' : '',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i> Save Question Pack
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs" style={{
          backgroundColor: theme === 'dark' ? '#171717' : '',
          borderRadius: '8px 8px 0 0',
          padding: theme === 'dark' ? '4px 4px 0 4px' : ''
        }}>
          <motion.button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: theme === 'dark' 
                ? (activeTab === 'settings' ? '#2d2d2d' : '#1e1e1e') 
                : (activeTab === 'settings' ? '#eef2f7' : '#f5f5f5'),
              color: theme === 'dark' ? '#ffffff' : '#333333',
              borderRadius: '6px 6px 0 0',
              fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
              boxShadow: theme === 'dark' && activeTab === 'settings' ? '0 -2px 10px rgba(0, 0, 0, 0.2)' : 'none'
            }}
          >
            <i className="fas fa-cog" style={{ color: activeTab === 'settings' ? (theme === 'dark' ? '#2196f3' : '#3b82f6') : 'inherit' }}></i> Settings
            {activeTab === 'settings' && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                style={{ backgroundColor: theme === 'dark' ? '#2196f3' : '#3b82f6' }}
              />
            )}
          </motion.button>

          <motion.button
            className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => handleTabChange('questions')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: theme === 'dark' 
                ? (activeTab === 'questions' ? '#2d2d2d' : '#1e1e1e') 
                : (activeTab === 'questions' ? '#eef2f7' : '#f5f5f5'),
              color: theme === 'dark' ? '#ffffff' : '#333333',
              borderRadius: '6px 6px 0 0',
              fontWeight: activeTab === 'questions' ? 'bold' : 'normal',
              boxShadow: theme === 'dark' && activeTab === 'questions' ? '0 -2px 10px rgba(0, 0, 0, 0.2)' : 'none'
            }}
          >
            <i className="fas fa-question-circle" style={{ color: activeTab === 'questions' ? (theme === 'dark' ? '#2196f3' : '#3b82f6') : 'inherit' }}></i> Questions
            {activeTab === 'questions' && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                style={{ backgroundColor: theme === 'dark' ? '#2196f3' : '#3b82f6' }}
              />
            )}
          </motion.button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div 
            className="alert alert-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(76, 175, 80, 0.2)' : '',
              color: theme === 'dark' ? '#EEEEEE' : '',
              border: theme === 'dark' ? '1px solid rgba(76, 175, 80, 0.5)' : ''
            }}
          >
            {success}
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            className="alert alert-danger"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(244, 67, 54, 0.2)' : '',
              color: theme === 'dark' ? '#EEEEEE' : '',
              border: theme === 'dark' ? '1px solid rgba(244, 67, 54, 0.5)' : ''
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Tab Content with Smooth Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
              style={{
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '',
                borderRadius: '0 0 8px 8px',
                boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : ''
              }}
            >
              {/* Settings Section Layout Improvement */}
              <div className="editor-card" style={{ 
                backgroundColor: theme === 'dark' ? '#212121' : '#ffffff', 
                border: theme === 'dark' ? '1px solid #444444' : '1px solid #cccccc',
                boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '',
                borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
              }}>
                <div className="p-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="pack-title" className="required-label" style={{ 
                          color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                          fontWeight: 'bold' 
                        }}>Pack Title</label>
                        <motion.input
                          type="text"
                          id="pack-title"
                          className="form-control"
                          value={packDetails.name}
                          onChange={(e) => setPackDetails({...packDetails, name: e.target.value})}
                          required
                          placeholder="Enter a descriptive title"
                          whileFocus={{ boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.25)" }}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                            color: theme === 'dark' ? '#EEEEEE' : '#333333',
                            borderColor: theme === 'dark' ? '#555555' : '#999999'
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="pack-description" style={{ 
                          color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                          fontWeight: 'bold' 
                        }}>Description</label>
                        <motion.textarea
                          id="pack-description"
                          className="form-control"
                          value={packDetails.description}
                          onChange={(e) => setPackDetails({...packDetails, description: e.target.value})}
                          rows="4"
                          placeholder="Describe what this question pack is about"
                          whileFocus={{ boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.25)" }}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                            color: theme === 'dark' ? '#EEEEEE' : '#333333',
                            borderColor: theme === 'dark' ? '#555555' : '#999999'
                          }}
                        ></motion.textarea>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="categoryId" className="required-label" style={{ 
                          color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                          fontWeight: 'bold' 
                        }}>Category</label>
                        <select
                          id="categoryId"
                          name="categoryId"
                          className="form-control"
                          value={packDetails.categoryId}
                          onChange={handlePackDetailChange}
                          required
                          style={{
                            backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                            color: theme === 'dark' ? '#EEEEEE' : '#333333',
                            borderColor: theme === 'dark' ? '#555555' : '#999999'
                          }}
                        >
                          <option value="" disabled>Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="difficulty" style={{ 
                              color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                              fontWeight: 'bold' 
                            }}>Difficulty Level</label>
                            <select
                              id="difficulty"
                              name="difficulty"
                              className="form-control"
                              value={packDetails.difficulty}
                              onChange={handlePackDetailChange}
                              ref={difficultySelectRef}
                              data-value={packDetails.difficulty}
                              style={{
                                backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                                color: theme === 'dark' ? '#EEEEEE' : '#333333',
                                borderColor: theme === 'dark' ? '#555555' : '#999999'
                              }}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="time" style={{ 
                              color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                              fontWeight: 'bold' 
                            }}>Time Limit (minutes)</label>
                            <input
                              type="number"
                              id="time"
                              name="time"
                              className="form-control"
                              value={packDetails.time}
                              onChange={handlePackDetailChange}
                              min="1"
                              max="180"
                              style={{
                                backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                                color: theme === 'dark' ? '#EEEEEE' : '#333333',
                                borderColor: theme === 'dark' ? '#555555' : '#999999'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group mt-4">
                        <div className="card bg-light" style={{
                          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f4f4f4',
                          color: theme === 'dark' ? '#EEEEEE' : '#333333',
                          borderColor: theme === 'dark' ? '#444444' : '#c0c0c0',
                          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : ''
                        }}>
                          <div className="card-body">
                            <h5 className="card-title" style={{
                              color: theme === 'dark' ? '#2196f3' : ''
                            }}>
                              <i className="fas fa-info-circle mr-2"></i>
                              Pack Summary
                            </h5>
                            <div className="d-flex justify-content-between mb-2">
                              <span style={{ color: theme === 'dark' ? '#BBDEFB' : '' }}>Number of Questions:</span>
                              <strong style={{ color: theme === 'dark' ? '#EEEEEE' : '' }}>{packDetails.questions.length}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span style={{ color: theme === 'dark' ? '#BBDEFB' : '' }}>Category:</span>
                              <strong style={{ color: theme === 'dark' ? '#EEEEEE' : '' }}>{packDetails.categoryName || 'Not set'}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span style={{ color: theme === 'dark' ? '#BBDEFB' : '' }}>Estimated Completion:</span>
                              <strong style={{ color: theme === 'dark' ? '#EEEEEE' : '' }}>{packDetails.time} minutes</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'questions' && (
            <motion.div
              key="questions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
              style={{
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '',
                borderRadius: '0 0 8px 8px',
                boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : ''
              }}
            >
              {/* Questions Section Layout Improvement */}
              <div className="row">
                {/* Add New Question Form Panel - Moved to top */}
                <div className="col-md-12 mb-4">
                  <div className="editor-card" style={{ 
                    backgroundColor: theme === 'dark' ? '#212121' : '#ffffff', 
                    border: theme === 'dark' ? '1px solid #444444' : '1px solid #cccccc',
                    boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '',
                    borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
                  }}>
                    <form onSubmit={handleAddQuestion} className="p-3">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="form-group">
                            <label htmlFor="question-text" className="required-label" style={{ 
                              color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                              fontWeight: 'bold' 
                            }}>Question</label>
                            <motion.textarea
                              id="question-text"
                              className="form-control"
                              value={newQuestion.text}
                              onChange={handleNewQuestionChange}
                              required
                              placeholder="Enter your question here"
                              rows="3"
                              whileFocus={{ boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.25)" }}
                              style={{
                                backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                                color: theme === 'dark' ? '#EEEEEE' : '#333333',
                                borderColor: theme === 'dark' ? '#555555' : '#999999'
                              }}
                            ></motion.textarea>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <motion.h4
                            className="mb-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ 
                              color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                              fontWeight: 'bold' 
                            }}
                          >
                            Options <small className="text-muted" style={{ color: theme === 'dark' ? '#CCCCCC' : '#666666' }}>
                              (at least 2 required)
                            </small>
                          </motion.h4>
                          
                          <AnimatePresence>
                            {newQuestion.options.map((option, index) => (
                              <motion.div 
                                key={index} 
                                className={`option-form-item ${option.isCorrect ? 'option-correct' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                layout
                                style={{ 
                                  backgroundColor: theme === 'dark' 
                                    ? (option.isCorrect ? 'rgba(76, 175, 80, 0.15)' : '#333333') 
                                    : (option.isCorrect ? 'rgba(76, 175, 80, 0.08)' : '#f8f8f8'),
                                  border: theme === 'dark' 
                                    ? (option.isCorrect ? '1px solid #4caf50' : '1px solid #444444') 
                                    : '1px solid #e0e0e0',
                                  boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.2)' : ''
                                }}
                              >
                                <motion.div 
                                  className="option-number"
                                  whileHover={{ scale: 1.1 }}
                                  style={{ 
                                    backgroundColor: theme === 'dark' 
                                      ? (option.isCorrect ? '#388e3c' : '#444444') 
                                      : (option.isCorrect ? '#4caf50' : '#e0e0e0'),
                                    color: theme === 'dark' ? '#ffffff' : '#333333'
                                  }}
                                >
                                  {index + 1}
                                </motion.div>
                                
                                <div className="option-form-control">
                                  <motion.input
                                    type="text"
                                    id={`option-${index}`}
                                    className="form-control"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, e)}
                                    onKeyPress={(e) => handleOptionKeyPress(e, index)}
                                    placeholder={`Option ${index + 1}`}
                                    required={index < 2}
                                    whileFocus={{ boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.25)" }}
                                    style={{
                                      backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                                      color: theme === 'dark' ? '#EEEEEE' : '#333333',
                                      borderColor: theme === 'dark' ? '#555555' : '#999999'
                                    }}
                                  />
                                </div>
                                
                                <div className="option-correct-wrapper">
                                  {option.isCorrect ? (
                                    <motion.button 
                                      type="button"
                                      className="option-correct-btn active"
                                      onClick={() => {}}
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      style={{
                                        backgroundColor: theme === 'dark' ? '#388e3c' : '#4caf50',
                                        color: theme === 'dark' ? '#ffffff' : '#ffffff',
                                        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#43a047',
                                        boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : ''
                                      }}
                                    >
                                      <i className="fas fa-check-circle"></i> Correct
                                    </motion.button>
                                  ) : (
                                    <motion.button 
                                      type="button"
                                      className="option-correct-btn"
                                      onClick={() => handleCorrectOptionChange(index)}
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      style={{
                                        backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                                        color: theme === 'dark' ? '#BBBBBB' : '#666666',
                                        borderColor: theme === 'dark' ? '#444444' : '#dddddd',
                                        boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.2)' : ''
                                      }}
                                    >
                                      <i className="far fa-circle"></i> Mark Correct
                                    </motion.button>
                                  )}
                                </div>
                                
                                <motion.button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveOption(index)}
                                  disabled={newQuestion.options.length <= 2}
                                  title={newQuestion.options.length <= 2 ? "At least 2 options are required" : "Remove option"}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  style={{
                                    backgroundColor: theme === 'dark' ? '#d32f2f' : '#f44336',
                                    color: theme === 'dark' ? '#ffffff' : '#ffffff',
                                    opacity: newQuestion.options.length <= 2 ? '0.5' : '1',
                                    boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : ''
                                  }}
                                >
                                  <i className="fas fa-times"></i>
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          <div className="form-group">
                            <motion.button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={handleAddOption}
                              whileHover={{ scale: 1.03, boxShadow: "0 2px 6px rgba(33, 150, 243, 0.2)" }}
                              whileTap={{ scale: 0.97 }}
                              style={{
                                borderColor: theme === 'dark' ? '#2196f3' : '#2196f3',
                                color: theme === 'dark' ? '#2196f3' : '#2196f3',
                                backgroundColor: theme === 'dark' ? 'rgba(33, 150, 243, 0.05)' : ''
                              }}
                            >
                              <i className="fas fa-plus"></i> Add Option
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group mt-4">
                        <motion.button 
                          type="submit" 
                          className="btn btn-success w-100"
                          whileHover={{ 
                            y: -3, 
                            boxShadow: theme === 'dark' 
                              ? "0 6px 12px rgba(33, 150, 243, 0.4)" 
                              : "0 4px 8px rgba(0, 200, 83, 0.3)",
                            transition: { type: "spring", stiffness: 400 }
                          }}
                          whileTap={{ 
                            y: 0, 
                            boxShadow: theme === 'dark' 
                              ? "0 2px 6px rgba(33, 150, 243, 0.3)" 
                              : "0 2px 4px rgba(0, 200, 83, 0.2)" 
                          }}
                          style={{
                            background: theme === 'dark' 
                              ? 'linear-gradient(90deg, #2196f3, #3f51b5)' 
                              : '#28a745',
                            color: theme === 'dark' ? '#ffffff' : '#ffffff',
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#218838',
                            boxShadow: theme === 'dark' ? '0 4px 10px rgba(33, 150, 243, 0.3)' : ''
                          }}
                        >
                          <i className="fas fa-plus-circle mr-2"></i> Add Question
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Questions List Panel - Now below add form */}
                <div className="col-md-12">
                  <div className="editor-card mb-4" style={{ 
                    backgroundColor: theme === 'dark' ? '#212121' : '#ffffff', 
                    border: theme === 'dark' ? '1px solid #444444' : '1px solid #cccccc',
                    boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '',
                    borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
                  }}>
                    <div className="questions-list">
                      {packDetails.questions.length === 0 ? (
                        <div className="empty-state text-center p-4" style={{
                          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f8f8',
                          color: theme === 'dark' ? '#BBDEFB' : '#333333',
                          border: theme === 'dark' ? '1px solid #444444' : '1px solid #dddddd',
                          borderRadius: '8px',
                          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : ''
                        }}>
                          <i className="fas fa-question-circle fa-3x mb-3" style={{ color: theme === 'dark' ? '#2196f3' : '#4caf50' }}></i>
                          <p style={{ color: theme === 'dark' ? '#EEEEEE' : '#333333' }}>No questions added yet. Use the form above to add your first question.</p>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext 
                            items={packDetails.questions.map(q => q.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <AnimatePresence>
                              {packDetails.questions.map((question, index) => (
                                <SortableQuestion
                                  key={question.id}
                                  question={question}
                                  index={index}
                                />
                              ))}
                            </AnimatePresence>
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Question Modal - Ensure it's properly shown */}
        {showModal && (
          <div className="modal-backdrop" style={{
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
          }}>
            <motion.div 
              className="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                backgroundColor: theme === 'dark' ? '#212121' : '#ffffff',
                color: theme === 'dark' ? '#EEEEEE' : '#333333',
                boxShadow: theme === 'dark' ? '0 10px 30px rgba(0, 0, 0, 0.7)' : '0 10px 25px rgba(0, 0, 0, 0.2)',
                border: theme === 'dark' ? '1px solid #444444' : '1px solid #cccccc',
                borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
              }}
            >
              <div className="modal-header" style={{
                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #dddddd',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : ''
              }}>
                <motion.h3 
                  className="modal-title" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ color: theme === 'dark' ? '#BBDEFB' : '#333333', fontWeight: 'bold' }}
                >
                  <i className="fas fa-edit mr-2" style={{ color: theme === 'dark' ? '#2196f3' : '' }}></i> Edit Question
                </motion.h3>
                <button 
                  className="close-button" 
                  onClick={handleCloseModal}
                  style={{ 
                    color: theme === 'dark' ? '#BBBBBB' : '#666666',
                    backgroundColor: theme === 'dark' ? '#333333' : 'transparent',
                    borderRadius: '50%'
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body" style={{
                backgroundColor: theme === 'dark' ? '#212121' : ''
              }}>
                {editingQuestion && (
                  <div>
                    <div className="form-group">
                      <label htmlFor="edit-question-text" className="required-label" style={{ 
                        color: theme === 'dark' ? '#BBDEFB' : '#333333',
                        fontWeight: 'bold'
                      }}>Question</label>
                      <motion.textarea
                        id="edit-question-text"
                        className="form-control"
                        value={editingQuestion.text}
                        onChange={handleEditQuestionChange}
                        required
                        placeholder="Enter your question here"
                        rows="3"
                        whileFocus={{ boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.25)" }}
                        style={{
                          backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                          color: theme === 'dark' ? '#EEEEEE' : '#333333',
                          borderColor: theme === 'dark' ? '#555555' : '#999999'
                        }}
                      ></motion.textarea>
                    </div>
                    
                    <motion.h4
                      className="mb-3 mt-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      style={{ 
                        color: theme === 'dark' ? '#BBDEFB' : '#333333', 
                        fontWeight: 'bold' 
                      }}
                    >
                      Options <small className="text-muted" style={{ color: theme === 'dark' ? '#CCCCCC' : '#666666' }}>
                        (at least 2 required)
                      </small>
                    </motion.h4>
                    
                    <AnimatePresence>
                      {editingQuestion.options.map((option, index) => (
                        <motion.div 
                          key={index} 
                          className={`option-form-item ${option.isCorrect ? 'option-correct' : ''}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20, height: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          layout
                          style={{ 
                            backgroundColor: theme === 'dark' 
                              ? (option.isCorrect ? 'rgba(76, 175, 80, 0.15)' : '#333333') 
                              : (option.isCorrect ? 'rgba(76, 175, 80, 0.08)' : '#f8f8f8'),
                            border: theme === 'dark' 
                              ? (option.isCorrect ? '1px solid #4caf50' : '1px solid #444444') 
                              : '1px solid #e0e0e0',
                            boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.2)' : ''
                          }}
                        >
                          <motion.div 
                            className="option-number"
                            whileHover={{ scale: 1.1 }}
                            style={{ 
                              backgroundColor: theme === 'dark' 
                                ? (option.isCorrect ? '#388e3c' : '#444444') 
                                : (option.isCorrect ? '#4caf50' : '#e0e0e0'),
                              color: theme === 'dark' ? '#ffffff' : '#333333'
                            }}
                          >
                            {index + 1}
                          </motion.div>
                          
                          <div className="option-form-control">
                            <motion.input
                              type="text"
                              id={`edit-option-${editingQuestionIndex}-${index}`}
                              className="form-control"
                              value={option.text}
                              onChange={(e) => handleEditOptionChange(index, e)}
                              onKeyPress={(e) => handleEditOptionKeyPress(e, editingQuestionIndex, index)}
                              placeholder={`Option ${index + 1}`}
                              required={index < 2}
                              whileFocus={{ boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.25)" }}
                              style={{
                                backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                                color: theme === 'dark' ? '#EEEEEE' : '#333333',
                                borderColor: theme === 'dark' ? '#555555' : '#999999'
                              }}
                            />
                          </div>
                          
                          <div className="option-correct-wrapper">
                            {option.isCorrect ? (
                              <motion.button 
                                type="button"
                                className="option-correct-btn active"
                                onClick={() => {}}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                  backgroundColor: theme === 'dark' ? '#388e3c' : '#4caf50',
                                  color: theme === 'dark' ? '#ffffff' : '#ffffff',
                                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#43a047',
                                  boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : ''
                                }}
                              >
                                <i className="fas fa-check-circle"></i> Correct
                              </motion.button>
                            ) : (
                              <motion.button 
                                type="button"
                                className="option-correct-btn"
                                onClick={() => handleEditCorrectOptionChange(index)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                                  color: theme === 'dark' ? '#BBBBBB' : '#666666',
                                  borderColor: theme === 'dark' ? '#444444' : '#dddddd',
                                  boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.2)' : ''
                                }}
                              >
                                <i className="far fa-circle"></i> Mark Correct
                              </motion.button>
                            )}
                          </div>
                          
                          <motion.button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveEditOption(index)}
                            disabled={editingQuestion.options.length <= 2}
                            title={editingQuestion.options.length <= 2 ? "At least 2 options are required" : "Remove option"}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              backgroundColor: theme === 'dark' ? '#d32f2f' : '#f44336',
                              color: theme === 'dark' ? '#ffffff' : '#ffffff',
                              opacity: editingQuestion.options.length <= 2 ? '0.5' : '1',
                              boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : ''
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    <div className="form-group mt-3">
                      <motion.button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleAddEditOption}
                        whileHover={{ scale: 1.03, boxShadow: "0 2px 6px rgba(33, 150, 243, 0.2)" }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          borderColor: theme === 'dark' ? '#2196f3' : '#2196f3',
                          color: theme === 'dark' ? '#2196f3' : '#2196f3',
                          backgroundColor: theme === 'dark' ? 'rgba(33, 150, 243, 0.05)' : ''
                        }}
                      >
                        <i className="fas fa-plus"></i> Add Option
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{
                borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #dddddd',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : ''
              }}>
                <motion.button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333333' : '#6c757d',
                    color: theme === 'dark' ? '#ffffff' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#5a6268',
                    boxShadow: theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : ''
                  }}
                >
                  <i className="fas fa-times mr-2"></i> Cancel
                </motion.button>
                <motion.button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveEditedQuestion}
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: theme === 'dark' 
                      ? "0 4px 12px rgba(33, 150, 243, 0.4)"
                      : "0 4px 8px rgba(33, 150, 243, 0.3)"
                  }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: theme === 'dark' 
                      ? 'linear-gradient(90deg, #2196f3, #3f51b5)'
                      : '#007bff',
                    color: theme === 'dark' ? '#ffffff' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#0069d9',
                    boxShadow: theme === 'dark' ? '0 2px 8px rgba(33, 150, 243, 0.3)' : ''
                  }}
                >
                  <i className="fas fa-save mr-2"></i> Save Changes
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionPackEditor; 