import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: /\/auth-redirect\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\/login-page\.spec\.ts$/,
    },
    {
      name: 'api-security',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\/api-security\.spec\.ts$/,
    },
    {
      name: 'authenticated',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\/(student-form|student-crud|error-boundary|weekly-plan|iep-workflow|standards-navigation)\.spec\.ts$/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 30000,
    env: {
      E2E_AUTH_BYPASS: 'true',
    },
  },
})
