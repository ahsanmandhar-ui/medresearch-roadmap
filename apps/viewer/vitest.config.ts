import { defineConfig } from 'vitest/config';

// M6.4a — node-environment tests. The app-shell acceptance test renders the App
// with react-dom/server and reads index.html via a Vite `?raw` import, so no DOM
// (jsdom) is required for this slice. Component/DOM tests arrive in M6.4b.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
