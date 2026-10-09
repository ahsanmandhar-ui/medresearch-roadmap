import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// M6.4a — Vite entry. Mounts the app shell into the #root element declared in
// index.html. The `if (container)` guard satisfies strict null checks.
const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
