import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: { port: 5173 },
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/engine'),
      '@game': path.resolve(__dirname, 'src/game'),
      '@render': path.resolve(__dirname, 'src/render'),
      '@ui': path.resolve(__dirname, 'src/ui'),
    },
  },
});
