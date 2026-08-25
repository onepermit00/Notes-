import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  createSession: (sessionId, role) =>
    api.post(ENDPOINTS.AUTH_SESSION, { session_id: sessionId, role }),
  getMe: () => api.get(ENDPOINTS.AUTH_ME),
  logout: () => api.post(ENDPOINTS.AUTH_LOGOUT),
  switchRole: (role) => api.post(ENDPOINTS.AUTH_SWITCH_ROLE, { role }),
};

// Tasks APIs
export const tasksAPI = {
  getTasks: () => api.get(ENDPOINTS.TASKS),
  createTask: (task) => api.post(ENDPOINTS.TASKS, task),
  updateTask: (taskId, update) => api.put(`${ENDPOINTS.TASKS}/${taskId}`, update),
};

// Activities APIs
export const activitiesAPI = {
  getActivities: (limit = 50) => api.get(ENDPOINTS.ACTIVITIES, { params: { limit } }),
  createActivity: (activity) => api.post(ENDPOINTS.ACTIVITIES, activity),
};

// Vitals APIs
export const vitalsAPI = {
  getVitals: () => api.get(ENDPOINTS.VITALS),
  recordVital: (vital) => api.post(ENDPOINTS.VITALS, vital),
};

// Messages APIs
export const messagesAPI = {
  getMessages: (limit = 50) => api.get(ENDPOINTS.MESSAGES, { params: { limit } }),
  sendMessage: (message) => api.post(ENDPOINTS.MESSAGES, message),
};

// Copilot APIs
export const copilotAPI = {
  chat: (sessionId, message, role = 'caregiver', context = null) =>
    api.post(ENDPOINTS.COPILOT_CHAT, {
      session_id: sessionId,
      message,
      role,
      context,
    }),
};

// Image APIs
export const imageAPI = {
  upload: async (formData) => {
    const token = await AsyncStorage.getItem('session_token');
    return axios.post(`${API_BASE_URL}${ENDPOINTS.UPLOAD_IMAGE}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
  getImages: () => api.get(ENDPOINTS.IMAGES),
};

export default api;
