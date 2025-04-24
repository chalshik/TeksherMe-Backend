import React from 'react';
import './Categories.css';

const Categories = ({ categories, onAddCategory, onEditCategory, onDeleteCategory }) => {
  return (
    <div id="categories-section">
      <div className="page-header">
        <h2>Categories</h2>
        <button 
          className="btn btn-primary"
          onClick={onAddCategory}
        >
          <i className="fas fa-plus"></i> New Category
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <table id="categories-table">
            <thead>
              <tr>
                <th width="50%">Category Name</th>
                <th>Question Packs</th>
                <th width="20%">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.questionPackCount || 0}</td>
                    <td>
                      <button 
                        className="btn btn-edit btn-sm"
                        onClick={() => onEditCategory(category.id, category.name)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="btn btn-delete btn-sm"
                        onClick={() => onDeleteCategory(category.id, category.name)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-text">No categories found. Add your first category!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories; 