/**
 * Web-embed framing safety (M4.5 / AGENTS.md §5).
 *
 * A general website or GitHub Pages/static site may be embedded in an iframe
 * only after verifying that the target permits framing. Two response headers
 * govern this: `X-Frame-Options` and CSP `frame-ancestors`. Browsers enforce
 * them, but they are only visible to the party performing the verification
 * request (the authoring/master tooling), not to an in-page client — so this
 * module is the PURE decision logic that tooling unit-tests and that the viewer
 * consults to decide iframe vs. card.
 *
 * It never proxies or strips headers (AGENTS.md §4); it only interprets them.
 */

/** Outcome of evaluating whether a target may be embedded cross-origin. */
export interface FrameSafetyResult {
  /** Whether the target may be embedded in a cross-origin iframe. */
  frameable: boolean;
  /** Human-readable explanation of the decision. */
  reason: string;
  /** True when an explicit blocking directive (DENY/SAMEORIGIN/'none'/restricted origins) forced the result. */
  explicit: boolean;
}

/** Raw framing signals for a target, as observed by the verifier. */
export interface FrameabilityInput {
  /** Value of the `X-Frame-Options` response header, if present. */
  xFrameOptions?: string;
  /** Value of the `Content-Security-Policy` response header, if present. */
  contentSecurityPolicy?: string;
  /** Origin doing the embedding (e.g. `https://app.example.com`), used to evaluate ALLOW-FROM / frame-ancestors origin lists. */
  embedderOrigin?: string;
}

function defaultPort(scheme: string): string {
  return scheme === 'https' ? '443' : '80';
}

interface ParsedOrigin {
  scheme: string;
  host: string;
  port: string;
}

function parseOrigin(origin: string): ParsedOrigin | null {
  const match = /^(https?):\/\/([^/:]+)(?::(\d+))?/i.exec(origin.trim());
  if (!match) return null;
  const scheme = match[1];
  const host = match[2];
  if (!scheme || !host) return null;
  return {
    scheme: scheme.toLowerCase(),
    host: host.toLowerCase(),
    port: match[3] ?? defaultPort(scheme),
  };
}

/**
 * Parse the `frame-ancestors` directive tokens out of a CSP header value.
 *
 * Returns the effective allowance tokens for the directive (e.g.
 * `["'none'"]`, `["*"]`, or `["https://a.example", "https://b.example"]`). When
 * multiple `frame-ancestors` directives are present, their intersection is
 * returned (a source is allowed only if permitted by every directive). Returns
 * `[]` when the header is absent or contains no `frame-ancestors` directive.
 */
export function parseFrameAncestors(csp?: string): string[] {
  if (!csp) return [];

  const directives = csp
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .filter((part) => /^frame-ancestors\b/i.test(part));

  if (directives.length === 0) return [];

  const tokenLists = directives.map((directive) =>
    directive
      .replace(/^frame-ancestors\b[\t ]*/i, '')
      .trim()
      .split(/[\s,]+/)
      .filter((token) => token.length > 0),
  );

  return tokenLists.reduce((accumulator, list) =>
    accumulator.filter((token) => list.includes(token)),
  );
}

/**
 * Test whether a single `frame-ancestors`/`ALLOW-FROM` source expression matches
 * an embedder origin. Supports `*`, scheme-only (`https:`), exact
 * `scheme://host[:port]`, and wildcard-host `scheme://*.example.com`.
 *
 * Returns false for any unparsable origin or malformed directive (never throws).
 */
export function originMatchesDirective(directive: string, origin: string): boolean {
  const trimmed = directive.trim();
  if (trimmed === '') return false;

  const parsed = parseOrigin(origin);
  if (!parsed) return false;

  // `*` matches any origin.
  if (trimmed === '*') return true;

  // Scheme-only expression, e.g. `https:` — matches when the scheme is equal.
  if (/^https?:$/i.test(trimmed)) {
    return trimmed.slice(0, -1).toLowerCase() === parsed.scheme;
  }

  // Full scheme://host[:port] expression.
  const match = /^(https?):\/\/([^/:]+)(?::(\d+))?$/i.exec(trimmed);
  if (!match) return false;

  const scheme = match[1];
  const hostPart = match[2];
  if (!scheme || !hostPart) return false;
  const port = match[3] ?? null;

  if (scheme.toLowerCase() !== parsed.scheme) return false;
  if (port !== null && port !== parsed.port) return false;

  const host = hostPart.toLowerCase();
  if (host === '*') return true;
  if (host.startsWith('*.')) {
    const suffix = host.slice(2);
    return parsed.host === suffix || parsed.host.endsWith(`.${suffix}`);
  }
  return parsed.host === host;
}

/**
 * Evaluate whether a target permits embedding in a cross-origin iframe from the
 * two response headers that control it. Pure and DOM-free so the authoring
 * verifier (which fetches these headers where they are visible) can unit-test
 * its logic. Never proxies or strips headers (AGENTS.md §4) — it only
 * interprets them.
 *
 * Decision order:
 *  1. `X-Frame-Options` DENY/SAMEORIGIN → blocked cross-origin.
 *  2. `X-Frame-Options: ALLOW-FROM <uri>` → allowed only if it matches the embedder origin.
 *  3. CSP `frame-ancestors` `'none'` → blocked; `*` → allowed; a specific origin
 *     list → allowed only if the embedder origin matches (conservative when the
 *     embedder origin is unknown).
 *  4. No restriction detected → allowed (browsers permit framing by default).
 */
export function evaluateFrameability(input: FrameabilityInput = {}): FrameSafetyResult {
  const xfo = input.xFrameOptions?.trim();
  if (xfo) {
    const upper = xfo.toUpperCase();
    if (upper === 'DENY') {
      return {
        frameable: false,
        reason: 'X-Frame-Options: DENY blocks all framing',
        explicit: true,
      };
    }
    if (upper === 'SAMEORIGIN') {
      return {
        frameable: false,
        reason: 'X-Frame-Options: SAMEORIGIN blocks cross-origin framing',
        explicit: true,
      };
    }
    const allowFrom = /^ALLOW-FROM\s+(.+)$/i.exec(xfo);
    if (allowFrom) {
      const allowFromUri = allowFrom[1];
      if (
        allowFromUri &&
        input.embedderOrigin &&
        originMatchesDirective(allowFromUri, input.embedderOrigin)
      ) {
        return {
          frameable: true,
          reason: `X-Frame-Options: ALLOW-FROM matches ${input.embedderOrigin}`,
          explicit: true,
        };
      }
      return {
        frameable: false,
        reason: 'X-Frame-Options: ALLOW-FROM does not match the embedder origin',
        explicit: true,
      };
    }
    // Unrecognised X-Frame-Options value — ignore and fall through to CSP.
  }

  const ancestors = parseFrameAncestors(input.contentSecurityPolicy);
  if (ancestors.length > 0) {
    if (ancestors.includes("'none'")) {
      return {
        frameable: false,
        reason: "CSP frame-ancestors 'none' blocks all framing",
        explicit: true,
      };
    }
    if (ancestors.includes('*')) {
      return {
        frameable: true,
        reason: 'CSP frame-ancestors allows any origin',
        explicit: true,
      };
    }
    const embedderOrigin = input.embedderOrigin;
    if (
      embedderOrigin &&
      ancestors.some((token) => originMatchesDirective(token, embedderOrigin))
    ) {
      return {
        frameable: true,
        reason: `CSP frame-ancestors allows ${input.embedderOrigin}`,
        explicit: true,
      };
    }
    return {
      frameable: false,
      reason: 'CSP frame-ancestors restricts framing to origins not matched',
      explicit: true,
    };
  }

  return {
    frameable: true,
    reason: 'No X-Frame-Options or frame-ancestors restriction detected',
    explicit: false,
  };
}
