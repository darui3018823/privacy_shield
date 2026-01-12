/**
 * Domain configuration for the Privacy Shield extension
 * @module config
 */

/**
 * Supported domains configuration
 * Each domain entry contains matching patterns, selectors, and settings
 * @constant {Object}
 */
export const SUPPORTED_DOMAINS = {
  google: {
    name: 'Google Search',
    matches: ['www.google.com', 'www.google.co.jp'],
    enabled: true,
    selectors: ['.O4T6Pe', '.vqkKIe', '.eKPi4', 'update-location', '.dfB0uf']
  },
  gemini: {
    name: 'Google Gemini',
    matches: ['gemini.google.com'],
    enabled: true,
    selectors: ['location-footer', '.location-menu-item-container']
  },
  amazon: {
    name: 'Amazon.co.jp',
    matches: ['www.amazon.co.jp'],
    enabled: true,
    selectors: [
      '#nav-global-location-popover-link',
      '#glow-ingress-block',
      '[data-component="shippingAddress"]'
    ]
  }
};

/**
 * Domain display name mappings for friendly names
 * @constant {Object}
 */
export const DOMAIN_DISPLAY_NAMES = {
  'gemini.google.com': 'Google Gemini',
  'google.com': 'Google Search',
  'google.co.jp': 'Google Search',
  'amazon.co.jp': 'Amazon.co.jp'
};

/**
 * List of supported domain patterns for quick checks
 * @constant {Array<string>}
 */
export const SUPPORTED_DOMAIN_PATTERNS = Object.values(SUPPORTED_DOMAINS).flatMap(d => d.matches);

/**
 * Get the display name for a given domain
 * @param {string} domain - The domain hostname
 * @returns {string} The friendly display name or the original domain
 */
export function getDomainDisplayName(domain) {
  for (const [key, value] of Object.entries(DOMAIN_DISPLAY_NAMES)) {
    if (domain.includes(key)) {
      return value;
    }
  }
  return domain;
}

/**
 * Check if a domain is supported
 * @param {string} domain - The domain hostname
 * @returns {boolean} True if the domain is supported
 */
export function isSupportedDomain(domain) {
  return SUPPORTED_DOMAIN_PATTERNS.some(pattern => domain.includes(pattern));
}
