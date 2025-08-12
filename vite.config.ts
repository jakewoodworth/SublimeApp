import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'service-worker': path.resolve(__dirname, 'service-worker.js'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'service-worker'
            ? '[name].js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
});
