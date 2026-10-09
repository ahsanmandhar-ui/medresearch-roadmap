import indexHtml from '../index.html?raw';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';

// M6.4a acceptance test — runs in the node vitest environment (no jsdom needed).
// The `vite build` gate is what proves dist/index.html + a JS bundle are emitted;
// this test proves the shell wiring at the source level and that <App/> renders
// the product title.
describe('App (M6.4a app shell)', () => {
  it('renders the app title', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Research Roadmap');
  });

  it('index.html wires the entry module into #root with the app title', () => {
    expect(indexHtml).toContain('id="root"');
    expect(indexHtml).toContain('/src/main.tsx');
    expect(indexHtml).toContain('<title>Research Roadmap</title>');
  });
});
