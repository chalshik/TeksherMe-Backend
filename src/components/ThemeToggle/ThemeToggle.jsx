import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.button 
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="toggle-track" style={{
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'
      }}>
        <div className="toggle-indicator" style={{
          transform: isDark ? 'translateX(24px)' : 'translateX(0)'
        }}>
          {/* Sun icon */}
          <motion.div 
            className="toggle-icon sun-icon"
            initial={false}
            animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <i className="fas fa-sun"></i>
          </motion.div>
          
          {/* Moon icon */}
          <motion.div 
            className="toggle-icon moon-icon"
            initial={false}
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <i className="fas fa-moon"></i>
          </motion.div>
        </div>
      </div>
      <span className="toggle-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
    </motion.button>
  );
};

export default ThemeToggle; 