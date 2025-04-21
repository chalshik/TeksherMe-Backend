import React from 'react';
import './NotFound.css';

function NotFound({ navigateTo }) {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <a href="#" className="home-button" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default NotFound; 