import { isIE11 } from './browser';

/**
 * Does the browser display animation.
 * Always returns false for IE11 due to performance.
 */
export function hasAnimation() {
    if (isIE11) {
        return false;
    }
    // JEST Workaround
    if (!window.matchMedia) {
        return true;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return !(!mediaQuery || mediaQuery.matches);
}
