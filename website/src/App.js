import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoryManager from './pages/CategoryManager';
import QuestionPack from './pages/QuestionPack';
import AddQuestionPack from './pages/AddQuestionPack';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [editPackId, setEditPackId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  const navigateTo = (page, param = null) => {
    setCurrentPage(page);
    
    if (page === 'edit-question-pack' && param !== null) {
      setEditPackId(param);
    } else if (page === 'question-packs-with-filter' && param !== null) {
      setFilterCategory(param);
      setCurrentPage('question-packs'); // Still go to question packs, just with a filter
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} />;
      case 'categories':
        return <CategoryManager navigateTo={navigateTo} />;
      case 'question-packs':
        return <QuestionPack navigateTo={navigateTo} initialCategory={filterCategory} />;
      case 'add-question-pack':
        return <AddQuestionPack navigateTo={navigateTo} />;
      case 'edit-question-pack':
        return <AddQuestionPack navigateTo={navigateTo} packId={editPackId} />;
      default:
        return <NotFound navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="App">
      <Navbar navigateTo={navigateTo} />
      <div className="content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
