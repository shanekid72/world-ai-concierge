import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

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
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
          @import "@/styles/cyberpunk.scss";
        `,
      },
    },
    devSourcemap: true,
    postcss: {
      plugins: [
        postcssImport(),
        tailwindcss(),
        autoprefixer(),
        postcssPresetEnv({
          features: {
            'nesting-rules': true,
          },
        }),
      ],
    },
  },
  optimizeDeps: {
    include: ['react-toastify', 'framer-motion', '@radix-ui/react-avatar'],
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          ui: ['@radix-ui/react-avatar', 'react-toastify'],
        },
      },
    },
  },
});

