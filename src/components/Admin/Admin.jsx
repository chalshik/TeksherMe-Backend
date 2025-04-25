import React, { useState } from 'react';
import { logout } from '../../firebase/auth'; // Update path if needed
import { useNavigate } from 'react-router-dom'; // For redirection after logout
import { Link } from 'react-router-dom';
import { useCategories, useQuestionPacks } from '../../firebase/hooks';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  // ... other state and hooks ...
  const [logoutError, setLogoutError] = useState(''); // Optional: for displaying logout errors

  // ... other functions ...

  const handleLogout = async () => {
    setLogoutError(''); // Clear previous errors
    try {
      console.log("Attempting logout...");
      await logout(); // Call the imported logout function
      console.log("Logout successful.");
      // Redirect to the login page or home page after successful logout
      navigate('/login'); // Or '/' or wherever your public/login page is
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again."); // Set error state to display message
      // Optionally show an alert: alert("Logout failed. Please try again.");
    }
  };

  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    isEditing: false
  });
  const [error, setError] = useState('');

  // Use custom hooks for data
  const { 
    categories, 
    loading: categoriesLoading, 
    addCategory: saveNewCategory,
    editCategory: updateCategory,
    removeCategory: deleteCategory 
  } = useCategories();
  
  const {
    questionPacks,
    loading: packsLoading,
    removeQuestionPack: deleteQuestionPack
  } = useQuestionPacks();

  // Loading state
  const loading = categoriesLoading || packsLoading;

  // Category functions
  const openAddCategoryModal = () => {
    console.log('openAddCategoryModal called, setting showCategoryModal to true');
    setCategoryFormData({
      id: '',
      name: '',
      isEditing: false
    });
    setShowCategoryModal(true);
    console.log('showCategoryModal set to:', true);
    setError('');
  };

  const openEditCategoryModal = (category) => {
    setCategoryFormData({
      id: category.id,
      name: category.name,
      isEditing: true
    });
    setShowCategoryModal(true);
    setError('');
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const handleCategoryFormChange = (e) => {
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value
    });
  };

  
  const saveCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      if (categoryFormData.isEditing) {
        await updateCategory(categoryFormData.id, categoryFormData.name);
      } else {
        await saveNewCategory(categoryFormData.name);
      }
      
      closeCategoryModal();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also remove any associated question packs.')) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category. Please try again.');
      }
    }
  };

  // Question Pack functions
  const handleDeleteQuestionPack = async (packId) => {
    if (window.confirm('Are you sure you want to delete this question pack? This action cannot be undone.')) {
      try {
        await deleteQuestionPack(packId);
      } catch (error) {
        console.error('Error deleting question pack:', error);
        setError('Failed to delete question pack. Please try again.');
      }
    }
  };

  // Render functions
  const renderDashboard = () => {
    return (
      <div className="dashboard-container">
        <h2>Dashboard</h2>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{questionPacks.length}</div>
            <div className="stat-label">Question Packs</div>
          </div>
          <div className="stat-card">
            <div className="stat-container">
              <div className="stat-value">
                {questionPacks.reduce((total, pack) => total + (pack.questionCount || 0), 0)}
              </div>
              <div className="stat-label">Total Questions</div>
            </div>
          </div>
        </div>
        
        <div className="section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {questionPacks.slice(0, 3).map(pack => (
              <div className="activity-item" key={pack.id}>
                <div className="activity-icon">
                  <i className="fa fa-file-alt"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">{pack.name}</div>
                  <div className="activity-subtitle">{pack.categoryName} • {pack.questions?.length || 0} questions</div>
                </div>
              </div>
            ))}
            {questionPacks.length === 0 && (
              <div className="activity-item">
                <div className="activity-content">
                  <div className="activity-title">No recent activity</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    return (
      <div className="categories-container">
        <div className="section-header">
          <h2>Categories</h2>
          <button className="btn btn-primary" onClick={openAddCategoryModal}>
            <i className="fas fa-plus"></i> Add Category
          </button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Question Packs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">No categories found. Create your first one!</td>
                </tr>
              ) : (
                categories.map(category => {
                  const packCount = questionPacks.filter(pack => pack.categoryId === category.id).length;
                  return (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{packCount}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openEditCategoryModal(category)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={packCount > 0}
                            title={packCount > 0 ? "Delete associated question packs first" : ""}
                          >
                            <i className="fas fa-trash-alt"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderQuestionPacks = () => {
    return (
      <div className="question-packs-container">
        <div className="section-header">
          <h2>Question Packs</h2>
          <Link to="/admin/question-pack" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Question Pack
          </Link>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questionPacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No question packs found. Create your first one!</td>
                </tr>
              ) : (
                questionPacks.map(pack => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.categoryName}</td>
                    <td style={{ textTransform: 'capitalize' }}>{pack.difficulty || 'N/A'}</td>
                    <td>{pack.questionCount || pack.questions?.length || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/question-pack/${pack.id}`} className="btn btn-primary btn-sm">
                          <i className="fas fa-edit"></i> Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteQuestionPack(pack.id)}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCategoryModal = () => {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="modal-header">
            <h3>{categoryFormData.isEditing ? 'Edit Category' : 'Add Category'}</h3>
            <button className="close-button" onClick={closeCategoryModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={saveCategory}>
              <div className="form-group">
                <label htmlFor="category-name" className="required-label">Category Name</label>
                <input
                  id="category-name"
                  name="name"
                  type="text"
                  className="form-control"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  required
                  placeholder="Enter category name"
                />
              </div>
            </form>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={closeCategoryModal}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={saveCategory}
            >
              {categoryFormData.isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>TeksherMe</h1>
        </div>
        
        <div className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-line"></i>
            Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className="fas fa-folder"></i>
            Categories
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'questionPacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('questionPacks')}
          >
            <i className="fas fa-file-alt"></i>
            Question Packs
          </button>
        </div>
        
        <button onClick={handleLogout} className="logout-button">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
        
        {logoutError && <div className="alert alert-danger">{logoutError}</div>}
      </div>
      
      <div className="main-content">
        {/* Render the selected tab */}
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'questionPacks' && renderQuestionPacks()}
          </>
        )}
      </div>
      
      {/* Category Modal */}
      {showCategoryModal && renderCategoryModal()}
    </div>
  );
};

export default Admin; 