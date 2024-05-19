import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                'index': resolve(__dirname, 'index.html'),
                'tent-sheet': resolve(__dirname, 'tent-sheet/index.html'),
            },
        },
    },
})
