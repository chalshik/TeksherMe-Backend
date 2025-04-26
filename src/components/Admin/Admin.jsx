import React, { useState } from 'react';
import { logout } from '../../firebase/auth'; // Update path if needed
import { useNavigate } from 'react-router-dom'; // For redirection after logout
import { Link } from 'react-router-dom';
import { useCategories, useQuestionPacks, useCommercials } from '../../firebase/hooks';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState(''); // Optional: for displaying logout errors
  
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    isEditing: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter state for question packs
  const [packFilters, setPackFilters] = useState({
    categoryId: '',
    difficulty: ''
  });
  
  // Commercial state
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [commercialFormData, setCommercialFormData] = useState({
    id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
    isEditing: false
  });

  // Handle logout function
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
  
  const {
    commercials,
    loading: commercialsLoading,
    addCommercial,
    editCommercial,
    removeCommercial
  } = useCommercials();

  // Loading state
  const loading = categoriesLoading || packsLoading || commercialsLoading;

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPackFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setPackFilters({
      categoryId: '',
      difficulty: ''
    });
  };

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

  // Commercial functions
  const openAddCommercialModal = () => {
    setCommercialFormData({
      id: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isEditing: false
    });
    setShowCommercialModal(true);
    setError('');
    setSuccess('');
  };

  const openEditCommercialModal = (commercial) => {
    // Format date as YYYY-MM-DD for the input
    const formattedDate = commercial.date instanceof Date 
      ? commercial.date.toISOString().split('T')[0]
      : new Date(commercial.date).toISOString().split('T')[0];
      
    setCommercialFormData({
      id: commercial.id,
      title: commercial.title,
      description: commercial.description,
      date: formattedDate,
      isEditing: true
    });
    setShowCommercialModal(true);
    setError('');
    setSuccess('');
  };

  const closeCommercialModal = () => {
    setShowCommercialModal(false);
  };

  const handleCommercialFormChange = (e) => {
    const { name, value } = e.target;
    setCommercialFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveCommercial = async (e) => {
    e.preventDefault();
    
    if (!commercialFormData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!commercialFormData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!commercialFormData.date) {
      setError('Date is required');
      return;
    }
    
    try {
      if (commercialFormData.isEditing) {
        await editCommercial(commercialFormData.id, {
          title: commercialFormData.title,
          description: commercialFormData.description,
          date: commercialFormData.date
        });
        setSuccess('Commercial updated successfully');
      } else {
        await addCommercial({
          title: commercialFormData.title,
          description: commercialFormData.description,
          date: commercialFormData.date
        });
        setSuccess('Commercial added successfully');
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        closeCommercialModal();
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Error saving commercial:', error);
      setError('Failed to save commercial. Please try again.');
    }
  };

  const handleDeleteCommercial = async (commercialId) => {
    if (window.confirm('Are you sure you want to delete this commercial? This action cannot be undone.')) {
      try {
        await removeCommercial(commercialId);
        setSuccess('Commercial deleted successfully');
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } catch (error) {
        console.error('Error deleting commercial:', error);
        setError('Failed to delete commercial. Please try again.');
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
                  <i className="fas fa-file-alt"></i>
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
                            title="Edit Category"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={packCount > 0}
                            title={packCount > 0 ? "Delete associated question packs first" : "Delete Category"}
                          >
                            <i className="fas fa-trash-alt"></i>
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
    // Filter question packs based on selected filters
    const filteredPacks = questionPacks.filter(pack => {
      // Filter by category
      if (packFilters.categoryId && pack.categoryId !== packFilters.categoryId) {
        return false;
      }
      
      // Filter by difficulty
      if (packFilters.difficulty && pack.difficulty !== packFilters.difficulty) {
        return false;
      }
      
      return true;
    });
    
    return (
      <div className="question-packs-container">
        <div className="section-header">
          <h2>Question Packs</h2>
          <Link to="/admin/question-pack" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Question Pack
          </Link>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="categoryFilter">Category</label>
              <select
                id="categoryFilter"
                name="categoryId"
                className="form-control"
                value={packFilters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="difficultyFilter">Difficulty</label>
              <select
                id="difficultyFilter"
                name="difficulty"
                className="form-control"
                value={packFilters.difficulty}
                onChange={handleFilterChange}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="filter-group filter-actions">
              <button className="btn btn-secondary" onClick={resetFilters}>
                <i className="fas fa-undo"></i> Reset Filters
              </button>
            </div>
          </div>
        </div>
        
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
              {filteredPacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    {questionPacks.length === 0 
                      ? "No question packs found. Create your first one!"
                      : "No question packs match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredPacks.map(pack => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.categoryName}</td>
                    <td style={{ textTransform: 'capitalize' }}>{pack.difficulty || 'N/A'}</td>
                    <td>{pack.questionCount || pack.questions?.length || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/question-pack/${pack.id}`} className="btn btn-primary btn-sm" title="Edit Question Pack">
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteQuestionPack(pack.id)}
                          title="Delete Question Pack"
                        >
                          <i className="fas fa-trash-alt"></i>
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

  const renderCommercials = () => {
    return (
      <div className="commercials-container">
        <div className="section-header">
          <h2>Commercials</h2>
          <button className="btn btn-primary" onClick={openAddCommercialModal}>
            <i className="fas fa-plus"></i> Add Commercial
          </button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="cards-container">
          {commercials.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-ad fa-3x"></i>
              <p>No commercials found. Create your first one!</p>
            </div>
          ) : (
            commercials.map(commercial => (
              <div className="commercial-card" key={commercial.id}>
                <div className="commercial-date">
                  {commercial.date instanceof Date 
                    ? commercial.date.toLocaleDateString()
                    : new Date(commercial.date).toLocaleDateString()}
                </div>
                <h3 className="commercial-title">{commercial.title}</h3>
                <p className="commercial-description">{commercial.description}</p>
                <div className="commercial-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditCommercialModal(commercial)}
                    title="Edit Commercial"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCommercial(commercial.id)}
                    title="Delete Commercial"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))
          )}
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

  const renderCommercialModal = () => {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="modal-header">
            <h3>{commercialFormData.isEditing ? 'Edit Commercial' : 'Add Commercial'}</h3>
            <button className="close-button" onClick={closeCommercialModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={saveCommercial}>
              <div className="form-group">
                <label htmlFor="commercial-title" className="required-label">Title</label>
                <input
                  id="commercial-title"
                  name="title"
                  type="text"
                  className="form-control"
                  value={commercialFormData.title}
                  onChange={handleCommercialFormChange}
                  required
                  placeholder="Enter commercial title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="commercial-description" className="required-label">Description</label>
                <textarea
                  id="commercial-description"
                  name="description"
                  className="form-control"
                  value={commercialFormData.description}
                  onChange={handleCommercialFormChange}
                  required
                  placeholder="Enter commercial description"
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="commercial-date" className="required-label">Date</label>
                <input
                  id="commercial-date"
                  name="date"
                  type="date"
                  className="form-control"
                  value={commercialFormData.date}
                  onChange={handleCommercialFormChange}
                  required
                />
              </div>
            </form>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={closeCommercialModal}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={saveCommercial}
            >
              {commercialFormData.isEditing ? 'Update' : 'Save'}
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
          
          <button 
            className={`nav-item ${activeTab === 'commercials' ? 'active' : ''}`}
            onClick={() => setActiveTab('commercials')}
          >
            <i className="fas fa-ad"></i>
            Commercials
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
            {activeTab === 'commercials' && renderCommercials()}
          </>
        )}
      </div>
      
      {/* Modals */}
      {showCategoryModal && renderCategoryModal()}
      {showCommercialModal && renderCommercialModal()}
    </div>
  );
};

export default Admin; 