// Core - Constants
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://localhost:7023/api',
  TIMEOUT: 30000,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth:token',
  USER_DATA: '@auth:user',
} as const;

export const ROUTES = {
  LOGIN: 'Login',
  HOME: 'Home',
} as const;
