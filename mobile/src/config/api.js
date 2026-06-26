// API Configuration
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : 'https://caretrack-debug.preview.emergentagent.com/api';

export const ENDPOINTS = {
  // Auth
  AUTH_SESSION: '/auth/session',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_SWITCH_ROLE: '/auth/switch-role',
  
  // Tasks
  TASKS: '/tasks',
  
  // Activities
  ACTIVITIES: '/activities',
  
  // Vitals
  VITALS: '/vitals',
  
  // Messages
  MESSAGES: '/messages',
  
  // Image upload
  UPLOAD_IMAGE: '/upload/image',
  IMAGES: '/images',
  
  // Copilot
  COPILOT_CHAT: '/copilot/chat',
  
  // Health
  HEALTH: '/health',
};
