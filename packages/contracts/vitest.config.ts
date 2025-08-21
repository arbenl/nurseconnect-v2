/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
    exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.emu.test.ts'
    ],
  },
});