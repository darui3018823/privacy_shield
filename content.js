// Auto-generated bundle - DO NOT EDIT DIRECTLY
// Edit source files in src/ directory and run: node build/bundle.js

/**
 * Constants and configuration values for the Privacy Shield extension
 * @module constants
 */

/**
 * Default badge color for the extension icon
 * @constant {string}
 */
const BADGE_COLOR = '#6366f1';

/**
 * Maximum text length to consider for hiding (characters)
 * @constant {number}
 */
const MAX_TEXT_LENGTH_SMALL = 100;

/**
 * Maximum text length for parent element (characters)
 * @constant {number}
 */
const MAX_TEXT_LENGTH_LARGE = 200;

/**
 * Maximum preview text length for hidden items (characters)
 * @constant {number}
 */
const PREVIEW_TEXT_LENGTH = 50;

/**
 * Debounce delay for saving hidden items (milliseconds)
 * @constant {number}
 */
const SAVE_DEBOUNCE_DELAY = 500;

/**
 * Toast display duration (milliseconds)
 * @constant {number}
 */
const TOAST_DURATION = 3000;

/**
 * Toast animation duration (milliseconds)
 * @constant {number}
 */
const TOAST_ANIMATION_DURATION = 300;

/**
 * Default user rules structure
 * @constant {Object}
 */
const DEFAULT_USER_RULES = {
  keywords: [],
  patterns: []
};

/**
 * Storage keys used by the extension
 * @constant {Object}
 */
const STORAGE_KEYS = {
  IS_PAUSED: 'isPaused',
  HIDDEN_COUNT: 'hiddenCount',
  HIDDEN_ITEMS: 'hiddenItems',
  USER_RULES: 'userRules',
  DOMAIN_RULES: 'domainRules'
};

/**
 * Message types for chrome.runtime messaging
 * @constant {Object}
 */
const MESSAGE_TYPES = {
  UPDATE_COUNT: 'UPDATE_COUNT',
  GET_RULES: 'GET_RULES',
  SAVE_RULES: 'SAVE_RULES'
};

/**
 * Configuration version for import/export
 * @constant {string}
 */
const CONFIG_VERSION = '1.0';

/**
 * Logger utility for unified error handling and logging
 * @module logger
 */

/**
 * Log levels
 * @enum {string}
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Extension name prefix for log messages
 * @constant {string}
 */
const LOG_PREFIX = '[Privacy Shield]';

/**
 * Logger class for unified logging across the extension
 */
class Logger {
  /**
   * Log an error message
   * @param {string} message - The error message
   * @param {Error|any} [error] - Optional error object or additional data
   */
  static error(message, error = null) {
    console.error(`${LOG_PREFIX} ${message}`, error || '');
  }

  /**
   * Log a warning message
   * @param {string} message - The warning message
   * @param {any} [data] - Optional additional data
   */
  static warn(message, data = null) {
    console.warn(`${LOG_PREFIX} ${message}`, data || '');
  }

  /**
   * Log an info message
   * @param {string} message - The info message
   * @param {any} [data] - Optional additional data
   */
  static info(message, data = null) {
    console.info(`${LOG_PREFIX} ${message}`, data || '');
  }

  /**
   * Log a debug message
   * @param {string} message - The debug message
   * @param {any} [data] - Optional additional data
   */
  static debug(message, data = null) {
    console.debug(`${LOG_PREFIX} ${message}`, data || '');
  }

  /**
   * Log a message with a specific level
   * @param {string} level - The log level
   * @param {string} message - The message
   * @param {any} [data] - Optional additional data
   */
  static log(level, message, data = null) {
    const logMethod = console[level.toLowerCase()] || console.log;
    logMethod.call(console, `${LOG_PREFIX} [${level}] ${message}`, data || '');
  }
}



/**
 * Storage Manager for unified storage operations
 * @module storage
 */




/**
 * StorageManager class for handling chrome.storage operations
 */
class StorageManager {
  /**
   * Get a value from storage
   * @param {string|string[]} keys - Storage key(s) to retrieve
   * @returns {Promise<Object>} The stored values
   */
  static async get(keys) {
    try {
      return await chrome.storage.local.get(keys);
    } catch (error) {
      Logger.error('Failed to get from storage', error);
      return {};
    }
  }

  /**
   * Set values in storage
   * @param {Object} items - Key-value pairs to store
   * @returns {Promise<boolean>} True if successful
   */
  static async set(items) {
    try {
      await chrome.storage.local.set(items);
      return true;
    } catch (error) {
      Logger.error('Failed to set storage', error);
      return false;
    }
  }

  /**
   * Remove keys from storage
   * @param {string|string[]} keys - Key(s) to remove
   * @returns {Promise<boolean>} True if successful
   */
  static async remove(keys) {
    try {
      await chrome.storage.local.remove(keys);
      return true;
    } catch (error) {
      Logger.error('Failed to remove from storage', error);
      return false;
    }
  }

  /**
   * Get the paused state
   * @returns {Promise<boolean>} True if paused
   */
  static async getIsPaused() {
    const result = await this.get(STORAGE_KEYS.IS_PAUSED);
    return result[STORAGE_KEYS.IS_PAUSED] || false;
  }

  /**
   * Set the paused state
   * @param {boolean} isPaused - The paused state
   * @returns {Promise<boolean>} True if successful
   */
  static async setIsPaused(isPaused) {
    return await this.set({ [STORAGE_KEYS.IS_PAUSED]: isPaused });
  }

  /**
   * Get user rules
   * @returns {Promise<Object>} The user rules
   */
  static async getUserRules() {
    const result = await this.get(STORAGE_KEYS.USER_RULES);
    return result[STORAGE_KEYS.USER_RULES] || DEFAULT_USER_RULES;
  }

  /**
   * Set user rules
   * @param {Object} userRules - The user rules to save
   * @returns {Promise<boolean>} True if successful
   */
  static async setUserRules(userRules) {
    return await this.set({ [STORAGE_KEYS.USER_RULES]: userRules });
  }

  /**
   * Get domain rules
   * @returns {Promise<Object|null>} The domain rules or null
   */
  static async getDomainRules() {
    const result = await this.get(STORAGE_KEYS.DOMAIN_RULES);
    return result[STORAGE_KEYS.DOMAIN_RULES] || null;
  }

  /**
   * Set domain rules
   * @param {Object} domainRules - The domain rules to save
   * @returns {Promise<boolean>} True if successful
   */
  static async setDomainRules(domainRules) {
    return await this.set({ [STORAGE_KEYS.DOMAIN_RULES]: domainRules });
  }

  /**
   * Get hidden count
   * @returns {Promise<number>} The number of hidden items
   */
  static async getHiddenCount() {
    const result = await this.get(STORAGE_KEYS.HIDDEN_COUNT);
    return result[STORAGE_KEYS.HIDDEN_COUNT] || 0;
  }

  /**
   * Set hidden count and items
   * @param {number} count - The count of hidden items
   * @param {Array<string>} items - The hidden items
   * @returns {Promise<boolean>} True if successful
   */
  static async setHiddenData(count, items) {
    return await this.set({
      [STORAGE_KEYS.HIDDEN_COUNT]: count,
      [STORAGE_KEYS.HIDDEN_ITEMS]: items
    });
  }

  /**
   * Get hidden items
   * @returns {Promise<Array<string>>} The hidden items
   */
  static async getHiddenItems() {
    const result = await this.get(STORAGE_KEYS.HIDDEN_ITEMS);
    return result[STORAGE_KEYS.HIDDEN_ITEMS] || [];
  }

  /**
   * Initialize storage with default values if not set
   * @returns {Promise<boolean>} True if successful
   */
  static async initialize() {
    try {
      const result = await this.get(STORAGE_KEYS.USER_RULES);
      if (!result[STORAGE_KEYS.USER_RULES]) {
        await this.set({
          [STORAGE_KEYS.USER_RULES]: DEFAULT_USER_RULES,
          [STORAGE_KEYS.IS_PAUSED]: false
        });
      }
      return true;
    } catch (error) {
      Logger.error('Failed to initialize storage', error);
      return false;
    }
  }
}

/**
 * Domain configuration for the Privacy Shield extension
 * @module config
 */

/**
 * Supported domains configuration
 * Each domain entry contains matching patterns, selectors, and settings
 * @constant {Object}
 */
const SUPPORTED_DOMAINS = {
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
    selectors: ['#nav-global-location-popover-link', '#glow-ingress-block']
  }
};

/**
 * Domain display name mappings for friendly names
 * @constant {Object}
 */
const DOMAIN_DISPLAY_NAMES = {
  'gemini.google.com': 'Google Gemini',
  'google.com': 'Google Search',
  'google.co.jp': 'Google Search',
  'amazon.co.jp': 'Amazon.co.jp'
};

/**
 * List of supported domain patterns for quick checks
 * @constant {Array<string>}
 */
const SUPPORTED_DOMAIN_PATTERNS = [
  'google.com',
  'google.co.jp',
  'gemini.google.com',
  'amazon.co.jp'
];

/**
 * Get the display name for a given domain
 * @param {string} domain - The domain hostname
 * @returns {string} The friendly display name or the original domain
 */
function getDomainDisplayName(domain) {
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
function isSupportedDomain(domain) {
  return SUPPORTED_DOMAIN_PATTERNS.some(pattern => domain.includes(pattern));
}

/**
 * Rules Manager for handling domain rules and filtering logic
 * @module rules
 */





/**
 * RulesManager class for managing and processing rules
 */
class RulesManager {
  /**
   * Load domain rules for the current hostname
   * @param {string} hostname - The current page hostname
   * @returns {Promise<Object|null>} The domain rules or null if not found
   */
  static async loadDomainRules(hostname) {
    try {
      // First try to get custom domain rules from storage
      const storedRules = await StorageManager.getDomainRules();
      
      if (storedRules) {
        for (const [key, domain] of Object.entries(storedRules)) {
          if (domain.matches && domain.matches.some(m => hostname.includes(m))) {
            return domain;
          }
        }
      }

      // Fall back to default rules from rules.json
      try {
        const defaultRules = await fetch(chrome.runtime.getURL('rules.json')).then(r => r.json());
        for (const [key, domain] of Object.entries(defaultRules.domains)) {
          if (domain.matches && domain.matches.some(m => hostname.includes(m))) {
            return domain;
          }
        }
      } catch (fetchError) {
        Logger.warn('Failed to fetch default rules, using built-in config', fetchError);
      }

      // Finally, fall back to built-in configuration
      for (const [key, domain] of Object.entries(SUPPORTED_DOMAINS)) {
        if (domain.matches && domain.matches.some(m => hostname.includes(m))) {
          return domain;
        }
      }

      return null;
    } catch (error) {
      Logger.error('Failed to load domain rules', error);
      return null;
    }
  }

  /**
   * Validate a regular expression pattern
   * @param {string} pattern - The regex pattern to validate
   * @returns {boolean} True if valid
   */
  static isValidPattern(pattern) {
    try {
      new RegExp(pattern);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Compile patterns into RegExp objects
   * @param {Array<string>} patterns - Array of pattern strings
   * @returns {Array<RegExp>} Array of compiled RegExp objects
   */
  static compilePatterns(patterns) {
    if (!patterns || patterns.length === 0) {
      return [];
    }

    return patterns
      .map(p => {
        try {
          return new RegExp(p, 'g');
        } catch (error) {
          Logger.warn(`Invalid pattern: ${p}`, error);
          return null;
        }
      })
      .filter(Boolean);
  }

  /**
   * Test if a pattern matches text
   * @param {string} pattern - The pattern to test
   * @param {string} text - The text to test against
   * @returns {Array<string>|null} Array of matches or null if invalid/no match
   */
  static testPattern(pattern, text) {
    try {
      const regex = new RegExp(pattern, 'g');
      return text.match(regex);
    } catch (error) {
      Logger.warn('Pattern test failed', error);
      return null;
    }
  }

  /**
   * Check if a domain is enabled in rules
   * @param {Object} domainRules - The domain rules object
   * @returns {boolean} True if enabled (default true if not specified)
   */
  static isDomainEnabled(domainRules) {
    return domainRules && domainRules.enabled !== false;
  }

  /**
   * Get all user rules (keywords and patterns)
   * @returns {Promise<Object>} User rules object with keywords and patterns arrays
   */
  static async getUserRules() {
    return await StorageManager.getUserRules();
  }

  /**
   * Save user rules
   * @param {Object} userRules - User rules object
   * @returns {Promise<boolean>} True if successful
   */
  static async saveUserRules(userRules) {
    return await StorageManager.setUserRules(userRules);
  }

  /**
   * Save domain rules
   * @param {Object} domainRules - Domain rules object
   * @returns {Promise<boolean>} True if successful
   */
  static async saveDomainRules(domainRules) {
    return await StorageManager.setDomainRules(domainRules);
  }
}

/**
 * Helper utility functions
 * @module helpers
 */



/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=PREVIEW_TEXT_LENGTH] - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = PREVIEW_TEXT_LENGTH) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength);
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Format a date as ISO string for export filenames
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDateForFilename(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Create an export data object with version and timestamp
 * @param {Object} userRules - User rules
 * @param {Object} domainRules - Domain rules
 * @param {string} version - Config version
 * @returns {Object} Export data object
 */
function createExportData(userRules, domainRules, version) {
  return {
    version,
    exportedAt: new Date().toISOString(),
    userRules,
    domainRules
  };
}

/**
 * Parse imported data and validate structure
 * @param {string} jsonText - JSON text to parse
 * @returns {Object|null} Parsed data or null if invalid
 */
function parseImportData(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    // Basic validation
    if (typeof data !== 'object') {
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Find the target element to hide by traversing up the DOM tree
 * @param {Node} node - Starting text node
 * @param {number} maxSmall - Max text length for small element
 * @param {number} maxLarge - Max text length for parent element
 * @returns {HTMLElement|null} Target element to hide or null
 */
function findTargetElement(node, maxSmall, maxLarge) {
  let target = node.parentElement;
  if (!target) return null;

  while (target && target.innerText && target.innerText.length < maxSmall) {
    if (target.parentElement && target.parentElement.innerText.length < maxLarge) {
      target = target.parentElement;
    } else {
      break;
    }
  }

  return target;
}

/**
 * Check if element is already hidden
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if hidden
 */
function isElementHidden(element) {
  return element.style.display === 'none' || element.hasAttribute('data-privacy-hidden');
}

/**
 * Wait for DOM to be ready
 * @returns {Promise<void>} Resolves when DOM is ready
 */
function waitForDOMReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
}

/**
 * Send a message to the background script safely
 * @param {Object} message - Message to send
 * @returns {Promise<any>} Response or null if failed
 */
export async function sendMessageSafely(message) {
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    // Extension context invalidated or other error
    return null;
  }
}


/**
 * Content script for Privacy Shield extension
 * Handles detection and hiding of privacy-sensitive content on web pages
 * @module content
 */







(() => {
  'use strict';

  // State variables
  let isPaused = false;
  let hiddenItemsSet = new Set();
  let updateTimeout = null;
  let toastShown = false;
  let currentDomainRules = null;
  let userRules = null;

  /**
   * Initialize the content script
   */
  const init = async () => {
    try {
      await loadState();
      await loadDomainRules();
      updateBodyClass();
      
      if (!isPaused) {
        runHidingLogic();
      }

      setupStorageListener();
      setupMutationObserver();
    } catch (error) {
      Logger.error('Failed to initialize content script', error);
    }
  };

  /**
   * Load initial state from storage
   */
  const loadState = async () => {
    try {
      isPaused = await StorageManager.getIsPaused();
      userRules = await StorageManager.getUserRules();
    } catch (error) {
      Logger.error('Failed to load state', error);
    }
  };

  /**
   * Load domain-specific rules for the current page
   */
  const loadDomainRules = async () => {
    try {
      const hostname = window.location.hostname;
      currentDomainRules = await RulesManager.loadDomainRules(hostname);
    } catch (error) {
      Logger.error('Failed to load domain rules', error);
    }
  };

  /**
   * Setup listener for storage changes
   */
  const setupStorageListener = () => {
    chrome.storage.onChanged.addListener(handleStorageChange);
  };

  /**
   * Setup mutation observer to watch for DOM changes
   */
  const setupMutationObserver = () => {
    const observer = new MutationObserver(() => {
      if (!isPaused) {
        runHidingLogic();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  /**
   * Handle storage change events
   * @param {Object} changes - Changed storage items
   * @param {string} area - Storage area name
   */
  const handleStorageChange = (changes, area) => {
    if (area !== 'local') return;

    if (changes.isPaused) {
      isPaused = changes.isPaused.newValue;
      updateBodyClass();
      if (isPaused) {
        unhideAll();
        updateBadge(0);
      } else {
        runHidingLogic();
      }
    }

    if (changes.userRules) {
      userRules = changes.userRules.newValue || { keywords: [], patterns: [] };
      if (!isPaused) {
        runHidingLogic();
      }
    }

    if (changes.domainRules) {
      loadDomainRules().then(() => {
        if (!isPaused) {
          runHidingLogic();
        }
      });
    }
  };

  /**
   * Update body class based on paused state
   */
  const updateBodyClass = () => {
    if (isPaused) {
      document.body.classList.add('privacy-guard-paused');
    } else {
      document.body.classList.remove('privacy-guard-paused');
    }
  };

  /**
   * Unhide all previously hidden elements
   */
  const unhideAll = () => {
    document.querySelectorAll('[data-privacy-hidden]').forEach(el => {
      el.style.display = '';
      el.removeAttribute('data-privacy-hidden');
    });
  };

  /**
   * Update badge count in the extension icon
   * @param {number} count - Number of hidden items
   */
  const updateBadge = (count) => {
    sendMessageSafely({ type: MESSAGE_TYPES.UPDATE_COUNT, count });
  };

  /**
   * Save hidden items to storage
   */
  const saveHiddenItems = async () => {
    try {
      await StorageManager.setHiddenData(hiddenItemsSet.size, Array.from(hiddenItemsSet));
      updateBadge(hiddenItemsSet.size);
    } catch (error) {
      Logger.error('Failed to save hidden items', error);
    }
  };

  /**
   * Hide an element and track it
   * @param {HTMLElement} el - Element to hide
   * @param {string} reason - Reason for hiding
   * @returns {boolean} True if element was newly hidden
   */
  const hideElement = (el, reason) => {
    if (isElementHidden(el)) return false;

    el.style.display = 'none';
    el.setAttribute('data-privacy-hidden', 'true');

    const itemText = truncateText(el.innerText) || reason || 'Hidden Item';
    if (!hiddenItemsSet.has(itemText)) {
      hiddenItemsSet.add(itemText);
      return true;
    }
    return false;
  };

  /**
   * Hide elements matching CSS selectors
   * @param {Array<string>} selectors - CSS selectors to match
   * @returns {boolean} True if any elements were hidden
   */
  const hideBySelectors = (selectors) => {
    let changed = false;
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          const target = el.closest('[role="contentinfo"]') || el;
          if (hideElement(target, `Selector: ${selector}`)) {
            changed = true;
          }
        });
      } catch (error) {
        Logger.warn(`Invalid selector: ${selector}`, error);
      }
    });
    return changed;
  };

  /**
   * Hide elements containing specific keywords
   * @param {Array<string>} keywords - Keywords to search for
   * @returns {boolean} True if any elements were hidden
   */
  const hideByKeywords = (keywords) => {
    if (!keywords || keywords.length === 0) return false;

    let changed = false;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodesToHide = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent;

      for (const keyword of keywords) {
        if (text && text.includes(keyword)) {
          const target = findTargetElement(node, MAX_TEXT_LENGTH_SMALL, MAX_TEXT_LENGTH_LARGE);
          if (target && !target.hasAttribute('data-privacy-hidden')) {
            nodesToHide.push({ el: target, keyword });
          }
          break;
        }
      }
    }

    nodesToHide.forEach(({ el, keyword }) => {
      if (hideElement(el, `Keyword: ${keyword}`)) {
        changed = true;
      }
    });

    return changed;
  };

  /**
   * Hide elements matching regex patterns
   * @param {Array<string>} patterns - Regex patterns to match
   * @returns {boolean} True if any elements were hidden
   */
  const hideByPatterns = (patterns) => {
    if (!patterns || patterns.length === 0) return false;

    const regexes = RulesManager.compilePatterns(patterns);
    if (regexes.length === 0) return false;

    let changed = false;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodesToHide = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent;

      for (const regex of regexes) {
        if (text && regex.test(text)) {
          const target = findTargetElement(node, MAX_TEXT_LENGTH_SMALL, MAX_TEXT_LENGTH_LARGE);
          if (target && !target.hasAttribute('data-privacy-hidden')) {
            nodesToHide.push({ el: target, pattern: regex.source });
          }
          break;
        }
      }
    }

    nodesToHide.forEach(({ el, pattern }) => {
      if (hideElement(el, `Pattern: ${pattern}`)) {
        changed = true;
      }
    });

    return changed;
  };

  /**
   * Show toast notification
   */
  const showToast = () => {
    if (toastShown) return;
    toastShown = true;

    const toast = document.createElement('div');
    toast.id = 'privacy-guard-toast';
    toast.innerHTML = `
      <div class="pg-toast-content">
        <svg class="pg-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>プライバシーを保護しました</span>
      </div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('pg-toast-show');
    });
    
    setTimeout(() => {
      toast.classList.remove('pg-toast-show');
      toast.classList.add('pg-toast-hide');
      setTimeout(() => toast.remove(), TOAST_ANIMATION_DURATION);
    }, TOAST_DURATION);
  };

  /**
   * Run the main hiding logic
   */
  const runHidingLogic = () => {
    if (isPaused || !currentDomainRules) return;
    if (!RulesManager.isDomainEnabled(currentDomainRules)) return;

    let changed = false;

    if (currentDomainRules.selectors) {
      if (hideBySelectors(currentDomainRules.selectors)) {
        changed = true;
      }
    }

    if (userRules && userRules.keywords) {
      if (hideByKeywords(userRules.keywords)) {
        changed = true;
      }
    }

    if (userRules && userRules.patterns) {
      if (hideByPatterns(userRules.patterns)) {
        changed = true;
      }
    }

    if (changed) {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(saveHiddenItems, SAVE_DEBOUNCE_DELAY);
      showToast();
    }
  };

  // Initialize when DOM is ready
  waitForDOMReady().then(init);
})();
