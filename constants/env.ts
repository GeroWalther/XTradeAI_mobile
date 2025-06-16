// OpenAI API Key - Replace with your actual key or use environment variable
export const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

console.log('OpenAI API Key configured:', OPENAI_API_KEY.startsWith('sk-'));
