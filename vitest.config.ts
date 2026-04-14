import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Simulates a browser DOM environment
    setupFiles: "./src/tests/setup.ts",
    exclude: [...configDefaults.exclude, './e2e/**'], // Exclude Playwright tests
    coverage:{
      enabled:true,
    }
  },
})