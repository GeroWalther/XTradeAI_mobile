// Environment variables
const SERVER_URL = 'https://ai-trading-analysis.gw-intech.com';
export const AI_SERVER_URL = SERVER_URL;

console.log('Environment URL:', process.env.EXPO_PUBLIC_AI_SERVER_URL);
console.log('Using Server URL:', SERVER_URL);

// API endpoints
export const API_ENDPOINTS = {
  marketAnalysis: '/api/advanced-market-analysis',
};
