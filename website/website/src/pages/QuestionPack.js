import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getQuestionPacks, getCategories, deleteQuestionPack, apiCache } from '../services/api';
import './QuestionPack.css';

// Hardcode difficulties for filter dropdown
const difficulties = ['Easy', 'Medium', 'Hard'];

function QuestionPack() {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [filteredPacks, setFilteredPacks] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, packId: null });
  // Keep track if initial data is loaded
  const dataLoaded = useRef(false);
  // Track if a delete operation is in progress
  const [isDeleting, setIsDeleting] = useState(false);
  // Track if filtering is in progress
  const [isFiltering, setIsFiltering] = useState(false);
  // Add message state for notifications
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  // Function to show messages
  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => {
      setMessage({ show: false, type: '', text: '' });
    }, 3000); // Hide after 3 seconds
  };

  // Fetch test sets and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Only show loading indicator on initial load, not during refreshes
      if (!dataLoaded.current) {
        setLoading(true);
      }
      
      setError(null);
      try {
        // Invalidate cache to ensure fresh data
        await apiCache.invalidateTestSet();
        
        const [testSetsResponse, categoriesResponse] = await Promise.all([
          getQuestionPacks({ _noCache: Date.now() }), // Add a timestamp to prevent caching
          getCategories()
        ]);
        
        console.log('Fetched test sets response:', testSetsResponse);
        
        // Handle paginated response - extract results array if it exists
        let fetchedPacks = [];
        if (testSetsResponse.data) {
          // If it's a paginated response with 'results' array
          if (testSetsResponse.data.results) {
            fetchedPacks = testSetsResponse.data.results;
          }
          // If it's a direct array
          else if (Array.isArray(testSetsResponse.data)) {
            fetchedPacks = testSetsResponse.data;
          }
          // If it's neither, log the structure for debugging
          else {
            console.warn("Unexpected API response structure:", testSetsResponse.data);
            fetchedPacks = [];
          }
        }
        
        console.log('Processed fetched packs:', fetchedPacks);
        
        // Handle categories similarly
        let fetchedCategories = [];
        if (categoriesResponse.data) {
          if (categoriesResponse.data.results) {
            fetchedCategories = categoriesResponse.data.results;
          } else if (Array.isArray(categoriesResponse.data)) {
            fetchedCategories = categoriesResponse.data;
          }
        }
        
        setPacks(fetchedPacks);
        // Initialize filteredPacks with the same data
        setFilteredPacks(fetchedPacks);
        setApiCategories(fetchedCategories);
        dataLoaded.current = true;
        
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
          'Failed to fetch data from the API. Please check if the backend is running correctly.';
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Client-side filtering fallback - MOVED UP before the useEffect that uses it
  const applyClientSideFilters = useCallback(() => {
    if (!packs.length) return;
    
    let result = [...packs];

    // Filter by category ID
    if (filters.category) {
      const categoryId = parseInt(filters.category, 10);
      result = result.filter(pack => pack.category === categoryId);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      // Make the filter case-insensitive for better matching
      const difficultyLower = filters.difficulty.toLowerCase();
      result = result.filter(pack => pack.difficulty && pack.difficulty.toLowerCase() === difficultyLower);
    }

    // Filter by search term (in title or description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        pack => (pack.title?.toLowerCase() || '').includes(searchTerm) || 
                (pack.description?.toLowerCase() || '').includes(searchTerm)
      );
    }

    setFilteredPacks(result);
  }, [filters, packs]);

  // Fetch filtered packs when filters change
  useEffect(() => {
    // Skip the initial render to avoid double loading
    if (!dataLoaded.current) return;
    
    // Only fetch if any filter is applied
    const hasActiveFilters = filters.category || filters.difficulty || filters.search;
    if (!hasActiveFilters) {
      // Reset to initial data when no filters are applied
      setFilteredPacks(packs);
      return;
    }
    
    const fetchFilteredData = async () => {
      setIsFiltering(true);
      try {
        // Log the query being sent to API
        console.log("Requesting filtered data with:", filters);
        const response = await getQuestionPacks(filters);
        console.log("Filtered API response:", response);
        
        // Handle paginated response
        let filteredData = [];
        if (response.data) {
          if (response.data.results) {
            filteredData = response.data.results;
          } else if (Array.isArray(response.data)) {
            filteredData = response.data;
          }
        }
        
        setFilteredPacks(filteredData);
      } catch (err) {
        console.error('Error fetching filtered data:', err);
        // If server-side filtering fails, fall back to client-side filtering
        applyClientSideFilters();
      } finally {
        setIsFiltering(false);
      }
    };
    
    // Debounce the fetch to avoid too many requests while typing
    const timeoutId = setTimeout(fetchFilteredData, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, packs, applyClientSideFilters]);

  const handleEditPack = (id) => {
    console.log('Navigating to edit question pack with ID:', id);
    navigate(`/website/edit-question-pack/${id}`);
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
    
    // Reset to initial data when filters are cleared
    setFilteredPacks(packs);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const confirmDelete = (e, packId) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, packId });
  };

  const cancelDelete = (e) => {
    if (e) e.stopPropagation();
    setDeleteConfirm({ show: false, packId: null });
  };

  const handleDelete = async (e) => {
    if (e) e.stopPropagation();
    
    if (deleteConfirm.packId) {
      const packToDelete = deleteConfirm.packId;
      setIsDeleting(true);
      
      try {
        console.log('Deleting question pack with ID:', packToDelete);
        const response = await deleteQuestionPack(packToDelete);
        console.log('Delete response:', response);
        
        // Force a complete refresh of data
        const freshDataResponse = await getQuestionPacks({ _forceRefresh: Date.now() });
        console.log('Fresh data after deletion:', freshDataResponse);
        
        let updatedPacks = [];
        if (freshDataResponse.data) {
          if (Array.isArray(freshDataResponse.data)) {
            updatedPacks = freshDataResponse.data;
          } else if (freshDataResponse.data.results) {
            updatedPacks = freshDataResponse.data.results;
          }
        }
        
        // Update state with fresh data from API
        setPacks(updatedPacks);
        
        // Also update filtered packs to match the current filter criteria
        if (filters.category || filters.difficulty || filters.search) {
          const filteredResponse = await getQuestionPacks({
            ...filters,
            _forceRefresh: Date.now()
          });
          
          let newFilteredPacks = [];
          if (filteredResponse.data) {
            if (Array.isArray(filteredResponse.data)) {
              newFilteredPacks = filteredResponse.data;
            } else if (filteredResponse.data.results) {
              newFilteredPacks = filteredResponse.data.results;
            }
          }
          setFilteredPacks(newFilteredPacks);
        } else {
          // If no filters active, filtered packs should match all packs
          setFilteredPacks(updatedPacks);
        }
        
        showMessage('success', 'Question pack deleted successfully');
      } catch (err) {
        setError('Failed to delete the question pack. Please try again.');
        console.error('Error deleting pack:', err);
        showMessage('error', 'Failed to delete question pack');
      } finally {
        setDeleteConfirm({ show: false, packId: null });
        setIsDeleting(false);
      }
    }
  };
  
  const getCategoryName = (categoryId) => {
    const category = apiCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  // Function to refresh data
  const refreshData = async () => {
    if (loading || isDeleting || isFiltering) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiCache.invalidateTestSet();
      
      const testSetsResponse = await getQuestionPacks({ _forceRefresh: Date.now() });
      console.log('Refreshed test sets:', testSetsResponse);
      
      // Process the data
      let fetchedPacks = [];
      if (testSetsResponse.data) {
        if (testSetsResponse.data.results) {
          fetchedPacks = testSetsResponse.data.results;
        } else if (Array.isArray(testSetsResponse.data)) {
          fetchedPacks = testSetsResponse.data;
        }
      }
      
      // Update state
      setPacks(fetchedPacks);
      
      // If we have active filters, refresh filtered data too
      if (filters.category || filters.difficulty || filters.search) {
        setIsFiltering(true);
        try {
          const filteredResponse = await getQuestionPacks({
            ...filters,
            _forceRefresh: Date.now()
          });
          
          let newFilteredPacks = [];
          if (filteredResponse.data) {
            if (filteredResponse.data.results) {
              newFilteredPacks = filteredResponse.data.results;
            } else if (Array.isArray(filteredResponse.data)) {
              newFilteredPacks = filteredResponse.data;
            }
          }
          setFilteredPacks(newFilteredPacks);
        } catch (filterErr) {
          console.error('Error refreshing filtered data:', filterErr);
          // Fallback to client-side filtering
          applyClientSideFilters();
        } finally {
          setIsFiltering(false);
        }
      } else {
        // No filters, filtered packs should match all packs
        setFilteredPacks(fetchedPacks);
      }
      
      showMessage('success', 'Data refreshed successfully');
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
      showMessage('error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-pack">
      {message.show && (
        <div className={`message-notification ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="pack-header">
        <h1>Question Packs</h1>
        <div className="filter-controls">
          <button className="filter-toggle" onClick={toggleFilters} disabled={loading}>
            🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="refresh-btn" onClick={refreshData} disabled={loading || isDeleting || isFiltering}>
            🔄 Refresh
          </button>
          {filters.category || filters.difficulty || filters.search ? (
            <button className="filter-reset" onClick={resetFilters} disabled={loading || isFiltering}>
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
              disabled={loading || isFiltering}
            />
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange} 
              disabled={loading || isFiltering || apiCategories.length === 0}
            >
              <option value="">All Categories</option>
              {apiCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Difficulty</label>
            <select 
              name="difficulty" 
              value={filters.difficulty} 
              onChange={handleFilterChange} 
              disabled={loading || isFiltering}
            >
              <option value="">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
          
          {isFiltering && (
            <div className="filter-loading">Filtering...</div>
          )}
        </div>
      )}
      
      {loading && !isDeleting && !isFiltering && <div className="loading">Loading Question Packs...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && (
        <div className="pack-grid">
          {filteredPacks.length > 0 ? (
            filteredPacks.map(pack => (
              <div 
                className="pack-card" 
                key={pack.id}
                onClick={() => handleEditPack(pack.id)}
                role="button" 
                tabIndex="0"
              >
                <div className="pack-actions">
                  <button 
                    className="pack-delete-btn" 
                    onClick={(e) => confirmDelete(e, pack.id)}
                    title="Delete Pack"
                    disabled={isDeleting}
                  >
                    ✕
                  </button>
                </div>
                <div className="pack-title">{pack.title || 'Untitled Pack'}</div>
                <div className="pack-category">{getCategoryName(pack.category)}</div>
                <div className="pack-description">{pack.description || 'No description'}</div>
                <div className="pack-meta">
                  <div className={`difficulty difficulty-${(pack.difficulty || 'unknown').toLowerCase()}`}>
                    {pack.difficulty || 'Unknown'}
                  </div>
                  {pack.time_given != null && <div className="time">{pack.time_given} min</div>}
                  {pack.questions_count != null && <div className="questions-count">{pack.questions_count} questions</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>{packs.length === 0 ? 'No question packs have been created yet.' : 'No question packs found matching your filters.'}</p>
              {packs.length > 0 && (filters.category || filters.difficulty || filters.search) && (
                <button onClick={resetFilters} disabled={isFiltering}>Clear Filters</button>
              )}
            </div>
          )}
        </div>
      )}

      {deleteConfirm.show && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this question pack? This action cannot be undone.</p>
            {error && <p className="error">{error}</p>}
            <div className="delete-modal-actions">
              <button onClick={cancelDelete} disabled={isDeleting}>Cancel</button>
              <button className="delete-btn" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="add-new-container">
        <Link to="/website/add-question-pack" className="add-new-btn">
          + Add New Question Pack
        </Link>
      </div>
    </div>
  );
}

export default QuestionPack; 