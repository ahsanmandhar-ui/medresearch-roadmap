import { useMediaQuery } from './useMediaQuery.js';
import { breakpoints } from '../tokens.js';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointInfo {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
  isTabletOrDesktop: boolean;
}

export function useBreakpoint(): BreakpointInfo {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile})`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.desktop})`);

  const breakpoint: Breakpoint = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
}
