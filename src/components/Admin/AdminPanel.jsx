import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  loadCategories, 
  saveNewCategory, 
  updateCategory, 
  deleteCategory, 
  loadQuestionPacks, 
  deleteQuestionPack 
} from '../../firebase/firestore';
import './AdminPanel.css';

const AdminPanel = () => {
  // State for data
  const [categories, setCategories] = useState([]);
  const [questionPacks, setQuestionPacks] = useState([]);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for category form
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  
  const navigate = useNavigate();

  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Load categories
        const categoriesData = await loadCategories();
        setCategories(categoriesData);
        
        // Load question packs
        const packsData = await loadQuestionPacks();
        setQuestionPacks(packsData);
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Reset error and success messages
  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  // Category functions
  const openAddCategoryModal = () => {
    setCategoryForm({ id: '', name: '' });
    setIsEditingCategory(false);
    setShowCategoryModal(true);
    resetMessages();
  };

  const openEditCategoryModal = (category) => {
    setCategoryForm({ id: category.id, name: category.name });
    setIsEditingCategory(true);
    setShowCategoryModal(true);
    resetMessages();
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryForm({ id: '', name: '' });
    resetMessages();
  };

  const handleCategoryFormChange = (e) => {
    setCategoryForm({
      ...categoryForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveCategory = async () => {
    // Validate form
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsLoading(true);
      resetMessages();
      
      if (isEditingCategory) {
        // Update existing category
        await updateCategory(categoryForm.id, categoryForm.name);
        
        // Update local state
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === categoryForm.id ? { ...cat, name: categoryForm.name } : cat
          )
        );
        
        setSuccess('Category updated successfully');
      } else {
        // Add new category
        const newCategory = await saveNewCategory(categoryForm.name);
        
        // Update local state
        setCategories(prevCategories => [...prevCategories, newCategory]);
        
        setSuccess('Category added successfully');
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        closeCategoryModal();
      }, 1500);
    } catch (err) {
      setError('Error saving category: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    // Check if category has question packs
    const categoryHasPacks = questionPacks.some(pack => pack.categoryId === categoryId);
    
    if (categoryHasPacks) {
      setError('Cannot delete category that has question packs. Delete the packs first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setIsLoading(true);
        resetMessages();
        
        // Delete category
        await deleteCategory(categoryId);
        
        // Update local state
        setCategories(prevCategories => 
          prevCategories.filter(cat => cat.id !== categoryId)
        );
        
        setSuccess('Category deleted successfully');
      } catch (err) {
        setError('Error deleting category: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Question pack functions
  const handleEditQuestionPack = (packId) => {
    navigate(`/admin/question-pack/${packId}`);
  };

  const handleDeleteQuestionPack = async (packId) => {
    if (window.confirm('Are you sure you want to delete this question pack?')) {
      try {
        setIsLoading(true);
        resetMessages();
        
        // Delete question pack
        await deleteQuestionPack(packId);
        
        // Update local state
        setQuestionPacks(prevPacks => 
          prevPacks.filter(pack => pack.id !== packId)
        );
        
        setSuccess('Question pack deleted successfully');
      } catch (err) {
        setError('Error deleting question pack: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="admin-panel">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Quiz Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button 
                className={activeTab === 'dashboard' ? 'active' : ''} 
                onClick={() => handleTabChange('dashboard')}
              >
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'categories' ? 'active' : ''} 
                onClick={() => handleTabChange('categories')}
              >
                <i className="fas fa-folder"></i>
                Categories
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'question-packs' ? 'active' : ''} 
                onClick={() => handleTabChange('question-packs')}
              >
                <i className="fas fa-book"></i>
                Question Packs
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">Loading...</div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            <div className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''}`} id="dashboard">
              <div className="content-header">
                <h1>Dashboard</h1>
              </div>
              
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-folder"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{categories.length}</h3>
                    <p>Categories</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-book"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{questionPacks.length}</h3>
                    <p>Question Packs</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-question"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{questionPacks.reduce((sum, pack) => sum + pack.questions.length, 0)}</h3>
                    <p>Total Questions</p>
                  </div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Questions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionPacks.slice(0, 5).map(pack => (
                        <tr key={pack.id}>
                          <td>{pack.name}</td>
                          <td>Question Pack</td>
                          <td>{pack.categoryName}</td>
                          <td>{pack.questions.length}</td>
                        </tr>
                      ))}
                      {questionPacks.length === 0 && (
                        <tr>
                          <td colSpan="4" className="empty-message">No activity to display</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Categories Tab */}
            <div className={`tab-content ${activeTab === 'categories' ? 'active' : ''}`} id="categories">
              <div className="content-header">
                <h1>Categories</h1>
                <button className="btn btn-primary" onClick={openAddCategoryModal}>
                  <i className="fas fa-plus"></i> Add Category
                </button>
              </div>
              
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Question Packs</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.packCount || 0}</td>
                        <td className="actions-cell">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => openEditCategoryModal(category)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan="3" className="empty-message">No categories found. Add your first category!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Question Packs Tab */}
            <div className={`tab-content ${activeTab === 'question-packs' ? 'active' : ''}`} id="question-packs">
              <div className="content-header">
                <h1>Question Packs</h1>
                <Link to="/admin/question-pack" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Add Question Pack
                </Link>
              </div>
              
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Questions</th>
                      <th>Difficulty</th>
                      <th>Time (min)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionPacks.map(pack => (
                      <tr key={pack.id}>
                        <td>{pack.name}</td>
                        <td>{pack.categoryName}</td>
                        <td>{pack.questions.length}</td>
                        <td className="capitalize">{pack.difficulty}</td>
                        <td>{pack.time}</td>
                        <td className="actions-cell">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEditQuestionPack(pack.id)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteQuestionPack(pack.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {questionPacks.length === 0 && (
                      <tr>
                        <td colSpan="6" className="empty-message">No question packs found. Add your first pack!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal" onClick={closeCategoryModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button className="modal-close" onClick={closeCategoryModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="required-label">Category Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeCategoryModal}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveCategory} 
                disabled={isLoading}
              >
                {isEditingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 