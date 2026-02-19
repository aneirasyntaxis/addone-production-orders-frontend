// Core - Search Configuration
// Centralized search configuration constants

export const SEARCH_DEBOUNCE_MS = parseInt(
  process.env.EXPO_PUBLIC_SEARCH_DEBOUNCE_MS || '700',
  10
);

export const SEARCH_MIN_CHARS = parseInt(
  process.env.EXPO_PUBLIC_SEARCH_MIN_CHARS || '3',
  10
);
