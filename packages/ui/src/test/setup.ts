import { vi } from 'vitest';

// jsdom does not implement `window.matchMedia`, which the media-query hooks
// (useMediaQuery / useBreakpoint / useReducedMotion) rely on. Provide a minimal
// mock so components using those hooks render under test. Real browsers supply
// matchMedia natively, so this only affects the test environment.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
