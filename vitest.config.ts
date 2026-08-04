import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/unit-test/**/*.test.ts'],
  },
  define: {
    DEFAULT_API_BASE_URL: JSON.stringify(
      'https://autoshopapiservice.onrender.com',
    ),
  },
})
