import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import hooks for navigation and params
import { 
  getCategories, 
  addQuestionPack, 
  getQuestionPack, 
  updateQuestionPack,
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getOptions,
  addOption,
  updateOption,
  deleteOption
} from '../services/api'; // Use API service
// Removed dummy data imports for categories and saveQuestionPack
import './AddQuestionPack.css';

// Keep difficulties hardcoded for now
const difficulties = ['Easy', 'Medium', 'Hard'];

function AddQuestionPack() { // Removed props, use hooks instead
  const navigate = useNavigate();
  const { packId } = useParams(); // Get packId from URL if present
  const isEditing = Boolean(packId);

  const [apiCategories, setApiCategories] = useState([]);
  const [packDetails, setPackDetails] = useState({
    title: '',
    description: '',
    time_given: 30, // Using time_given to match API field
    difficulty: 'Easy',
    category: '', // Store category ID here
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: [
      { id: Date.now(), text: '', isCorrect: true },
      { id: Date.now() + 1, text: '', isCorrect: false },
    ]
  });
  const [message, setMessage] = useState({ show: false, type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories and existing pack data (if editing)
  useEffect(() => {
    const fetchData = async () => {
      setFormLoading(true);
      setError(null);
      try {
        // Fetch Categories
        const categoriesResponse = await getCategories();
        setApiCategories(categoriesResponse.data || []);

        // Fetch Existing Pack if editing
        if (isEditing) {
          const packResponse = await getQuestionPack(packId);
          const existingPackData = packResponse.data;
          
          setPackDetails({
            title: existingPackData.title || '',
            description: existingPackData.description || '',
            time_given: existingPackData.time_limit_minutes || 30,
            difficulty: existingPackData.difficulty || 'Easy',
            category: existingPackData.category || '',
          });
          
          // Fetch questions for this pack
          const questionsResponse = await getQuestions(packId);
          const existingQuestions = questionsResponse.data || [];
          
          // For each question, fetch its options
          const questionsWithOptions = await Promise.all(
            existingQuestions.map(async (question) => {
              const optionsResponse = await getOptions(question.id);
              const questionOptions = optionsResponse.data || [];
              
              return {
                id: question.id,
                text: question.content,
                explanation: question.explanation || '',
                options: questionOptions.map(option => ({
                  id: option.id,
                  text: option.content,
                  isCorrect: option.is_correct
                }))
              };
            })
          );
          
          setQuestions(questionsWithOptions);
        } else {
          // Set default category if creating new and categories loaded
          if (categoriesResponse.data && categoriesResponse.data.length > 0) {
            setPackDetails(prev => ({ ...prev, category: categoriesResponse.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError('Failed to load initial data. Please try refreshing.');
        showMessage('error', 'Failed to load data.');
      } finally {
        setFormLoading(false);
      }
    };
    fetchData();
  }, [packId, isEditing]); // Re-run if packId changes

  const handlePackDetailsChange = (e) => {
    const { name, value } = e.target;
    setPackDetails({
      ...packDetails,
      // Convert time_given back to number if changed
      [name]: name === 'time_given' ? parseInt(value, 10) : value
    });
  };

  // --- Question handling functions ---
  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, text: e.target.value });
  };
  
  const handleOptionChange = (id, value) => {
    setCurrentQuestion({ ...currentQuestion, options: currentQuestion.options.map(o => o.id === id ? { ...o, text: value } : o) });
  };
  
  const handleCorrectOptionChange = (id) => {
    setCurrentQuestion({ ...currentQuestion, options: currentQuestion.options.map(o => ({ ...o, isCorrect: o.id === id })) });
  };
  
  const addOptionToQuestion = () => {
    if (currentQuestion.options.length >= 4) return; // Limit options for simplicity
    const newId = Date.now(); // Use timestamp for temp ID
    setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, { id: newId, text: '', isCorrect: false }] });
  };
  
  const removeOption = (id) => {
    if (currentQuestion.options.length <= 2) return;
    const isRemovingCorrect = currentQuestion.options.find(o => o.id === id)?.isCorrect;
    let updatedOptions = currentQuestion.options.filter(o => o.id !== id);
    if (isRemovingCorrect && updatedOptions.length > 0) {
      updatedOptions = updatedOptions.map((o, i) => i === 0 ? { ...o, isCorrect: true } : o);
    }
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };
  
  const addQuestionToList = () => {
    if (!currentQuestion.text.trim() || currentQuestion.options.some(o => !o.text.trim()) || !currentQuestion.options.some(o => o.isCorrect)) {
      showMessage('error', 'Please fill question and all option texts, and select a correct answer.');
      return;
    }
    
    const newQuestionId = Date.now(); // Temporary ID for frontend only
    setQuestions([...questions, { ...currentQuestion, id: newQuestionId }]);
    setCurrentQuestion({ 
      text: '', 
      options: [
        { id: Date.now() + 10, text: '', isCorrect: true }, 
        { id: Date.now() + 11, text: '', isCorrect: false }
      ] 
    });
  };
  
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  // --- End Question handling functions ---

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => {
      setMessage({ show: false, type: '', text: '' });
    }, 3000);
  };

  const handleSavePack = async () => {
    // Validate pack details
    if (!packDetails.title.trim() || !packDetails.description.trim() || !packDetails.category) {
      showMessage('error', 'Please fill all pack details (Title, Description, Category)');
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      showMessage('error', 'Please add at least one question before saving pack details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Save or update the test pack
      const packData = {
        title: packDetails.title,
        description: packDetails.description,
        time_limit_minutes: parseInt(packDetails.time_given, 10),
        difficulty: packDetails.difficulty,
        category_id: parseInt(packDetails.category, 10),
      };

      let savedPackId;
      if (isEditing) {
        await updateQuestionPack(packId, packData);
        savedPackId = packId;
        showMessage('success', 'Pack updated successfully');
      } else {
        const response = await addQuestionPack(packData);
        
        // Check if response has the expected structure
        if (!response || !response.data) {
          console.error('API returned invalid response:', response);
          throw new Error('API returned an invalid response structure');
        }
        
        // Log the response for debugging
        console.log('API Response:', response);
        
        // Handle both direct ID and nested ID in response.data
        savedPackId = response.data.id || (response.data.data && response.data.data.id);
        
        if (!savedPackId) {
          console.error('Could not find ID in response:', response);
          throw new Error('Could not find pack ID in the API response');
        }
        
        showMessage('success', 'Pack created successfully');
      }

      // Step 2: Save/update all questions and their options
      for (const question of questions) {
        const questionData = {
          testset_id: savedPackId,
          content: question.text,
          explanation: question.explanation || 'No explanation provided'
        };

        console.log('Sending question data:', questionData);
        
        let savedQuestionId;
        try {
          // If the question has a numeric ID from the database, update it
          if (question.id && !isNaN(question.id) && question.id > 0 && question.dbSaved) {
            await updateQuestion(question.id, questionData);
            savedQuestionId = question.id;
          } else {
            // Otherwise create a new question
            const questionResponse = await addQuestion(questionData);
            
            // Add defensive check for response and response.data
            if (!questionResponse || !questionResponse.data) {
              console.error('Invalid questionResponse:', questionResponse);
              throw new Error('Invalid response from addQuestion API');
            }
            
            console.log('Question created successfully:', questionResponse.data);
            savedQuestionId = questionResponse.data.id;
            
            if (!savedQuestionId) {
              console.error('Question ID not found in response');
              throw new Error('Question ID not found in API response');
            }
          }

          // Step 3: For each question, save/update its options
          for (const option of question.options) {
            const optionData = {
              question_id: savedQuestionId,
              content: option.text,
              is_correct: option.isCorrect
            };

            console.log('Sending option data:', optionData);
            
            try {
              // If option has a numeric ID from the database, update it
              if (option.id && !isNaN(option.id) && option.id > 0 && option.dbSaved) {
                await updateOption(option.id, optionData);
              } else {
                // Otherwise create a new option
                const optionResponse = await addOption(optionData);
                
                // Log the option creation
                console.log('Option created:', optionResponse?.data?.id || 'unknown ID');
              }
            } catch (optionError) {
              console.error(`Error creating option "${option.text}":`, optionError);
              // Continue with other options instead of failing the whole pack
            }
          }
        } catch (questionError) {
          console.error(`Error processing question "${question.text.substring(0, 30)}...":`, questionError);
          // Show warning but continue with other questions
          showMessage('warning', `One question could not be saved, but continuing with others`);
        }

        // If we're editing, handle deleting options that were removed
        if (isEditing && question.dbSaved) {
          // Get current options from database
          const optionsResponse = await getOptions(question.id);
          const dbOptions = optionsResponse.data || [];
          
          // Find options that exist in DB but not in our current state (they were deleted)
          const currentOptionIds = question.options.filter(o => o.dbSaved).map(o => o.id);
          const optionsToDelete = dbOptions.filter(o => !currentOptionIds.includes(o.id));
          
          // Delete each removed option
          for (const option of optionsToDelete) {
            await deleteOption(option.id);
          }
        }
      }

      // If we're editing, handle deleting questions that were removed
      if (isEditing) {
        // Get current questions from database
        const questionsResponse = await getQuestions(packId);
        const dbQuestions = questionsResponse.data || [];
        
        // Find questions that exist in DB but not in our current state (they were deleted)
        const currentQuestionIds = questions.filter(q => q.dbSaved).map(q => q.id);
        const questionsToDelete = dbQuestions.filter(q => !currentQuestionIds.includes(q.id));
        
        // Delete each removed question
        for (const question of questionsToDelete) {
          await deleteQuestion(question.id);
        }
      }
      
      // Navigate back to question packs list after a short delay
      setTimeout(() => {
        navigate('/website/question-packs');
      }, 1500);

    } catch (err) {
      console.error("Save pack error:", err);
      const errorMsg = err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} pack.`;
      setError(errorMsg);
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Render loading state for the whole form while fetching initial data
  if (formLoading) {
    return <div className="loading-indicator">Loading form...</div>;
  }
  
  // Render error state if initial data failed to load
  if (error && !formLoading) {
     return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="add-question-pack">
      <h1>{isEditing ? 'Edit' : 'Add'} Question Pack</h1>
      
      {message.show && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Display general loading state during save */}
      {loading && <div className="loading-indicator">Saving...</div>}

      <div className="pack-form">
        {/* --- Pack Details Section --- */}
        <div className="form-section">
          <h2>Pack Details</h2>
          {/* Title */} 
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={packDetails.title} onChange={handlePackDetailsChange} placeholder="Enter pack title" disabled={loading}/>
          </div>
          {/* Description */} 
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={packDetails.description} onChange={handlePackDetailsChange} placeholder="Enter pack description" rows="3" disabled={loading}></textarea>
          </div>
          {/* Row for Time, Difficulty, Category */} 
          <div className="form-row">
            {/* Time Given */} 
            <div className="form-group">
              <label>Time Given (minutes)</label>
              <input type="number" name="time_given" value={packDetails.time_given} onChange={handlePackDetailsChange} min="1" disabled={loading}/>
            </div>
            {/* Difficulty */} 
            <div className="form-group">
              <label>Difficulty</label>
              <select name="difficulty" value={packDetails.difficulty} onChange={handlePackDetailsChange} disabled={loading}>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            {/* Category */} 
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={packDetails.category} onChange={handlePackDetailsChange} disabled={loading || apiCategories.length === 0}>
                {apiCategories.length === 0 && <option value="">Loading categories...</option>}
                {apiCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Question Creator Section --- */}
        <div className="form-section">
          <h2>Question Creator</h2>
          {/* Question Text */}
          <div className="form-group">
            <label>Question Text</label>
            <textarea 
              value={currentQuestion.text} 
              onChange={handleQuestionChange} 
              placeholder="Enter question here" 
              rows="3"
              disabled={loading}
            ></textarea>
          </div>
          
          {/* Options */}
          <div className="options-container">
            <label>Answer Options <span className="help-text">(Select correct answer)</span></label>
            {currentQuestion.options.map(option => (
              <div key={option.id} className="option-row">
                <input 
                  type="radio" 
                  checked={option.isCorrect} 
                  onChange={() => handleCorrectOptionChange(option.id)}
                  disabled={loading}
                />
                <input 
                  type="text" 
                  value={option.text} 
                  onChange={(e) => handleOptionChange(option.id, e.target.value)} 
                  placeholder="Option text"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => removeOption(option.id)} 
                  className="remove-option-btn"
                  disabled={currentQuestion.options.length <= 2 || loading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {/* Add Option Button */}
          <button 
            type="button" 
            onClick={addOptionToQuestion} 
            className="add-option-btn"
            disabled={currentQuestion.options.length >= 4 || loading}
          >
            + Add Option
          </button>
          
          {/* Add Question Button */}
          <button 
            type="button" 
            onClick={addQuestionToList} 
            className="add-question-btn"
            disabled={!currentQuestion.text.trim() || currentQuestion.options.some(o => !o.text.trim()) || loading}
          >
            Add Question to Pack
          </button>
        </div>
        
        {/* --- Questions List Section --- */}
        <div className="form-section questions-list">
          <h2>Questions in Pack</h2>
          {questions.length === 0 ? (
            <div className="no-questions">No questions added yet.</div>
          ) : (
            <div className="questions-container">
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                    <button 
                      className="remove-question-btn" 
                      onClick={() => removeQuestion(question.id)}
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="question-text">{question.text}</div>
                  <div className="question-options">
                    {question.options.map(option => (
                      <div key={option.id} className={`option ${option.isCorrect ? 'correct' : ''}`}>
                        {option.text}
                        {option.isCorrect && <span className="correct-marker">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* --- Save Button --- */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleSavePack} 
            className="save-pack-btn"
            disabled={loading || questions.length === 0}
          >
            {loading ? 'Saving...' : `${isEditing ? 'Update' : 'Save'} Question Pack`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddQuestionPack; 