import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('teksherme-theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Use system preference as fallback
    const prefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Apply theme to document when it changes
  useEffect(() => {
    // Set attribute on html element for CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('teksherme-theme', theme);
    
    // Fix critical CSS variables for dark mode to ensure visibility
    if (theme === 'dark') {
      // Fix backgrounds
      document.body.style.setProperty('--color-bg', '#121212');
      document.body.style.setProperty('--color-bg-secondary', '#1a1a1a');
      document.body.style.setProperty('--color-bg-elevated', '#252525');
      document.body.style.setProperty('--stat-card-bg', '#1e1e1e');
      document.body.style.setProperty('--activity-item-bg', '#1e1e1e');
      document.body.style.setProperty('--card-bg', '#1e1e1e');
      
      // Fix text colors
      document.body.style.setProperty('--color-text', '#ffffff');
      document.body.style.setProperty('--color-text-secondary', 'rgba(255, 255, 255, 0.85)');
      document.body.style.setProperty('--color-text-light', 'rgba(255, 255, 255, 0.65)');
      
      // Fix interactive states
      document.body.style.setProperty('--table-row-hover', 'rgba(33, 150, 243, 0.15)');
      document.body.style.setProperty('--bg-hover', 'rgba(255, 255, 255, 0.05)');
      document.body.style.setProperty('--bg-hover-item', 'rgba(255, 255, 255, 0.07)');
      
      // Fix borders
      document.body.style.setProperty('--border-default', 'rgba(255, 255, 255, 0.12)');
      document.body.style.setProperty('--table-header-bg', '#121212');
      
      // Fix admin.css variables
      document.body.style.setProperty('--primary', '#2196f3');
      document.body.style.setProperty('--primary-light', '#214a75');
      document.body.style.setProperty('--admin-primary', '#2196f3');
      document.body.style.setProperty('--admin-primary-light', '#214a75');
      document.body.style.setProperty('--gray-100', '#1e1e1e');
      document.body.style.setProperty('--gray-200', '#333333');
    } else {
      // Reset for light mode
      document.body.style.setProperty('--color-bg', '#ffffff');
      document.body.style.setProperty('--color-bg-secondary', '#f9f9f9');
      document.body.style.setProperty('--color-bg-elevated', '#ffffff');
      document.body.style.setProperty('--stat-card-bg', '#ffffff');
      document.body.style.setProperty('--activity-item-bg', '#ffffff');
      document.body.style.setProperty('--card-bg', '#ffffff');
      
      document.body.style.setProperty('--color-text', '#2d2d2d');
      document.body.style.setProperty('--color-text-secondary', 'rgba(45, 45, 45, 0.65)');
      document.body.style.setProperty('--color-text-light', 'rgba(45, 45, 45, 0.4)');
      
      document.body.style.setProperty('--table-row-hover', '#f0f7ff');
      document.body.style.setProperty('--bg-hover', 'rgba(45, 45, 45, 0.02)');
      document.body.style.setProperty('--bg-hover-item', 'rgba(45, 45, 45, 0.03)');
      
      document.body.style.setProperty('--border-default', 'rgba(45, 45, 45, 0.09)');
      document.body.style.setProperty('--table-header-bg', '#f9f9f9');
      
      document.body.style.setProperty('--primary-light', '#e8f4ff');
      document.body.style.setProperty('--gray-100', '#f9f9fa');
      document.body.style.setProperty('--gray-200', '#ebedef');
    }
    
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 