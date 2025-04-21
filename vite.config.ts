import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    host: true, // Listen on all local IPs
    strictPort: false, // Allow fallback to next available port
    open: true, // Automatically open browser
    cors: true, // Enable CORS
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `,
      },
    },
    devSourcemap: true,
    postcss: './postcss.config.mjs'
  },
  optimizeDeps: {
    include: ['react-toastify'],
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: true,
  },
});

