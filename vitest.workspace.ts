import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';

const packages = ['charts', 'date-pickers'];

// Ideally we move the configuration to each package.
// Currently it doesn't work because vitest doesn't detect two different configurations in the same package.
// We could bypass this limitation by having a folder per configuration. Eg: `packages/x-charts/browser` & `packages/x-charts/jsdom`.

export default defineWorkspace(
  packages.flatMap(
    (name): ReturnType<typeof defineWorkspace> => [
      {
        extends: './vitest.config.mts',
        plugins: [react()],
        test: {
          include: [`packages/x-${name}/src/**/*.test.?(c|m)[jt]s?(x)`],
          exclude: [
            `packages/x-${name}/src/**/*.jsdom.test.?(c|m)[jt]s?(x)`,
            `packages/x-${name}/src/**/*V3.test.?(c|m)[jt]s?(x)`,
          ],
          name: `browser/${name}`,
          env: {
            MUI_BROWSER: 'true',
          },
          browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
            // https://playwright.dev
            providerOptions: {},
            screenshotFailures: false,
          },
        },
      },
      {
        extends: './vitest.config.mts',
        plugins: [react()],
        test: {
          include: [`packages/x-${name}/src/**/*.test.?(c|m)[jt]s?(x)`],
          exclude: [`packages/x-${name}/src/**/*.browser.test.?(c|m)[jt]s?(x)`],
          name: `jsdom/${name}`,
          environment: 'jsdom',
          env: {
            MUI_JSDOM: 'true',
          },
        },
      },
    ],
  ),
);
