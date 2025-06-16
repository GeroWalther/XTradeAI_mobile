// OpenAI API Key - Replace with your actual key or use environment variable
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

console.log('OpenAI API Key configured:', OPENAI_API_KEY.startsWith('sk-'));
