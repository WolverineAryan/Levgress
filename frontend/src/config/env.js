const isProd = import.meta.env.PROD;

if (isProd && !import.meta.env.VITE_API_URL) {
  throw new Error('FATAL: VITE_API_URL environment variable is required in production mode!');
}
if (isProd && !import.meta.env.VITE_SOCKET_URL) {
  throw new Error('FATAL: VITE_SOCKET_URL environment variable is required in production mode!');
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
