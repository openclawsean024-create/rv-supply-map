import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/rv-supply-map/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
