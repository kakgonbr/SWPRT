import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            // Proxy API calls to your ASP.NET backend
            '/api': {
                target: 'https://localhost:7001', // Your ASP.NET API URL
                changeOrigin: true,
                secure: false, // For development with self-signed certificates
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
})
