import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
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
    };
});
