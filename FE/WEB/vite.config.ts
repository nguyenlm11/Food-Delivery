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
        target: 'https://foodie-djkk.onrender.com', // Chuyển tiếp request local sang Render
        changeOrigin: true,
        secure: true,
      },
    },
  },
})