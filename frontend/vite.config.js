import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Proxy para encaminhar chamadas de /api diretamente para o backend PHP
    proxy: {
      '/api.php': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
