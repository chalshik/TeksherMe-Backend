import React from 'react';
import './CategoryModal.css';

const CategoryModal = ({ show, title, categoryName, onChangeCategoryName, onClose, onSave }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="category-name">Category Name</label>
            <input 
              type="text" 
              id="category-name" 
              value={categoryName}
              onChange={onChangeCategoryName}
              required
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save Category</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal; 