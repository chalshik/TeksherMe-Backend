import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../firebase/hooks';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthorized } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 