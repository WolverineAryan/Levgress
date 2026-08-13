import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (mode === 'production') {
    if (!env.VITE_API_URL) {
      throw new Error('FATAL BUILD ERROR: VITE_API_URL environment variable is required for production builds!');
    }
    if (!env.VITE_SOCKET_URL) {
      throw new Error('FATAL BUILD ERROR: VITE_SOCKET_URL environment variable is required for production builds!');
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
