import React, { useState } from 'react';
import { getCategoriesWithCount, saveCategory, deleteCategory } from '../utils/dummyData';
import './CategoryManager.css';

function CategoryManager({ navigateTo }) {
  const [categories, setCategories] = useState(getCategoriesWithCount());
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saveMessage, setSaveMessage] = useState({ show: false, type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, categoryId: null });

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      // Create and save the new category
      const newCategoryObj = { name: newCategory };
      const updatedCategories = saveCategory(newCategoryObj);
      
      // Update local state
      setCategories(updatedCategories);
      setNewCategory('');
      
      // Show success message
      showMessage('success', 'Category added successfully');
    } else {
      showMessage('error', 'Category name cannot be empty');
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      // Save the updated category
      const categoryToUpdate = { id: editingId, name: editName };
      const updatedCategories = saveCategory(categoryToUpdate);
      
      // Update local state
      setCategories(updatedCategories);
      setEditingId(null);
      
      // Show success message
      showMessage('success', 'Category updated successfully');
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

  const handleDelete = () => {
    if (deleteConfirm.categoryId) {
      // Delete the category
      const updatedCategories = deleteCategory(deleteConfirm.categoryId);
      
      // Update local state
      setCategories(updatedCategories);
      
      // Close the confirmation dialog
      setDeleteConfirm({ show: false, categoryId: null });
      
      // Show success message
      showMessage('success', 'Category deleted successfully');
    }
  };

  const showMessage = (type, text) => {
    setSaveMessage({ show: true, type, text });
    setTimeout(() => {
      setSaveMessage({ show: false, type: '', text: '' });
    }, 3000);
  };

  const handleQuestionPacksClick = (categoryName) => {
    // Navigate to question packs with this category pre-selected in filters
    navigateTo('question-packs-with-filter', categoryName);
  };

  return (
    <div className="category-manager">
      <h1>Category Manager</h1>
      
      {saveMessage.show && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}
      
      <div className="add-category">
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory}>Add Category</button>
      </div>
      
      <div className="categories-table">
        <div className="table-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">Questions Count</div>
          <div className="header-cell">Packs Count</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {categories.map(category => (
          <div className="table-row" key={category.id}>
            <div className="table-cell">
              {editingId === category.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                category.name
              )}
            </div>
            <div className="table-cell">{category.questionsCount}</div>
            <div className="table-cell pack-count-cell">
              <span 
                className="pack-count" 
                onClick={() => handleQuestionPacksClick(category.name)}
                title="View question packs for this category"
              >
                {category.packsCount}
              </span>
            </div>
            <div className="table-cell actions">
              {editingId === category.id ? (
                <button className="save-btn" onClick={saveEdit}>Save</button>
              ) : (
                <button className="edit-btn" onClick={() => startEditing(category)}>Edit</button>
              )}
              <button 
                className="delete-btn" 
                onClick={() => confirmDelete(category.id)}
                disabled={category.packsCount > 0}
                title={category.packsCount > 0 ? "Cannot delete category with question packs" : "Delete category"}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="confirm-delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManager; 