const FALLBACK_API_URL = 'https://footballapp-u80w.onrender.com';

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  FALLBACK_API_URL;
