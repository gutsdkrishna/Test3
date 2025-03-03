import axios from 'axios';
import { Platform } from 'react-native';

// Use different base URLs for development and production
// Also handle iOS simulator vs Android emulator differences
let BASE_URL = 'https://your-production-api.com';

if (__DEV__) {
  if (Platform.OS === 'android') {
    BASE_URL = 'http://10.0.2.2:5001'; // Android Emulator to localhost
  } else {
    BASE_URL = 'http://localhost:5001'; // iOS Simulator to localhost
  }
}

// Create axios instance with proper error handling
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Error handling helper
const handleAPIError = (error: any) => {
  // Extract the relevant error information
  const errorMessage = error?.response?.data?.message || error.message || 'Unknown error';
  const statusCode = error?.response?.status;
  
  // Log for debugging
  console.error(`API Error (${statusCode}): ${errorMessage}`);
  
  // Return a formatted error object
  return {
    error: true,
    statusCode,
    message: errorMessage,
    originalError: error
  };
};

// API service functions with built-in error handling
export const ApiService = {
  // Device optimization
  getDeviceStats: async () => {
    try {
      const response = await apiClient.get('/api/device-stats');
      return { error: false, data: response.data };
    } catch (error) {
      return handleAPIError(error);
    }
  },
  
  getBackgroundApps: async () => {
    try {
      const response = await apiClient.get('/api/background-apps');
      return { error: false, data: response.data };
    } catch (error) {
      return handleAPIError(error);
    }
  },
  
  runOptimization: async () => {
    try {
      const response = await apiClient.post('/api/optimize');
      return { error: false, data: response.data };
    } catch (error) {
      return handleAPIError(error);
    }
  },
  
  // Courses
  getCourses: async () => {
    try {
      const response = await apiClient.get('/api/courses');
      return { error: false, data: response.data };
    } catch (error) {
      return handleAPIError(error);
    }
  },
  
  // User settings
  toggleAI: async (enabled: boolean) => {
    try {
      const response = await apiClient.post('/api/toggle-ai-optimization', { enabled });
      return { error: false, data: response.data };
    } catch (error) {
      return handleAPIError(error);
    }
  }
};
