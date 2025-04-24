import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories, useQuestionPacks } from '../../firebase/hooks';
import './Admin.css';

const Admin = () => {
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
                    <td>{category.questionPackCount || 0}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => openEditCategoryModal(category)}
                      >
                        <i className="fa fa-edit"></i> Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
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
          <Link to="/admin/question-pack" className="btn btn-primary">
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
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questionPacks.length > 0 ? (
                questionPacks.map(pack => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.categoryName}</td>
                    <td>{pack.questionCount || 0}</td>
                    <td className="text-capitalize">{pack.difficulty || 'Easy'}</td>
                    <td className="text-center">
                      <Link 
                        to={`/admin/question-pack/${pack.id}`}
                        className="btn btn-sm btn-outline-primary mr-2"
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteQuestionPack(pack.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No question packs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCategoryModal = () => {
    return (
      showCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>{categoryFormData.isEditing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="close-button" onClick={closeCategoryModal}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={saveCategory}>
                <div className="form-group">
                  <label htmlFor="name">Category Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryFormChange}
                    className="form-control"
                    required
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeCategoryModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {categoryFormData.isEditing ? 'Update' : 'Add'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
    );
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="logo">TeksherMe Admin</div>
        <div className="user-menu">
          <span className="user-name">Admin</span>
        </div>
      </header>
      
      <div className="admin-content">
        <nav className="admin-nav">
          <ul>
            <li 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fa fa-home"></i> Dashboard
            </li>
            <li 
              className={activeTab === 'categories' ? 'active' : ''}
              onClick={() => setActiveTab('categories')}
            >
              <i className="fa fa-folder"></i> Categories
            </li>
            <li 
              className={activeTab === 'packs' ? 'active' : ''}
              onClick={() => setActiveTab('packs')}
            >
              <i className="fa fa-book"></i> Question Packs
            </li>
          </ul>
        </nav>
        
        <main className="admin-main">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'categories' && renderCategories()}
              {activeTab === 'packs' && renderQuestionPacks()}
            </>
          )}
        </main>
      </div>
      
      {renderCategoryModal()}
    </div>
  );
};

export default Admin; 