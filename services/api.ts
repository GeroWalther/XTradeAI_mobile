import axios from 'axios';

// Hardcoded URL
const BASE_URL = 'http://51.92.33.198:5005';
console.log('Using hardcoded URL:', BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging requests
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL || BASE_URL}${config.url || ''}`;
    console.log('Making request to:', fullUrl);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and logging responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('Successful response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('Network Error - No Response:', {
        request: error.request._url,
        method: error.request._method,
        error: error.message,
      });
    } else {
      console.error('Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
