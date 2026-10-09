import { describe, it, expect } from 'vitest';
import {
  parseFrameAncestors,
  originMatchesDirective,
  evaluateFrameability,
} from './frameSafety.js';

describe('parseFrameAncestors', () => {
  it('returns [] when no CSP is provided', () => {
    expect(parseFrameAncestors()).toEqual([]);
    expect(parseFrameAncestors('')).toEqual([]);
  });

  it('returns [] when CSP has no frame-ancestors directive', () => {
    expect(parseFrameAncestors("default-src 'self'; img-src *")).toEqual([]);
  });

  it("extracts the 'none' token", () => {
    expect(parseFrameAncestors("frame-ancestors 'none'")).toEqual(["'none'"]);
  });

  it('extracts a wildcard token', () => {
    expect(parseFrameAncestors('frame-ancestors *')).toEqual(['*']);
  });

  it('extracts multiple space-separated origins', () => {
    expect(
      parseFrameAncestors('frame-ancestors https://a.example https://b.example'),
    ).toEqual(['https://a.example', 'https://b.example']);
  });

  it('intersects multiple frame-ancestors directives', () => {
    const csp =
      'frame-ancestors https://a.example https://b.example; frame-ancestors https://b.example https://c.example';
    expect(parseFrameAncestors(csp)).toEqual(['https://b.example']);
  });

  it('ignores unrelated directives but keeps frame-ancestors', () => {
    const csp = "default-src 'self'; frame-ancestors https://only.example";
    expect(parseFrameAncestors(csp)).toEqual(['https://only.example']);
  });
});

describe('originMatchesDirective', () => {
  const origin = 'https://app.example.com';

  it('matches a wildcard', () => {
    expect(originMatchesDirective('*', origin)).toBe(true);
  });

  it('matches a scheme-only expression of the same scheme', () => {
    expect(originMatchesDirective('https:', origin)).toBe(true);
    expect(originMatchesDirective('http:', origin)).toBe(false);
  });

  it('matches an exact origin, ignoring default port', () => {
    expect(originMatchesDirective('https://app.example.com', origin)).toBe(true);
    expect(originMatchesDirective('https://app.example.com:443', origin)).toBe(true);
    expect(originMatchesDirective('https://other.example.com', origin)).toBe(false);
  });

  it('matches a wildcard-host suffix', () => {
    expect(originMatchesDirective('https://*.example.com', origin)).toBe(true);
    expect(originMatchesDirective('https://*.example.com', 'https://example.com')).toBe(
      true,
    );
    expect(originMatchesDirective('https://*.example.com', 'https://evil.org')).toBe(false);
  });

  it('respects an explicit non-default port', () => {
    expect(originMatchesDirective('https://app.example.com:8443', origin)).toBe(false);
  });

  it('returns false for an unparsable origin', () => {
    expect(originMatchesDirective('*', 'not a url')).toBe(false);
  });
});

describe('evaluateFrameability', () => {
  it('blocks on X-Frame-Options DENY', () => {
    const result = evaluateFrameability({ xFrameOptions: 'DENY' });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('blocks cross-origin on X-Frame-Options SAMEORIGIN', () => {
    const result = evaluateFrameability({ xFrameOptions: 'SAMEORIGIN' });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('allows ALLOW-FROM when it matches the embedder origin', () => {
    const result = evaluateFrameability({
      xFrameOptions: 'ALLOW-FROM https://app.example.com',
      embedderOrigin: 'https://app.example.com',
    });
    expect(result.frameable).toBe(true);
    expect(result.explicit).toBe(true);
  });

  it('blocks ALLOW-FROM when it does not match the embedder origin', () => {
    const result = evaluateFrameability({
      xFrameOptions: 'ALLOW-FROM https://app.example.com',
      embedderOrigin: 'https://evil.example.com',
    });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('blocks ALLOW-FROM conservatively when embedder origin is unknown', () => {
    const result = evaluateFrameability({
      xFrameOptions: 'ALLOW-FROM https://app.example.com',
    });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it("blocks on CSP frame-ancestors 'none'", () => {
    const result = evaluateFrameability({
      contentSecurityPolicy: "default-src 'self'; frame-ancestors 'none'",
    });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('allows on CSP frame-ancestors *', () => {
    const result = evaluateFrameability({ contentSecurityPolicy: 'frame-ancestors *' });
    expect(result.frameable).toBe(true);
    expect(result.explicit).toBe(true);
  });

  it('allows a specific CSP origin list when the embedder matches', () => {
    const result = evaluateFrameability({
      contentSecurityPolicy: 'frame-ancestors https://app.example.com',
      embedderOrigin: 'https://app.example.com',
    });
    expect(result.frameable).toBe(true);
    expect(result.explicit).toBe(true);
  });

  it('blocks a specific CSP origin list when the embedder does not match', () => {
    const result = evaluateFrameability({
      contentSecurityPolicy: 'frame-ancestors https://app.example.com',
      embedderOrigin: 'https://evil.example.com',
    });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('blocks a specific CSP origin list conservatively when embedder unknown', () => {
    const result = evaluateFrameability({
      contentSecurityPolicy: 'frame-ancestors https://app.example.com',
    });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('allows by default when no framing headers are present', () => {
    const result = evaluateFrameability({});
    expect(result.frameable).toBe(true);
    expect(result.explicit).toBe(false);
  });

  it('lets CSP block even when X-Frame-Options is unrecognised', () => {
    const result = evaluateFrameability({
      xFrameOptions: 'ALLOWALL',
      contentSecurityPolicy: "frame-ancestors 'none'",
    });
    expect(result.frameable).toBe(false);
    expect(result.explicit).toBe(true);
  });

  it('never throws on malformed input', () => {
    expect(() =>
      evaluateFrameability({ xFrameOptions: '@@@', contentSecurityPolicy: ';;;' }),
    ).not.toThrow();
  });
});
