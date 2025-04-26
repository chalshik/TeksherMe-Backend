import React, { useState, useEffect } from 'react';
import { logout } from '../../firebase/auth'; // Update path if needed
import { useNavigate } from 'react-router-dom'; // For redirection after logout
import { Link } from 'react-router-dom';
import { useCategories, useQuestionPacks, useCommercials, useTestAttempts } from '../../firebase/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import './Admin.css';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Animation variants
const pageTransition = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      delay: custom * 0.1,
      ease: "easeOut"
    }
  }),
};

const activityItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (custom) => ({
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.3,
      delay: custom * 0.08,
      ease: "easeOut"
    }
  }),
  hover: { 
    x: 5,
    backgroundColor: "#f0f7ff",
    borderLeft: "3px solid var(--color-blue)",
    transition: { duration: 0.2 }
  }
};

// Analytics Component - Separate component for better organization
const Analytics = ({ questionPacks, categories, testAttempts }) => {
  console.log("Test Attempts Data:", testAttempts);
  
  // Create an empty map called testSetToUsers
  // This will store testSetIds as keys and sets of userIds as values
  const testSetToUsers = {};
  
  // Loop over each document from the query
  testAttempts.forEach(attempt => {
    // Only process documents where completed is true (should be all of them per the query)
    // and where both questionPackId and userId are valid
    if (attempt.completed && attempt.questionPackId && attempt.userId) {
      const testSetId = attempt.questionPackId;
      const userId = attempt.userId;
      
      // Check if testSetId exists in the map
      if (!testSetToUsers[testSetId]) {
        // If it does not exist, create a new empty Set for it
        testSetToUsers[testSetId] = new Set();
      }
      
      // Add the userId into the Set for that testSetId
      // Sets automatically prevent duplicate userIds
      testSetToUsers[testSetId].add(userId);
    }
  });
  
  // After looping through all documents, prepare the result
  // For each testSetId, count how many unique users are in its Set
  const uniqueUsersPerTestSet = {};
  Object.keys(testSetToUsers).forEach(testSetId => {
    // Count the number of unique users for this test set
    uniqueUsersPerTestSet[testSetId] = testSetToUsers[testSetId].size;
  });
  
  console.log("Unique Users Per Test Set:", uniqueUsersPerTestSet);
  
  // Extract the testSetIds and their counts
  const packIds = Object.keys(uniqueUsersPerTestSet).filter(id => id); // Filter out empty IDs
  
  // Get pack details with names and counts of unique users
  const packsWithDetails = packIds.map(id => {
    const pack = questionPacks.find(p => p.id === id);
    return {
      id,
      name: pack ? pack.name : `Pack ${id.substring(0, 6)}...`,
      count: uniqueUsersPerTestSet[id],
    };
  });
  
  // Get the top 5 by unique user count and keep them in descending order
  const chartData = [...packsWithDetails]
    .sort((a, b) => b.count - a.count) // Sort by count (highest first)
    .slice(0, 5); // Take top 5
  
  console.log("Final Chart Data (Unique Users):", chartData);
  
  // Check if we have data to display
  const hasData = chartData.length > 0;
  
  // Final data for horizontal bar chart
  const completionsData = {
    labels: hasData ? chartData.map(item => item.name) : ['No Data Available'],
    datasets: [
      {
        label: 'Unique Users Who Completed',
        data: hasData ? chartData.map(item => item.count) : [0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // This makes the bars horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as it's not needed for this visualization
      },
      title: {
        display: true,
        text: 'Number of Unique Users Who Completed Each Pack',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (tooltipItem) => {
            return `Unique Users: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Unique Users'
        },
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="analytics-content">
      <div className="stats-container">
        <motion.div 
          className="stat-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Categories</div>
        </motion.div>
        <motion.div 
          className="stat-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
          <div className="stat-value">{questionPacks.length}</div>
          <div className="stat-label">Question Packs</div>
        </motion.div>
        <motion.div 
          className="stat-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
          <div className="stat-container">
            <div className="stat-value">
              {questionPacks.reduce((total, pack) => total + (pack.questionCount || 0), 0)}
            </div>
            <div className="stat-label">Total Questions</div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="section analytics-section"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <h3>Unique Users per Pack</h3>
        <div className="analytics-container">
          <div className="chart-card full-width">
            <div className="chart-container horizontal-bar-chart">
              <Bar data={completionsData} options={chartOptions} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState(''); // Optional: for displaying logout errors
  const { theme } = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState('analytics');
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

  const {
    testAttempts,
    loading: testAttemptsLoading
  } = useTestAttempts();

  // Loading state
  const loading = categoriesLoading || packsLoading || commercialsLoading || testAttemptsLoading;

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

  // New Analytics section render function
  const renderAnalytics = () => {
    return (
      <motion.div 
        className="analytics-container-wrapper"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          backgroundColor: theme === 'dark' ? '#121212' : ''
        }}
      >
<<<<<<< HEAD
        <div className="section-header">
          <h2>Analytics Dashboard</h2>
        </div>
        
        <Analytics 
          questionPacks={questionPacks} 
          categories={categories} 
          testAttempts={testAttempts} 
        />
=======
        <h2>Dashboard</h2>
        
        <div className="stats-container">
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            style={{
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
              color: theme === 'dark' ? '#ffffff' : '',
              backgroundImage: theme === 'dark' ? 'none' : '',
              borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
            }}
          >
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            style={{
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
              color: theme === 'dark' ? '#ffffff' : '',
              backgroundImage: theme === 'dark' ? 'none' : '',
              borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
            }}
          >
            <div className="stat-value">{questionPacks.length}</div>
            <div className="stat-label">Question Packs</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            style={{
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
              color: theme === 'dark' ? '#ffffff' : '',
              backgroundImage: theme === 'dark' ? 'none' : '',
              borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
            }}
          >
            <div className="stat-container">
              <div className="stat-value">
                {questionPacks.reduce((total, pack) => {
                  return total + (pack.questions ? pack.questions.length : 0);
                }, 0)}
              </div>
              <div className="stat-label">Total Questions</div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="section"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={3}
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
            color: theme === 'dark' ? '#ffffff' : '',
            backgroundImage: theme === 'dark' ? 'none' : '',
            borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
          }}
        >
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {questionPacks.slice(0, 3).map((pack, index) => (
              <motion.div 
                className="activity-item" 
                key={pack.id}
                variants={activityItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={index}
                onClick={() => navigate(`/admin/question-pack/${pack.id}`)}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff'
                }}
              >
                <div className="activity-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">{pack.name}</div>
                  <div className="activity-subtitle">
                    {pack.categoryName || 'Uncategorized'} • {pack.questions ? pack.questions.length : 0} questions
                  </div>
                  <div className="activity-timestamp">
                    <i className="far fa-clock mr-1"></i>
                    {(() => {
                      try {
                        if (pack.updatedAt) 
                          return `Updated ${new Date(pack.updatedAt).toLocaleDateString()}`;
                        else if (pack.createdAt)
                          return `Created ${new Date(pack.createdAt).toLocaleDateString()}`;
                        return '';
                      } catch (e) {
                        return '';
                      }
                    })()}
                  </div>
                </div>
                <div className="activity-action">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </motion.div>
            ))}
            {questionPacks.length === 0 && (
              <motion.div 
                className="activity-item"
                variants={activityItemVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="activity-content">
                  <div className="activity-title">No recent activity</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
>>>>>>> 4b42466da55b1a23937b49b9553ee9524960cf26
      </motion.div>
    );
  };

  const renderCategories = () => {
    return (
      <motion.div 
        className="categories-container"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
          color: theme === 'dark' ? '#ffffff' : ''
        }}
      >
        <div className="section-header" style={{
          borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : ''
        }}>
          <h2 style={{ color: theme === 'dark' ? '#ffffff' : '' }}>Categories</h2>
          <motion.button 
            className="btn btn-primary" 
            onClick={openAddCategoryModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: theme === 'dark' ? '#2196f3' : ''
            }}
          >
            <i className="fas fa-plus" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i> Add Category
          </motion.button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="table-container">
          <table className="data-table" style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
            color: theme === 'dark' ? '#ffffff' : ''
          }}>
            <thead>
              <tr>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Name</th>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Question Packs</th>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center" style={{
                    backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : ''
                  }}>No categories found. Create your first one!</td>
                </tr>
              ) : (
                categories.map(category => {
                  const packCount = questionPacks.filter(pack => pack.categoryId === category.id).length;
                  return (
                    <tr key={category.id} style={{
                      borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '',
                      backgroundColor: theme === 'dark' ? '#1e1e1e' : ''
                    }}>
                      <td style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{category.name}</td>
                      <td style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{packCount}</td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="btn btn-primary btn-sm"
                            onClick={() => openEditCategoryModal(category)}
                            title="Edit Category"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              backgroundColor: theme === 'dark' ? '#2196f3' : ''
                            }}
                          >
                            <i className="fas fa-edit" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i>
                          </motion.button>
                          <motion.button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={packCount > 0}
                            title={packCount > 0 ? "Delete associated question packs first" : "Delete Category"}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              backgroundColor: theme === 'dark' ? '#ff5a5f' : '',
                              opacity: packCount > 0 ? '0.5' : '1'
                            }}
                          >
                            <i className="fas fa-trash-alt" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i>
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
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
      <div className="question-packs-container" style={{
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
        color: theme === 'dark' ? '#ffffff' : ''
      }}>
        <div className="section-header" style={{
          borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : ''
        }}>
          <h2 style={{ color: theme === 'dark' ? '#ffffff' : '' }}>Question Packs</h2>
          <Link to="/admin/question-pack" className="btn btn-primary" style={{
            backgroundColor: theme === 'dark' ? '#2196f3' : ''
          }}>
            <i className="fas fa-plus" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i> Add Question Pack
          </Link>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="filters-container" style={{
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '',
          color: theme === 'dark' ? '#ffffff' : ''
        }}>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="categoryFilter" style={{
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
              }}>Category</label>
              <select
                id="categoryFilter"
                name="categoryId"
                className="form-control"
                value={packFilters.categoryId}
                onChange={handleFilterChange}
                style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? '#ffffff' : '',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                }}
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
              <label htmlFor="difficultyFilter" style={{
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
              }}>Difficulty</label>
              <select
                id="difficultyFilter"
                name="difficulty"
                className="form-control"
                value={packFilters.difficulty}
                onChange={handleFilterChange}
                style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? '#ffffff' : '',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                }}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="filter-group filter-actions">
              <button className="btn btn-secondary" 
                onClick={resetFilters}
                style={{
                  backgroundColor: theme === 'dark' ? '#333333' : '',
                  color: theme === 'dark' ? '#ffffff' : '',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                }}
              >
                <i className="fas fa-undo" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i> Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table" style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
            color: theme === 'dark' ? '#ffffff' : ''
          }}>
            <thead>
              <tr>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Name</th>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Category</th>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Difficulty</th>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Questions</th>
                <th style={{
                  backgroundColor: theme === 'dark' ? '#121212' : '',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : ''
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{
                    backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : ''
                  }}>
                    {questionPacks.length === 0 
                      ? "No question packs found. Create your first one!"
                      : "No question packs match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredPacks.map(pack => (
                  <tr key={pack.id} style={{
                    borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '',
                    backgroundColor: theme === 'dark' ? '#1e1e1e' : ''
                  }}>
                    <td style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{pack.name}</td>
                    <td style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{pack.categoryName}</td>
                    <td style={{ textTransform: 'capitalize', color: theme === 'dark' ? '#ffffff' : '' }}>
                      {pack.difficulty || 'N/A'}
                    </td>
                    <td style={{ color: theme === 'dark' ? '#ffffff' : '' }}>
                      {pack.questionCount || pack.questions?.length || 0}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/question-pack/${pack.id}`} 
                          className="btn btn-primary btn-sm" 
                          title="Edit Question Pack"
                          style={{
                            backgroundColor: theme === 'dark' ? '#2196f3' : '',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.375rem 0.5rem'
                          }}
                        >
                          <i className="fas fa-edit" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i>
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteQuestionPack(pack.id)}
                          title="Delete Question Pack"
                          style={{
                            backgroundColor: theme === 'dark' ? '#ff5a5f' : '',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.375rem 0.5rem',
                            marginLeft: '0.5rem'
                          }}
                        >
                          <i className="fas fa-trash-alt" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i>
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
      <div className="commercials-container" style={{
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
        color: theme === 'dark' ? '#ffffff' : ''
      }}>
        <div className="section-header" style={{
          borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : ''
        }}>
          <h2 style={{ color: theme === 'dark' ? '#ffffff' : '' }}>Commercials</h2>
          <button className="btn btn-primary" onClick={openAddCommercialModal} style={{
            backgroundColor: theme === 'dark' ? '#2196f3' : ''
          }}>
            <i className="fas fa-plus" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i> Add Commercial
          </button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="cards-container">
          {commercials.length === 0 ? (
            <div className="empty-state" style={{
              backgroundColor: theme === 'dark' ? '#1e1e1e' : ''
            }}>
              <i className="fas fa-ad fa-3x"></i>
              <p style={{ color: theme === 'dark' ? '#ffffff' : '' }}>No commercials found. Create your first one!</p>
            </div>
          ) : (
            commercials.map(commercial => (
              <div className="commercial-card" key={commercial.id} style={{
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
                borderTop: theme === 'dark' ? '4px solid #2196f3' : ''
              }}>
                <div className="commercial-date" style={{
                  backgroundColor: theme === 'dark' ? '#2196f3' : ''
                }}>
                  {commercial.date instanceof Date 
                    ? commercial.date.toLocaleDateString()
                    : new Date(commercial.date).toLocaleDateString()}
                </div>
                <h3 className="commercial-title" style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{commercial.title}</h3>
                <p className="commercial-description" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '' }}>{commercial.description}</p>
                <div className="commercial-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditCommercialModal(commercial)}
                    title="Edit Commercial"
                    style={{
                      backgroundColor: theme === 'dark' ? '#2196f3' : ''
                    }}
                  >
                    <i className="fas fa-edit" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCommercial(commercial.id)}
                    title="Delete Commercial"
                    style={{
                      backgroundColor: theme === 'dark' ? '#ff5a5f' : ''
                    }}
                  >
                    <i className="fas fa-trash-alt" style={{ color: theme === 'dark' ? '#ffffff' : '#333333' }}></i>
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
        <div className="modal" style={{
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
          color: theme === 'dark' ? '#ffffff' : ''
        }}>
          <div className="modal-header" style={{
            borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : ''
          }}>
            <h3 style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{categoryFormData.isEditing ? 'Edit Category' : 'Add Category'}</h3>
            <button className="close-button" onClick={closeCategoryModal}>
              <i className="fas fa-times" style={{ color: theme === 'dark' ? '#ffffff' : '' }}></i>
            </button>
          </div>
          
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={saveCategory}>
              <div className="form-group">
                <label htmlFor="category-name" className="required-label" style={{ 
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '' 
                }}>Category Name</label>
                <input
                  id="category-name"
                  name="name"
                  type="text"
                  className="form-control"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  required
                  placeholder="Enter category name"
                  style={{
                    backgroundColor: theme === 'dark' ? '#121212' : '',
                    color: theme === 'dark' ? '#ffffff' : '',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                  }}
                />
              </div>
            </form>
          </div>
          
          <div className="modal-footer" style={{
            borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : ''
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={closeCategoryModal}
              style={{
                backgroundColor: theme === 'dark' ? '#333333' : '',
                color: theme === 'dark' ? '#ffffff' : '',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={saveCategory}
              style={{
                backgroundColor: theme === 'dark' ? '#2196f3' : ''
              }}
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
        <div className="modal" style={{
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '',
          color: theme === 'dark' ? '#ffffff' : ''
        }}>
          <div className="modal-header" style={{
            borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : ''
          }}>
            <h3 style={{ color: theme === 'dark' ? '#ffffff' : '' }}>{commercialFormData.isEditing ? 'Edit Commercial' : 'Add Commercial'}</h3>
            <button className="close-button" onClick={closeCommercialModal}>
              <i className="fas fa-times" style={{ color: theme === 'dark' ? '#ffffff' : '' }}></i>
            </button>
          </div>
          
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={saveCommercial}>
              <div className="form-group">
                <label htmlFor="commercial-title" className="required-label" style={{ 
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '' 
                }}>Title</label>
                <input
                  id="commercial-title"
                  name="title"
                  type="text"
                  className="form-control"
                  value={commercialFormData.title}
                  onChange={handleCommercialFormChange}
                  required
                  placeholder="Enter commercial title"
                  style={{
                    backgroundColor: theme === 'dark' ? '#121212' : '',
                    color: theme === 'dark' ? '#ffffff' : '',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                  }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="commercial-description" className="required-label" style={{ 
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '' 
                }}>Description</label>
                <textarea
                  id="commercial-description"
                  name="description"
                  className="form-control"
                  value={commercialFormData.description}
                  onChange={handleCommercialFormChange}
                  required
                  placeholder="Enter commercial description"
                  rows="4"
                  style={{
                    backgroundColor: theme === 'dark' ? '#121212' : '',
                    color: theme === 'dark' ? '#ffffff' : '',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                  }}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="commercial-date" className="required-label" style={{ 
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '' 
                }}>Date</label>
                <input
                  id="commercial-date"
                  name="date"
                  type="date"
                  className="form-control"
                  value={commercialFormData.date}
                  onChange={handleCommercialFormChange}
                  required
                  style={{
                    backgroundColor: theme === 'dark' ? '#121212' : '',
                    color: theme === 'dark' ? '#ffffff' : '',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
                  }}
                />
              </div>
            </form>
          </div>
          
          <div className="modal-footer" style={{
            borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : ''
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={closeCommercialModal}
              style={{
                backgroundColor: theme === 'dark' ? '#333333' : '',
                color: theme === 'dark' ? '#ffffff' : '',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : ''
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={saveCommercial}
              style={{
                backgroundColor: theme === 'dark' ? '#2196f3' : ''
              }}
            >
              {commercialFormData.isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container" style={{
      backgroundColor: theme === 'dark' ? '#121212' : ''
    }}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>TeksherMe</h1>
        </div>
        
        <div className="sidebar-nav">
          <motion.button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
<<<<<<< HEAD
            <i className="fas fa-chart-bar"></i>
            Analytics
=======
            <i className="fas fa-chart-line" style={{ color: 'inherit' }}></i>
            Dashboard
>>>>>>> 4b42466da55b1a23937b49b9553ee9524960cf26
          </motion.button>
          
          <motion.button 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-folder" style={{ color: 'inherit' }}></i>
            Categories
          </motion.button>
          
          <motion.button 
            className={`nav-item ${activeTab === 'questionPacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('questionPacks')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-file-alt" style={{ color: 'inherit' }}></i>
            Question Packs
          </motion.button>
          
          <motion.button 
            className={`nav-item ${activeTab === 'commercials' ? 'active' : ''}`}
            onClick={() => setActiveTab('commercials')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-ad" style={{ color: 'inherit' }}></i>
            Commercials
          </motion.button>
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
        
        <motion.button 
          onClick={handleLogout} 
          className="logout-button"
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-sign-out-alt" style={{ color: 'inherit' }}></i> Logout
        </motion.button>
        
        {logoutError && <div className="alert alert-danger">{logoutError}</div>}
      </div>
      
      <div className="main-content">
        {/* Render the selected tab with animation */}
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'questionPacks' && renderQuestionPacks()}
            {activeTab === 'commercials' && renderCommercials()}
          </AnimatePresence>
        )}
      </div>
      
      {/* Modals */}
      {showCategoryModal && renderCategoryModal()}
      {showCommercialModal && renderCommercialModal()}
    </div>
  );
};

export default Admin; 