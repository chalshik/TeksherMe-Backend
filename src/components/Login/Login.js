import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../firebase/hooks';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      navigate('/admin');
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="login-container" style={{
      backgroundColor: isDark ? 'var(--color-bg)' : ''
    }}>
      <div className="login-card" style={{
        backgroundColor: isDark ? 'var(--color-bg-elevated)' : '',
        boxShadow: isDark ? 'var(--shadow-prominent)' : '',
        color: isDark ? 'var(--color-text)' : ''
      }}>
        <div className="theme-toggle-container" style={{ 
          position: 'absolute', 
          top: '15px', 
          right: '15px'
        }}>
          <ThemeToggle />
        </div>
        <h2 className="login-title" style={{
          color: isDark ? 'var(--color-text)' : ''
        }}>Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" style={{
              color: isDark ? 'var(--color-text-secondary)' : ''
            }}>
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              placeholder="Enter your email"
              autoComplete="email"
              style={{
                backgroundColor: isDark ? 'var(--input-bg)' : '',
                color: isDark ? 'var(--color-text)' : '',
                borderColor: isDark ? 'var(--input-border)' : ''
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" style={{
              color: isDark ? 'var(--color-text-secondary)' : ''
            }}>
              <i className="fas fa-lock"></i> Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                backgroundColor: isDark ? 'var(--input-bg)' : '',
                color: isDark ? 'var(--color-text)' : '',
                borderColor: isDark ? 'var(--input-border)' : ''
              }}
            />
          </div>
          
          {error && <div className="error-message" style={{
            color: 'var(--color-red)'
          }}>{error}</div>}
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={authLoading}
            style={{
              backgroundColor: isDark ? 'var(--color-blue)' : ''
            }}
          >
            {authLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i> Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Sign In
              </>
            )}
          </button>
        </form>
        <div className="login-footer" style={{
          color: isDark ? 'var(--color-text-secondary)' : '',
          borderTopColor: isDark ? 'var(--border-default)' : ''
        }}>
          &copy; {new Date().getFullYear()} TeksherMe
        </div>
      </div>
    </div>
  );
};

export default Login; 