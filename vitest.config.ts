import { configDefaults, defineConfig } from "vitest/config";
import tsconfigPath from "vite-tsconfig-paths";
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [tsconfigPath(), react()],
    test: {
        setupFiles: ['./src/testSetup.ts'],
        environment: 'happy-dom',
        exclude: [...configDefaults.exclude],
    },
});