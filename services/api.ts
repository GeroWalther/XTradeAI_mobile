import axios from 'axios';
import { AI_SERVER_URL } from '../constants/env';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: AI_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token, etc.
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
