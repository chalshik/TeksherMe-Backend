import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

/**
 * Login function - authenticates user with Firebase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Authenticated user object
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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
    await signOut(auth);
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
  return !!user; // Any authenticated user is authorized
};

/**
 * Get current auth state
 * @returns {Object|null} - Current user object or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

/**
 * Get display name of current user
 * @returns {string} - Display name
 */
export const getDisplayName = () => {
  return auth.currentUser?.displayName || auth.currentUser?.email || '';
}; 