import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/api';
import './Home.css';

function Home({ navigateTo }) {
  const [apiStatus, setApiStatus] = useState({
    loading: false,
    success: null,
    error: null,
    data: null
  });

  const testApiConnection = async () => {
    setApiStatus({
      loading: true,
      success: null,
      error: null,
      data: null
    });

    try {
      const response = await getCategories();
      setApiStatus({
        loading: false,
        success: true,
        error: null,
        data: response.data
      });
    } catch (err) {
      setApiStatus({
        loading: false,
        success: false,
        error: err.message || 'Unknown error',
        data: null
      });
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>Quiz Management System</h1>
        <p>Create, manage, and organize your quizzes efficiently</p>
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

      <div className="api-test-section">
        <h2>API Connection Test</h2>
        <p>Test the connection to the backend API:</p>
        
        <button 
          onClick={testApiConnection}
          disabled={apiStatus.loading}
        >
          {apiStatus.loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        {apiStatus.success === true && (
          <div className="api-success">
            <p>✅ Successfully connected to API!</p>
            <p>Data received:</p>
            <pre>{JSON.stringify(apiStatus.data, null, 2)}</pre>
          </div>
        )}
        
        {apiStatus.success === false && (
          <div className="api-error">
            <p>❌ Failed to connect to API:</p>
            <p>{apiStatus.error}</p>
            <div className="troubleshooting">
              <h3>Troubleshooting:</h3>
              <ul>
                <li>Make sure the Django server is running</li>
                <li>Check if the API URL is correct (currently: http://localhost:8000/api/v1)</li>
                <li>Verify CORS settings in Django</li>
                <li>Open browser dev tools console to see detailed errors</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home; 