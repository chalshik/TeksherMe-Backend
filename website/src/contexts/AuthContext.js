import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

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
      // Use real API login endpoint
      const response = await axios.post(`${API_BASE_URL}/users/login/`, {
        username,
        password
      });
      
      if (response.data && response.data.token) {
        // Create user data with token from API
        const userData = {
          username,
          token: response.data.token
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        setError('Invalid response from server');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.non_field_errors?.[0] || 
                          'Invalid username or password';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // No API call needed for token logout
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
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