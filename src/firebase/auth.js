import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Single authorized user credentials
const AUTHORIZED_EMAIL = "ijgilik@example.com";
const AUTHORIZED_PASSWORD = "bozzat";
const AUTHORIZED_USERNAME = "Ijgilik";

/**
 * Login function - authenticates user with Firebase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Authenticated user object
 */
export const login = async (email, password) => {
  try {
    // Check if credentials match our single authorized user
    if (email === AUTHORIZED_EMAIL && password === AUTHORIZED_PASSWORD) {
      // For demo purposes, we're still using local auth but with Firebase structure
      // In a real app, we would use: await signInWithEmailAndPassword(auth, email, password);
      
      // Store authentication state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        email: AUTHORIZED_EMAIL,
        displayName: AUTHORIZED_USERNAME,
        uid: 'demo-user-id'
      }));
      
      return { 
        email: AUTHORIZED_EMAIL, 
        displayName: AUTHORIZED_USERNAME,
        uid: 'demo-user-id'
      };
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Authentication failed. Please check your credentials.");
  }
};

/**
 * Logout function - signs out the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
    // Keep Firebase signOut for future integration
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

/**
 * Check if current user is authorized
 * @param {Object} user - User object
 * @returns {boolean} - True if user is authorized
 */
export const isAuthorized = (user) => {
  return user && user.email === AUTHORIZED_EMAIL;
};

/**
 * Get current auth state from localStorage
 * @returns {Object|null} - Current user object or null if not authenticated
 */
export const getCurrentUser = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) return null;
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user;
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  // Initial call with current state
  const user = getCurrentUser();
  callback(user);
  
  // In a real app, we would use Firebase's onAuthStateChanged
  // return onAuthStateChanged(auth, (user) => {
  //   callback(user);
  // });
  
  // Return dummy unsubscribe function
  return () => {};
};

/**
 * Get display name of current user
 * @returns {string} - Display name
 */
export const getDisplayName = () => {
  return AUTHORIZED_USERNAME;
}; 