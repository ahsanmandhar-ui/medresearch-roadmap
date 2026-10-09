import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// M6.4a — minimal buildable Vite config for the deployable app shell.
// No workspace-package imports yet (the real graph + persistence wiring land in
// M6.4b / M6.5b), so the build has zero dependency on packages/core.
export default defineConfig({
  plugins: [react()],
});
