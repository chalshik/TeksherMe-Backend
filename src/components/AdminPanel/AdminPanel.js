import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  loadCategories, 
  getAllCategories,
  loadQuestionPacks,
  getQuestionPack,
  saveNewCategory,
  editCategory,
  deleteCategory,
  deleteQuestionPack 
} from '../../firebase/firestore';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Categories from './Categories';
import QuestionPacks from './QuestionPacks';
import CategoryModal from './CategoryModal';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [packs, setPacks] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryModalTitle, setCategoryModalTitle] = useState('Add Category');
  const [categoryName, setCategoryName] = useState('');

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await loadCategories();
        const packsData = await loadQuestionPacks();
        setCategories(categoriesData);
        setPacks(packsData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  // Category modal handlers
  const openAddCategoryModal = () => {
    setCategoryModalTitle('Add Category');
    setCategoryName('');
    setEditingCategoryId(null);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (categoryId, name) => {
    setCategoryModalTitle('Edit Category');
    setCategoryName(name);
    setEditingCategoryId(categoryId);
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
  };

  // Save category function
  const saveCategory = async () => {
    if (!categoryName.trim()) {
      alert('Please enter a category name.');
      return;
    }

    try {
      if (editingCategoryId) {
        // Edit existing category
        await editCategory(editingCategoryId, categoryName);
      } else {
        // Add new category
        await saveNewCategory(categoryName);
      }

      // Reload data
      const categoriesData = await loadCategories();
      const packsData = await loadQuestionPacks();
      setCategories(categoriesData);
      setPacks(packsData);
      
      // Close modal and reset state
      closeModal();
      setCategoryName('');
      setEditingCategoryId(null);
      alert('Category saved successfully!');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  // Delete category function
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all associated question packs.`)) {
      try {
        await deleteCategory(categoryId);
        
        // Reload data
        const categoriesData = await loadCategories();
        const packsData = await loadQuestionPacks();
        setCategories(categoriesData);
        setPacks(packsData);
        
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  // Delete question pack function
  const handleDeletePack = async (packId, packName) => {
    if (window.confirm(`Are you sure you want to delete the question pack "${packName}"?`)) {
      try {
        await deleteQuestionPack(packId);
        
        // Reload data
        const packsData = await loadQuestionPacks();
        setPacks(packsData);
        
        alert('Question pack deleted successfully!');
      } catch (error) {
        console.error('Error deleting question pack:', error);
        alert('Failed to delete question pack. Please try again.');
      }
    }
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onNavigation={handleNavigation} 
      />

      {/* Main Content */}
      <div className="main-content">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <Dashboard 
                categories={categories} 
                packs={packs} 
              />
            )}

            {/* Categories Section */}
            {activeSection === 'categories' && (
              <Categories 
                categories={categories} 
                onAddCategory={openAddCategoryModal}
                onEditCategory={openEditCategoryModal}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {/* Question Packs Section */}
            {activeSection === 'packs' && (
              <QuestionPacks 
                packs={packs} 
                onDeletePack={handleDeletePack}
              />
            )}
          </>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal 
        show={showCategoryModal}
        title={categoryModalTitle}
        categoryName={categoryName}
        onChangeCategoryName={(e) => setCategoryName(e.target.value)}
        onClose={closeModal}
        onSave={saveCategory}
      />
    </div>
  );
};

export default AdminPanel; 