import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
function expressPlugin() {
  return {
    name: 'express-backend-plugin',
    async configureServer(server) {
      const { app } = await import('./server/server.js')
      server.middlewares.use(app)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), expressPlugin()],
  server: {
    port: 5173,
  },
})
