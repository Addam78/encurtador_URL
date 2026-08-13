import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Em dev o Vite faz proxy para o Fastify (porta 3000), então não é preciso CORS.
// Em produção defina VITE_API_URL com a origem da API.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/url': 'http://localhost:3000',
      '/stats': 'http://localhost:3000',
    },
  },
})
