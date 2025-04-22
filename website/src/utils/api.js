import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// API endpoints
export const apiEndpoints = {
    // Categories
    categories: {
        list: () => api.get('categories/'),
        create: (data) => api.post('categories/', data),
        detail: (id) => api.get(`categories/${id}/`),
        update: (id, data) => api.put(`categories/${id}/`, data),
        delete: (id) => api.delete(`categories/${id}/`),
    },

    // Test Sets
    testSets: {
        list: () => api.get('testsets/'),
        create: (data) => api.post('testsets/', data),
        detail: (id) => api.get(`testsets/${id}/`),
        update: (id, data) => api.put(`testsets/${id}/`, data),
        delete: (id) => api.delete(`testsets/${id}/`),
    },

    // Questions
    questions: {
        list: () => api.get('questions/'),
        create: (data) => api.post('questions/', data),
        detail: (id) => api.get(`questions/${id}/`),
        update: (id, data) => api.put(`questions/${id}/`, data),
        delete: (id) => api.delete(`questions/${id}/`),
    },

    // Options
    options: {
        list: () => api.get('options/'),
        create: (data) => api.post('options/', data),
        detail: (id) => api.get(`options/${id}/`),
        update: (id, data) => api.put(`options/${id}/`, data),
        delete: (id) => api.delete(`options/${id}/`),
    },

    // Test Attempts
    attempts: {
        list: () => api.get('attempts/'),
        create: (data) => api.post('attempts/', data),
        detail: (id) => api.get(`attempts/${id}/`),
        update: (id, data) => api.put(`attempts/${id}/`, data),
        delete: (id) => api.delete(`attempts/${id}/`),
    },

    // Bookmarks
    bookmarks: {
        question: {
            list: () => api.get('bookmarks/question-bookmarks/'),
            create: (data) => api.post('bookmarks/question-bookmarks/', data),
            delete: (id) => api.delete(`bookmarks/question-bookmarks/${id}/`),
        },
        testSet: {
            list: () => api.get('bookmarks/testset-bookmarks/'),
            create: (data) => api.post('bookmarks/testset-bookmarks/', data),
            delete: (id) => api.delete(`bookmarks/testset-bookmarks/${id}/`),
        },
    },
};

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api; 