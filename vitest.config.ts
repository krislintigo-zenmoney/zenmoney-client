import { defineConfig } from 'vitest/config'

// eslint-disable-next-line import-x/no-default-export,import-x/no-anonymous-default-export
export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
