/**
 * Simple Configuration - Zero Dependencies
 * Just hardcoded values that you can easily change
 */

// Simple environment detection
const isDev = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('dev');
  }
  return false;
};

// Simple, hardcoded configuration
export const AppConfig = {
  // 🔧 EDIT THESE VALUES FOR YOUR SETUP
  API_URL: 'http://localhost:8000/api',           // Your FastAPI backend URL
  WS_URL: 'ws://localhost:8000/ws',               // WebSocket URL (future use)
  APP_VERSION: '1.0.0',                           // Your app version
  
  // Environment flags
  IS_DEVELOPMENT: isDev(),
  IS_PRODUCTION: !isDev(),
  
  // API Configuration
  API_TIMEOUT: 30000,        // 30 seconds
  RETRY_ATTEMPTS: 3,         // Retry failed requests 3 times
  RETRY_DELAY: 1000,         // Wait 1 second between retries
  
  // Cache Configuration
  CACHE_TTL: 5 * 60 * 1000,  // 5 minutes cache
  CACHE_MAX_SIZE: 50 * 1024 * 1024, // 50MB max cache
};

// Simple logging functions
export const safeLog = (message: string, data?: any): void => {
  if (AppConfig.IS_DEVELOPMENT && console) {
    console.log(`[Orders] ${message}`, data || '');
  }
};

export const safeError = (message: string, error?: any): void => {
  if (console) {
    console.error(`[Orders] ${message}`, error || '');
  }
};

export const safeWarn = (message: string, data?: any): void => {
  if (console) {
    console.warn(`[Orders] ${message}`, data || '');
  }
};

// Environment helpers
export const isDevelopment = (): boolean => AppConfig.IS_DEVELOPMENT;
export const isProduction = (): boolean => AppConfig.IS_PRODUCTION;