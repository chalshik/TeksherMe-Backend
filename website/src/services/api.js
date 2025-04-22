import axios from 'axios';

// Set to true to use mock data, false to use the real API
const USE_MOCK_DATA = false;

// Fix API base URL to ensure it points to the correct location
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Mock data for fallback when API is unavailable
const MOCK_DATA = {
  categories: [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'Python' },
    { id: 3, name: 'Java' },
    { id: 4, name: 'C#' }
  ],
  testsets: [
    { 
      id: 1, 
      title: 'JavaScript Basics',
      description: 'Test your knowledge of JavaScript fundamentals',
      time_limit_minutes: 30,
      difficulty: 'Easy',
      category: 1
    },
    { 
      id: 2, 
      title: 'Python Data Structures',
      description: 'Advanced quiz on Python data structures',
      time_limit_minutes: 45,
      difficulty: 'Medium',
      category: 2
    }
  ],
  questions: [
    {
      id: 1,
      testset: 1,
      content: 'What is the output of: console.log(typeof [])?',
      explanation: 'In JavaScript, arrays are objects, so typeof [] returns "object"'
    },
    {
      id: 2,
      testset: 1,
      content: 'Which method adds an element to the end of an array?',
      explanation: 'The push() method adds new items to the end of an array'
    }
  ],
  options: [
    { id: 1, question: 1, content: '"object"', is_correct: true },
    { id: 2, question: 1, content: '"array"', is_correct: false },
    { id: 3, question: 1, content: '"undefined"', is_correct: false },
    { id: 4, question: 1, content: '"string"', is_correct: false },
    { id: 5, question: 2, content: 'push()', is_correct: true },
    { id: 6, question: 2, content: 'pop()', is_correct: false },
    { id: 7, question: 2, content: 'shift()', is_correct: false },
    { id: 8, question: 2, content: 'unshift()', is_correct: false }
  ]
};

// Configure axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to include cookies in cross-site requests
  withCredentials: true,
});

// Add a request interceptor to include auth token if available
apiClient.interceptors.request.use(config => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      config.headers['Authorization'] = `Bearer ${userData.token}`;
    }
  }
  return config;
});

// Add a response interceptor to catch and log errors
apiClient.interceptors.response.use(
  response => response, 
  error => {
    console.error('API Error Response:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

// Cache to store API responses
const apiCache = {
  data: {},
  timestamps: {},
  // Cache expiration time in milliseconds (5 minutes)
  expirationTime: 5 * 60 * 1000,
  
  // Get data from cache if available and not expired
  get(key) {
    const timestamp = this.timestamps[key];
    const now = Date.now();
    
    // Check if cache exists and is still valid
    if (timestamp && now - timestamp < this.expirationTime) {
      return this.data[key];
    }
    
    return null;
  },
  
  // Store data in cache
  set(key, data) {
    this.data[key] = data;
    this.timestamps[key] = Date.now();
  },
  
  // Remove item from cache
  remove(key) {
    delete this.data[key];
    delete this.timestamps[key];
  },
  
  // Clear category-specific data from cache
  invalidateCategory(id) {
    this.remove('categories');
    this.remove(`category_${id}`);
  },
  
  // Clear testset-specific data from cache
  invalidateTestSet(id) {
    this.remove('testsets');
    this.remove(`testset_${id}`);
  }
};

// Helper function to handle API calls with optional fallback to mock data and caching
const callApi = async (apiCall, mockResponse, cacheKey = null) => {
  if (USE_MOCK_DATA) {
    console.log('Using mock data (MOCK MODE ENABLED)');
    return {
      data: mockResponse,
      status: 200,
      statusText: 'OK (MOCK)',
      headers: {},
      config: {}
    };
  }
  
  // Try to get from cache if a cacheKey is provided
  if (cacheKey && !cacheKey.includes('_write')) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for: ${cacheKey}`);
      return cachedData;
    }
  }
  
  try {
    const response = await apiCall();
    console.log('API Success Response:', response.data);
    
    // Store in cache if cacheKey is provided
    if (cacheKey && !cacheKey.includes('_write')) {
      apiCache.set(cacheKey, response);
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error; // Re-throw the error instead of falling back to mock data
  }
};

// --- Category Endpoints ---
export const getCategories = () => callApi(
  () => apiClient.get('/categories/categories/'),
  MOCK_DATA.categories,
  'categories'
);

export const getCategory = (id) => callApi(
  () => apiClient.get(`/categories/categories/${id}/`),
  MOCK_DATA.categories.find(c => c.id === id),
  `category_${id}`
);

export const addCategory = (categoryData) => callApi(
  () => apiClient.post('/categories/categories/', categoryData),
  { ...categoryData, id: Date.now() },
  'categories_write'
).then(response => {
  // Invalidate category cache after adding a new category
  apiCache.invalidateCategory();
  return response;
});

export const updateCategory = (id, categoryData) => callApi(
  () => apiClient.put(`/categories/categories/${id}/`, categoryData),
  { ...categoryData, id },
  `category_${id}_write`
).then(response => {
  // Invalidate category cache after update
  apiCache.invalidateCategory(id);
  return response;
});

export const deleteCategory = (id) => callApi(
  () => apiClient.delete(`/categories/categories/${id}/`),
  { success: true },
  `category_${id}_delete`
).then(response => {
  // Invalidate category cache after delete
  apiCache.invalidateCategory(id);
  return response;
});

// --- Question Pack (TestSet) Endpoints ---
export const getQuestionPacks = (filters = {}) => {
  // Build query parameters for server-side filtering
  const params = new URLSearchParams();
  
  if (filters.category) {
    params.append('category_id', filters.category);
  }
  
  if (filters.difficulty) {
    // Send difficulty in lowercase to match backend storage format
    params.append('difficulty', filters.difficulty.toLowerCase());
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/testsets/testsets/?${queryString}` : '/testsets/testsets/';
  
  // Create a unique cache key based on the filters
  const cacheKey = queryString ? `testsets_${queryString}` : 'testsets';
  
  console.log(`API Request: ${endpoint}`);
  
  return callApi(
    () => apiClient.get(endpoint),
    MOCK_DATA.testsets,
    cacheKey
  );
};

export const getQuestionPack = (id) => callApi(
  () => apiClient.get(`/testsets/testsets/${id}/`),
  MOCK_DATA.testsets.find(t => t.id === parseInt(id)),
  `testset_${id}`
);

export const addQuestionPack = (packData) => callApi(
  () => apiClient.post('/testsets/testsets/', packData),
  { ...packData, id: Date.now() },
  'testsets_write'
).then(response => {
  // Invalidate testsets cache after adding
  apiCache.invalidateTestSet();
  return response;
});

export const updateQuestionPack = (id, packData) => callApi(
  () => apiClient.put(`/testsets/testsets/${id}/`, packData),
  { ...packData, id },
  `testset_${id}_write`
).then(response => {
  // Invalidate testset cache after update
  apiCache.invalidateTestSet(id);
  return response;
});

export const deleteQuestionPack = (id) => callApi(
  () => apiClient.delete(`/testsets/testsets/${id}/`),
  { success: true },
  `testset_${id}_delete`
).then(response => {
  // Invalidate testset cache after delete
  apiCache.invalidateTestSet(id);
  return response;
});

// --- Question Endpoints ---
export const getQuestions = (testsetId) => callApi(
  () => {
    if (testsetId) {
      return apiClient.get(`/testsets/questions/?testset_id=${testsetId}`);
    }
    return apiClient.get('/testsets/questions/');
  },
  testsetId 
    ? MOCK_DATA.questions.filter(q => q.testset === parseInt(testsetId))
    : MOCK_DATA.questions
);

export const getQuestion = (id) => callApi(
  () => apiClient.get(`/testsets/questions/${id}/`),
  MOCK_DATA.questions.find(q => q.id === parseInt(id))
);

export const addQuestion = (questionData) => callApi(
  () => apiClient.post('/testsets/questions/', questionData),
  { ...questionData, id: Date.now() }
);

export const updateQuestion = (id, questionData) => callApi(
  () => apiClient.put(`/testsets/questions/${id}/`, questionData),
  { ...questionData, id }
);

export const deleteQuestion = (id) => callApi(
  () => apiClient.delete(`/testsets/questions/${id}/`),
  { success: true }
);

// --- Option Endpoints ---
export const getOptions = (questionId) => callApi(
  () => {
    if (questionId) {
      return apiClient.get(`/testsets/options/?question_id=${questionId}`);
    }
    return apiClient.get('/testsets/options/');
  },
  questionId 
    ? MOCK_DATA.options.filter(o => o.question === parseInt(questionId))
    : MOCK_DATA.options
);

export const getOption = (id) => callApi(
  () => apiClient.get(`/testsets/options/${id}/`),
  MOCK_DATA.options.find(o => o.id === parseInt(id))
);

export const addOption = (optionData) => callApi(
  () => apiClient.post('/testsets/options/', optionData),
  { ...optionData, id: Date.now() }
);

export const updateOption = (id, optionData) => callApi(
  () => apiClient.put(`/testsets/options/${id}/`, optionData),
  { ...optionData, id }
);

export const deleteOption = (id) => callApi(
  () => apiClient.delete(`/testsets/options/${id}/`),
  { success: true }
);

// --- Attempt Endpoints ---
export const getAttempts = (testsetId) => callApi(
  () => {
    if (testsetId) {
      return apiClient.get(`/attempts/attempts/?testset_id=${testsetId}`);
    }
    return apiClient.get('/attempts/attempts/');
  },
  []
);

export const getAttempt = (id) => callApi(
  () => apiClient.get(`/attempts/attempts/${id}/`),
  { id, user: 1, testset: 1, score_percent: 80, passed: true, duration_minutes: 25 }
);

export const addAttempt = (attemptData) => callApi(
  () => apiClient.post('/attempts/attempts/', attemptData),
  { ...attemptData, id: Date.now() }
);

export const updateAttempt = (id, attemptData) => callApi(
  () => apiClient.put(`/attempts/attempts/${id}/`, attemptData),
  { ...attemptData, id }
);

export const deleteAttempt = (id) => callApi(
  () => apiClient.delete(`/attempts/attempts/${id}/`),
  { success: true }
);

// --- Answer Endpoints ---
export const getAnswers = (attemptId) => callApi(
  () => {
    if (attemptId) {
      return apiClient.get(`/attempts/answers/?attempt_id=${attemptId}`);
    }
    return apiClient.get('/attempts/answers/');
  },
  []
);

export const getAnswer = (id) => callApi(
  () => apiClient.get(`/attempts/answers/${id}/`),
  { id, attempt: 1, question: 1, selected_option: 1, is_correct: true }
);

export const addAnswer = (answerData) => callApi(
  () => apiClient.post('/attempts/answers/', answerData),
  { ...answerData, id: Date.now() }
);

export const updateAnswer = (id, answerData) => callApi(
  () => apiClient.put(`/attempts/answers/${id}/`, answerData),
  { ...answerData, id }
);

export const deleteAnswer = (id) => callApi(
  () => apiClient.delete(`/attempts/answers/${id}/`),
  { success: true }
);

// --- Question Bookmark Endpoints ---
export const getQuestionBookmarks = (testsetId, questionId) => callApi(
  () => {
    let url = '/bookmarks/question-bookmarks/';
    const params = [];
    if (testsetId) params.push(`testset_id=${testsetId}`);
    if (questionId) params.push(`question_id=${questionId}`);
    if (params.length) url += `?${params.join('&')}`;
    return apiClient.get(url);
  },
  []
);

export const getQuestionBookmark = (id) => callApi(
  () => apiClient.get(`/bookmarks/question-bookmarks/${id}/`),
  { id, user: 1, testset: 1, question: 1 }
);

export const addQuestionBookmark = (bookmarkData) => callApi(
  () => apiClient.post('/bookmarks/question-bookmarks/', bookmarkData),
  { ...bookmarkData, id: Date.now() }
);

export const deleteQuestionBookmark = (id) => callApi(
  () => apiClient.delete(`/bookmarks/question-bookmarks/${id}/`),
  { success: true }
);

// --- TestSet Bookmark Endpoints ---
export const getTestSetBookmarks = (testsetId) => callApi(
  () => {
    if (testsetId) {
      return apiClient.get(`/bookmarks/testset-bookmarks/?testset_id=${testsetId}`);
    }
    return apiClient.get('/bookmarks/testset-bookmarks/');
  },
  []
);

export const getTestSetBookmark = (id) => callApi(
  () => apiClient.get(`/bookmarks/testset-bookmarks/${id}/`),
  { id, user: 1, testset: 1 }
);

export const addTestSetBookmark = (bookmarkData) => callApi(
  () => apiClient.post('/bookmarks/testset-bookmarks/', bookmarkData),
  { ...bookmarkData, id: Date.now() }
);

export const deleteTestSetBookmark = (id) => callApi(
  () => apiClient.delete(`/bookmarks/testset-bookmarks/${id}/`),
  { success: true }
);

export default apiClient; 