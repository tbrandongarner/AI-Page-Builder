import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_PORT = 3000
const PORT = Number.parseInt(process.env.VITE_PORT ?? '', 10)
const shouldOpenBrowser = (process.env.VITE_OPEN_BROWSER ?? '').toLowerCase() === 'true'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number.isFinite(PORT) ? PORT : DEFAULT_PORT,
    open: shouldOpenBrowser,
  },
})
