import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": import.meta.dirname + "/src",
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://foodie-djkk.onrender.com',
        // target: 'http://localhost:8080',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})