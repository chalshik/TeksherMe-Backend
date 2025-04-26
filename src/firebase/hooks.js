import { useState, useEffect, useCallback } from 'react';
import {
  loadCategories,
  getAllCategories,
  saveNewCategory,
  updateCategory,
  deleteCategory,
  loadQuestionPacks,
  getQuestionPack,
  saveQuestionPack,
  updateQuestionPack,
  deleteQuestionPack,
  getPackQuestions,
  addQuestionToPack,
  updatePackQuestion,
  deletePackQuestion,
  loadCommercials,
  getCommercial,
  saveCommercial,
  updateCommercial,
  deleteCommercial
} from './firestore';
import {
  login as firebaseLogin,
  logout as firebaseLogout,
  getCurrentUser,
  subscribeToAuthChanges,
  isAuthorized
} from './auth';

/**
 * Hook for authentication state
 * @returns {Object} Authentication state and functions
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const user = await firebaseLogin(email, password);
      setUser(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await firebaseLogout();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAuthorized: user ? isAuthorized(user) : false
  };
};

/**
 * Hook for categories
 * @returns {Object} Categories data and functions
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadCategories();
      setCategories(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Add category
  const addCategory = async (name) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await saveNewCategory(name);
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      return newCategory;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const editCategory = async (categoryId, name) => {
    try {
      setLoading(true);
      setError(null);
      await updateCategory(categoryId, name);
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId ? { ...category, name } : category
        )
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const removeCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCategory(categoryId);
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory
  };
};

/**
 * Hook for question packs
 * @returns {Object} Question packs data and functions
 */
export const useQuestionPacks = () => {
  const [questionPacks, setQuestionPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load question packs
  const fetchQuestionPacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadQuestionPacks();
      setQuestionPacks(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize question packs
  useEffect(() => {
    fetchQuestionPacks();
  }, [fetchQuestionPacks]);

  // Get single question pack
  const getQuestionPackById = async (packId) => {
    try {
      setLoading(true);
      setError(null);
      const pack = await getQuestionPack(packId);
      return pack;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add question pack
  const addQuestionPack = async (packData) => {
    try {
      setLoading(true);
      setError(null);
      const newPack = await saveQuestionPack(packData);
      setQuestionPacks((prevPacks) => [...prevPacks, newPack]);
      return newPack;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update question pack
  const updateQuestionPackById = async (packId, packData) => {
    try {
      setLoading(true);
      setError(null);
      await updateQuestionPack(packId, packData);
      setQuestionPacks((prevPacks) =>
        prevPacks.map((pack) =>
          pack.id === packId ? { ...pack, ...packData } : pack
        )
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete question pack
  const removeQuestionPack = async (packId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteQuestionPack(packId);
      setQuestionPacks((prevPacks) =>
        prevPacks.filter((pack) => pack.id !== packId)
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    questionPacks,
    loading,
    error,
    fetchQuestionPacks,
    getQuestionPackById,
    addQuestionPack,
    updateQuestionPackById,
    removeQuestionPack
  };
};

/**
 * Hook for question operations within a pack
 * @param {string} packId - ID of the question pack
 * @returns {Object} Question operations
 */
export const useQuestions = (packId) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions for a pack
  const fetchQuestions = useCallback(async () => {
    if (!packId) return [];
    
    try {
      setLoading(true);
      setError(null);
      const questionsData = await getPackQuestions(packId);
      setQuestions(questionsData);
      return questionsData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [packId]);

  // Initialize questions
  useEffect(() => {
    if (packId) {
      fetchQuestions();
    }
  }, [packId, fetchQuestions]);

  // Add question
  const addQuestion = async (question) => {
    try {
      setLoading(true);
      setError(null);
      const newQuestion = await addQuestionToPack(packId, question);
      setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
      return newQuestion;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update question
  const updateQuestion = async (questionId, questionData) => {
    try {
      setLoading(true);
      setError(null);
      await updatePackQuestion(packId, questionId, questionData);
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.id === questionId ? { ...question, ...questionData } : question
        )
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const removeQuestion = async (questionId) => {
    try {
      setLoading(true);
      setError(null);
      await deletePackQuestion(packId, questionId);
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.id !== questionId)
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion
  };
};

/**
 * Hook for commercials
 * @returns {Object} Commercials data and functions
 */
export const useCommercials = () => {
  const [commercials, setCommercials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load commercials
  const fetchCommercials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadCommercials();
      setCommercials(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize commercials
  useEffect(() => {
    fetchCommercials();
  }, [fetchCommercials]);

  // Get a specific commercial
  const getCommercialById = async (commercialId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommercial(commercialId);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add commercial
  const addCommercial = async (commercialData) => {
    try {
      setLoading(true);
      setError(null);
      const newCommercial = await saveCommercial(commercialData);
      setCommercials((prevCommercials) => [newCommercial, ...prevCommercials]);
      return newCommercial;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update commercial
  const editCommercial = async (commercialId, commercialData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCommercial = await updateCommercial(commercialId, commercialData);
      setCommercials((prevCommercials) =>
        prevCommercials.map((commercial) =>
          commercial.id === commercialId ? { ...commercial, ...commercialData } : commercial
        )
      );
      return updatedCommercial;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete commercial
  const removeCommercial = async (commercialId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCommercial(commercialId);
      setCommercials((prevCommercials) =>
        prevCommercials.filter((commercial) => commercial.id !== commercialId)
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    commercials,
    loading,
    error,
    fetchCommercials,
    getCommercialById,
    addCommercial,
    editCommercial,
    removeCommercial
  };
}; 