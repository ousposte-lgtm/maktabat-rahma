import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Ensure env vars with VITE_ prefix are injected at build time
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Supabase into its own chunk for better caching
          supabase: ['@supabase/supabase-js'],
          react:    ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
