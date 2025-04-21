import React from 'react';
import './Home.css';

function Home({ navigateTo }) {
  return (
    <div className="home">
      <div className="hero">
        <h1>Quiz Management System</h1>
        <p>Create, manage, and organize your quizzes efficiently</p>
        
        <div className="cta-buttons">
          <a href="#" className="cta-button primary" onClick={(e) => { e.preventDefault(); navigateTo('categories'); }}>
            Manage Categories
          </a>
          <a href="#" className="cta-button secondary" onClick={(e) => { e.preventDefault(); navigateTo('question-packs'); }}>
            View Question Packs
          </a>
          <a href="#" className="cta-button tertiary" onClick={(e) => { e.preventDefault(); navigateTo('add-question-pack'); }}>
            Create New Pack
          </a>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h2>Category Manager</h2>
          <p>Organize your questions by categories</p>
        </div>
        
        <div className="feature-card">
          <h2>Question Packs</h2>
          <p>Browse and edit existing question packs</p>
        </div>
        
        <div className="feature-card">
          <h2>Question Creator</h2>
          <p>Easily create new questions with multiple options</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 