import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Files with direct unit-test coverage today. Server actions,
      // route handlers, and pages are covered by integration / E2E and
      // intentionally stay outside this list so v8 doesn't dilute the
      // numbers. Expand alongside new specs in tests/unit/.
      include: [
        'components/shared/HeroSection.tsx',
        'lib/format-relative.ts',
        'lib/map-utils.ts',
        'lib/material.ts',
        'lib/points.ts',
        'lib/route-matchers.ts',
        'lib/scan-display.ts',
        'lib/sentry-helpers.ts',
        'lib/share.ts',
        'lib/timing-safe-compare.ts',
        'lib/utils.ts',
        'lib/validators/**/*.ts',
      ],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '.next/**',
        '.open-next/**',
      ],
      // Thresholds reflect the current tested baseline. Ratchet upward
      // alongside new specs — these must never loosen.
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
