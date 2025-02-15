// Get the API base URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Validate that the API URL is set
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn('Warning: NEXT_PUBLIC_API_BASE_URL is not set. Using default localhost URL.');
} 