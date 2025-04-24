import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  loadCategories, 
  saveNewCategory, 
  updateCategory, 
  deleteCategory,
  loadQuestionPacks,
  deleteQuestionPack
} from '../../firebase/firestore';
import './Admin.css';

const Admin = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [questionPacks, setQuestionPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    isEditing: false
  });
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch categories and question packs
  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesData = await loadCategories();
      const questionPacksData = await loadQuestionPacks();
      
      setCategories(categoriesData);
      setQuestionPacks(questionPacksData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  // Category functions
  const openAddCategoryModal = () => {
    setCategoryFormData({
      id: '',
      name: '',
      isEditing: false
    });
    setShowCategoryModal(true);
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
      
      fetchData();
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
        fetchData();
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
        fetchData();
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
            <div className="stat-value">
              {questionPacks.reduce((total, pack) => total + (pack.questions?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Questions</div>
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
            <i className="fa fa-plus"></i> Add Category
          </button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Question Packs</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.packCount || 0}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openEditCategoryModal(category)}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No categories found</td>
                </tr>
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
          <Link to="/admin/question-pack-editor" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Question Pack
          </Link>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Questions</th>
                <th>Difficulty</th>
                <th>Time (min)</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questionPacks.length > 0 ? (
                questionPacks.map(pack => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.categoryName}</td>
                    <td>{pack.questions?.length || 0}</td>
                    <td>{pack.difficulty}</td>
                    <td>{pack.time}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/question-pack-editor/${pack.id}`} 
                          className="btn btn-secondary btn-sm"
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteQuestionPack(pack.id)}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No question packs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Category Modal
  const renderCategoryModal = () => {
    return (
      <div className={`modal ${showCategoryModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">
              {categoryFormData.isEditing ? 'Edit Category' : 'Add Category'}
            </h3>
            <button className="modal-close" onClick={closeCategoryModal}>&times;</button>
          </div>
          <form onSubmit={saveCategory}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group">
                <label htmlFor="categoryName" className="required-label">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  name="name"
                  className="form-control"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeCategoryModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {categoryFormData.isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Quiz Admin</h1>
        </div>
        <div className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fa fa-tachometer-alt"></i> Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} 
            onClick={() => setActiveTab('categories')}
          >
            <i className="fa fa-folder"></i> Categories
          </button>
          <button 
            className={`nav-item ${activeTab === 'question-packs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('question-packs')}
          >
            <i className="fa fa-file-alt"></i> Question Packs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa fa-spinner fa-spin"></i> Loading...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'question-packs' && renderQuestionPacks()}
          </>
        )}
      </div>

      {/* Modals */}
      {renderCategoryModal()}
    </div>
  );
};

export default Admin; 