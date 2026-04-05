import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',

    // Strip all console.* and debugger statements from production bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console:  true,    // removes console.log / warn / error / info
        drop_debugger: true,    // removes debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      format: {
        comments: false,        // strip all comments from output
      },
    },

    rollupOptions: {
      output: {
        // Randomise chunk file names to make reverse-engineering harder
        chunkFileNames:  'assets/[hash].js',
        entryFileNames:  'assets/[hash].js',
        assetFileNames:  'assets/[hash].[ext]',
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
          react:    ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
