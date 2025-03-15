// Environment variables
const SERVER_URL = 'http://51.92.33.198:5005';
export const AI_SERVER_URL = SERVER_URL;

console.log('Environment URL:', process.env.EXPO_PUBLIC_AI_SERVER_URL);
console.log('Using Server URL:', SERVER_URL);

// API endpoints
export const API_ENDPOINTS = {
  marketAnalysis: '/api/advanced-market-analysis',
};
