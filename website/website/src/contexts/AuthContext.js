import React, { createContext, useState, useContext, useEffect } from 'react';
// Import but don't use apiClient for authentication
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Hardcoded credentials for use instead of API
  const validCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  // Check for existing user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing stored user data', err);
        localStorage.removeItem('user');
      }
    }
    setInitializing(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use hardcoded credentials instead of API call
      if (username === validCredentials.username && password === validCredentials.password) {
        // Create a fake token and user data
        const userData = {
          id: 1,
          username: username,
          name: 'Admin User',
          token: 'fake-auth-token-' + Date.now() // Simulate a token
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        setError('Invalid username or password');
        return false;
      }
    } catch (err) {
      const errorMessage = 'An error occurred during login';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // No API call needed
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    } catch (err) {
      console.error('Error during logout', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    initializing,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 