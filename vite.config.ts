
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // We default to empty string if not present, preventing crash
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env': {}
    }
  };
});
