import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/typegen/**/*.test-d.ts'],
    typecheck: {
      enabled: true,
      include: ['test/typegen/**/*.test-d.ts'],
      tsconfig: './tsconfig.json',
    },
  },
})
