import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Sépare les dépendances dans un chunk "vendor"
          }
          if (id.includes('lucide-react')) {
            return 'lucide-icons'; // Crée un chunk dédié pour Lucide React
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Augmente la limite des chunks à 1000 kB
  },
});
