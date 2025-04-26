import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import QuestionPackEditor from './components/Admin/QuestionPackEditor';
import Admin from './components/Admin/Admin';
import Login from './components/Login/Login';
import ProtectedRoute from './components/Login/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles'; // Import all styles through the index file

// Simple fade implementation without react-transition-group
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="routes-container">
      <Routes location={location}>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/question-pack" element={
          <ProtectedRoute>
            <QuestionPackEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/question-pack/:packId" element={
          <ProtectedRoute>
            <QuestionPackEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/question-pack-editor" element={
          <ProtectedRoute>
            <QuestionPackEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/question-pack-editor/:packId" element={
          <ProtectedRoute>
            <QuestionPackEditor />
          </ProtectedRoute>
        } />
        
        {/* Home route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <AnimatedRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
