import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/api';
import './CategoryManager.css';

function CategoryManager({ navigateTo }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState({ show: false, type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, categoryId: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Track if data has been loaded already
  const dataLoaded = useRef(false);
  // Track specific operations
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Wrap fetchCategories in useCallback to prevent infinite loop
  const fetchCategories = useCallback(async () => {
    // Only show main loading indicator on initial load
    if (!dataLoaded.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await getCategories();
      console.log('Categories API response:', response);
      
      // Handle potential pagination or direct array
      let categoriesData = [];
      if (response.data) {
        if (response.data.results) {
          categoriesData = response.data.results;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        }
      }
      
      setCategories(categoriesData);
      dataLoaded.current = true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch categories from the API. Please check if the backend is running.';
      setError(errorMessage);
      console.error('Fetch categories error:', err);
      showMessage('error', errorMessage);
      // Set empty array on error
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);  // Empty dependency array since this doesn't depend on any props or state

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      setIsAdding(true);
      try {
        const response = await addCategory({ name: newCategory.trim() });
        // Optimistically update the UI without refetching
        if (response.data && response.data.id) {
          setCategories(prevCategories => [...prevCategories, response.data]);
        }
        setNewCategory('');
        showMessage('success', 'Category added successfully');
      } catch (err) {
        setError('Failed to add category.');
        console.error('Add category error:', err);
        showMessage('error', 'Failed to add category.');
      } finally {
        setIsAdding(false);
      }
    } else {
      showMessage('error', 'Category name cannot be empty');
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (editName.trim() && editingId !== null) {
      setIsEditing(true);
      try {
        const response = await updateCategory(editingId, { name: editName.trim() });
        // Optimistically update the UI without refetching
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingId ? { ...cat, name: editName.trim() } : cat
          )
        );
        setEditingId(null);
        setEditName('');
        showMessage('success', 'Category updated successfully');
      } catch (err) {
        setError('Failed to update category.');
        console.error('Update category error:', err);
        showMessage('error', 'Failed to update category.');
      } finally {
        setIsEditing(false);
      }
    } else {
      showMessage('error', 'Category name cannot be empty');
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirm({ show: true, categoryId: id });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, categoryId: null });
  };

  const handleDelete = async () => {
    if (deleteConfirm.categoryId) {
      setIsDeleting(true);
      try {
        await deleteCategory(deleteConfirm.categoryId);
        // Optimistically update the UI without refetching
        setCategories(prevCategories => 
          prevCategories.filter(cat => cat.id !== deleteConfirm.categoryId)
        );
        setDeleteConfirm({ show: false, categoryId: null });
        showMessage('success', 'Category deleted successfully');
      } catch (err) {
        // Handle potential errors, e.g., category still in use
        const errorMessage = err.response?.data?.detail || 'Failed to delete category.';
        setError(errorMessage);
        console.error('Delete category error:', err);
        showMessage('error', errorMessage);
        setDeleteConfirm({ show: false, categoryId: null }); // Close modal even on error
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => {
      setMessage({ show: false, type: '', text: '' });
    }, 3000);
  };

  // Removed handleQuestionPacksClick as packsCount is not available from basic API

  return (
    <div className="category-manager">
      <h1>Category Manager</h1>
      
      {message.show && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {loading && !isAdding && !isEditing && !isDeleting && <div className="loading-indicator">Loading...</div>}
      {/* Consider a more specific error display if needed */}

      <div className="add-category">
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          disabled={isAdding}
        />
        <button onClick={handleAddCategory} disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Category'}
        </button>
      </div>
      
      <div className="categories-table">
        <div className="table-header">
          <div className="header-cell">Name</div>
          {/* Removed Count Headers */}
          <div className="header-cell">Actions</div>
        </div>
        
        {!loading && categories.length === 0 && (
           <div className="table-row no-data">
             <div className="table-cell" colSpan="2">No categories found.</div>
           </div>
        )}

        {!loading && categories.map(category => (
          <div className="table-row" key={category.id}>
            <div className="table-cell">
              {editingId === category.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isEditing}
                />
              ) : (
                category.name
              )}
            </div>
            {/* Removed Count Cells */}
            <div className="table-cell actions">
              {editingId === category.id ? (
                <>
                  <button className="save-btn" onClick={saveEdit} disabled={isEditing}>
                    {isEditing ? 'Saving...' : 'Save'}
                  </button>
                  <button className="cancel-btn" onClick={cancelEditing} disabled={isEditing}>Cancel</button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => startEditing(category)} disabled={isEditing || isDeleting}>Edit</button>
              )}
              <button 
                className="delete-btn" 
                onClick={() => confirmDelete(category.id)}
                disabled={editingId === category.id || isDeleting}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this category?</p>
            <p className="warning">This action cannot be undone!</p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={cancelDelete} disabled={isDeleting}>Cancel</button>
              <button className="delete-btn" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManager; 