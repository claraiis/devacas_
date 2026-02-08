import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@react-pdf')) return 'react-pdf';
          if (id.includes('lucide-react')) return 'lucide';
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react')) return 'react';
          return 'vendor';
        }
      }
    }
  }
})
