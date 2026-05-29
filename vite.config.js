import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Configuration Vitest
  test: {
    environment: 'node',        // tests purs JS, pas besoin de DOM
    globals: true,              // describe/it/expect disponibles sans import
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/logic/**', 'src/hooks/**'],
    },
  },
})
