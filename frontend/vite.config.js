import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Captura CUALQUIER petición que empiece con /api y la manda a Spring Boot
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Mantener secure en false si no usas certificados SSL (https) en desarrollo local
        secure: false, 
      }
    }
  }
})