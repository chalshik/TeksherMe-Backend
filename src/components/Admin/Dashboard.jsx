import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import './Dashboard.css';

const Dashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalPacks: 0,
    totalQuestions: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  
  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Dashboard</h2>
      
      <div className="stats-container">
        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <i className="fas fa-layer-group"></i>
          <h3>Question Packs</h3>
          <p className="stat-number">{stats.totalPacks}</p>
        </motion.div>
        
        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <i className="fas fa-question-circle"></i>
          <h3>Total Questions</h3>
          <p className="stat-number">{stats.totalQuestions}</p>
        </motion.div>
        
        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <i className="fas fa-users"></i>
          <h3>Active Users</h3>
          <p className="stat-number">{stats.activeUsers}</p>
        </motion.div>
      </div>
      
      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <motion.div 
                key={activity.id || index}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="activity-icon">
                  <i className={getActivityIcon(activity.type)}></i>
                </div>
                <div className="activity-details">
                  <p>{activity.description}</p>
                  <span className="activity-time">{formatActivityTime(activity.timestamp)}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="no-activity">No recent activity</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 