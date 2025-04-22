import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CategoryManager from './pages/CategoryManager';
import QuestionPack from './pages/QuestionPack';
import AddQuestionPack from './pages/AddQuestionPack';
import NotFound from './pages/NotFound';
import './App.css';

// Protected Route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  
  // If still checking authentication status, show a loading indicator
  if (initializing) {
    return <div className="auth-loading">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  return user ? children : <Navigate to="/website/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* All routes are under /website to match Django's URL configuration */}
            
            {/* Login route */}
            <Route path="/website/login" element={<Login />} />
            
            {/* Home and other app routes, protected by authentication */}
            <Route
              path="/website"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="content">
                    <Home />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/website/categories"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="content">
                    <CategoryManager />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/website/question-packs"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="content">
                    <QuestionPack />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/website/add-question-pack"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="content">
                    <AddQuestionPack />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/website/edit-question-pack/:packId"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="content">
                    <AddQuestionPack />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Not found route */}
            <Route
              path="/website/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="content">
                    <NotFound />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Root path redirects to /website */}
            <Route path="/" element={<Navigate to="/website" />} />
            
            {/* Catch all other routes and redirect to /website */}
            <Route path="*" element={<Navigate to="/website" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
