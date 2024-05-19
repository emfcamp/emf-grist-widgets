import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                'tent-sheet': resolve(__dirname, 'tent-sheet/index.html'),
            },
        },
    },
})
