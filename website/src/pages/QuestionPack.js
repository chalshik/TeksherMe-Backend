import React, { useState, useEffect } from 'react';
import { questionPacks, categories, difficulties, deleteQuestionPack } from '../utils/dummyData';
import './QuestionPack.css';

function QuestionPack({ navigateTo, initialCategory = '' }) {
  const [packs, setPacks] = useState(questionPacks);
  const [filteredPacks, setFilteredPacks] = useState(questionPacks);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: initialCategory,
    difficulty: '',
    search: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, packId: null });

  // Show filters automatically if an initial category is provided
  useEffect(() => {
    if (initialCategory) {
      setShowFilters(true);
    }
  }, [initialCategory]);

  // Apply filters whenever filters or packs change
  useEffect(() => {
    applyFilters();
  }, [filters, packs]);

  const handleEditPack = (id) => {
    navigateTo('edit-question-pack', id);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      search: ''
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    let result = [...packs];

    // Filter by category
    if (filters.category) {
      result = result.filter(pack => pack.category === filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      result = result.filter(pack => pack.difficulty === filters.difficulty);
    }

    // Filter by search term (in title or description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        pack => pack.title.toLowerCase().includes(searchTerm) || 
                pack.description.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPacks(result);
  };

  const confirmDelete = (e, packId) => {
    e.stopPropagation(); // Prevent triggering the card click
    setDeleteConfirm({ show: true, packId });
  };

  const cancelDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    setDeleteConfirm({ show: false, packId: null });
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    if (deleteConfirm.packId) {
      // Delete the pack from the data
      const updatedPacks = deleteQuestionPack(deleteConfirm.packId);
      
      // Update local state with the updated packs
      setPacks(updatedPacks);
      
      // Close the confirmation dialog
      setDeleteConfirm({ show: false, packId: null });
    }
  };

  return (
    <div className="question-pack">
      <div className="pack-header">
        <h1>Question Packs</h1>
        <div className="filter-controls">
          <button className="filter-toggle" onClick={toggleFilters}>
            🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {filters.category || filters.difficulty || filters.search ? (
            <button className="filter-reset" onClick={resetFilters}>
              Reset Filters
            </button>
          ) : null}
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Search</label>
            <input 
              type="text" 
              name="search" 
              value={filters.search} 
              onChange={handleFilterChange} 
              placeholder="Search by title or description"
            />
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Difficulty</label>
            <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
              <option value="">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div className="pack-grid">
        {filteredPacks.length > 0 ? (
          filteredPacks.map(pack => (
            <div 
              className="pack-card" 
              key={pack.id}
              onClick={() => handleEditPack(pack.id)}
            >
              <div className="pack-actions">
                <button 
                  className="pack-delete-btn" 
                  onClick={(e) => confirmDelete(e, pack.id)}
                  title="Delete Pack"
                >
                  ✕
                </button>
              </div>
              <div className="pack-title">{pack.title}</div>
              <div className="pack-category">{pack.category}</div>
              <div className="pack-description">{pack.description}</div>
              <div className="pack-meta">
                <div className="difficulty" data-difficulty={pack.difficulty.toLowerCase()}>
                  {pack.difficulty}
                </div>
                <div className="time">{pack.timeGiven} min</div>
                <div className="questions-count">{pack.questions.length} questions</div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No question packs found matching your filters</p>
            <button onClick={resetFilters}>Clear Filters</button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this question pack? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="confirm-delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="add-new-container">
        <button className="add-new-btn" onClick={() => navigateTo('add-question-pack')}>
          + Add New Question Pack
        </button>
      </div>
    </div>
  );
}

export default QuestionPack; 