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
async function sendMessageSafely(message) {
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    // Extension context invalidated - this is expected when extension reloads
    // Don't log as it's not an actual error condition
    return null;
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
 * Popup UI script for Privacy Shield extension
 * Manages the extension popup interface and status display
 * @module popup
 */






/**
 * Initialize popup UI
 */
const init = async () => {
  try {
    const elements = getUIElements();
    const tab = await getCurrentTab();
    
    setupDomainInfo(elements, tab);
    await loadState(elements);
    setupEventListeners(elements);
    setupStorageListener(elements);
  } catch (error) {
    Logger.error('Failed to initialize popup', error);
  }
};

/**
 * Get all UI element references
 * @returns {Object} Object containing UI element references
 */
const getUIElements = () => {
  return {
    globalToggle: document.getElementById('globalToggle'),
    statusCard: document.getElementById('statusCard'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    hiddenCount: document.getElementById('hiddenCount'),
    currentDomain: document.getElementById('currentDomain'),
    domainStatus: document.getElementById('domainStatus'),
    expandBtn: document.getElementById('expandBtn'),
    hiddenList: document.getElementById('hiddenList'),
    blurOverlay: document.getElementById('blurOverlay'),
    revealBtn: document.getElementById('revealBtn'),
    itemsContent: document.getElementById('itemsContent'),
    openSettings: document.getElementById('openSettings')
  };
};

/**
 * Get the current active tab
 * @returns {Promise<Object>} Current tab object
 */
const getCurrentTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

/**
 * Setup domain information display
 * @param {Object} elements - UI elements
 * @param {Object} tab - Current tab
 */
const setupDomainInfo = (elements, tab) => {
  try {
    const url = new URL(tab.url);
    const tabDomain = url.hostname.replace('www.', '');

    // Set display name
    const displayName = getDomainDisplayName(tabDomain);
    elements.currentDomain.textContent = displayName;

    // Setup favicon
    setupFavicon(tab.favIconUrl);

    // Check if domain is supported
    const isSupported = isSupportedDomain(tabDomain);
    if (!isSupported) {
      elements.domainStatus.classList.add('unsupported');
      elements.domainStatus.querySelector('.domain-badge').textContent = '未対応';
    }
  } catch (error) {
    Logger.warn('Failed to setup domain info', error);
    elements.currentDomain.textContent = '不明';
    elements.domainStatus.classList.add('unsupported');
    elements.domainStatus.querySelector('.domain-badge').textContent = '不明';
  }
};

/**
 * Setup favicon display
 * @param {string} faviconUrl - Favicon URL from tab
 */
const setupFavicon = (faviconUrl) => {
  const domainIconContainer = document.querySelector('.domain-icon');
  
  if (faviconUrl) {
    domainIconContainer.innerHTML = `<img src="${faviconUrl}" alt="favicon">`;
  } else {
    domainIconContainer.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    `;
  }
};

/**
 * Load state from storage
 * @param {Object} elements - UI elements
 */
const loadState = async (elements) => {
  try {
    const isPaused = await StorageManager.getIsPaused();
    const count = await StorageManager.getHiddenCount();
    const hiddenItems = await StorageManager.getHiddenItems();

    elements.globalToggle.checked = !isPaused;
    updateStatusUI(elements, !isPaused);
    elements.hiddenCount.textContent = count || 0;

    if (hiddenItems && hiddenItems.length > 0) {
      renderHiddenItems(elements.itemsContent, hiddenItems);
    }
  } catch (error) {
    Logger.error('Failed to load state', error);
  }
};

/**
 * Update status UI based on active state
 * @param {Object} elements - UI elements
 * @param {boolean} isActive - Whether protection is active
 */
const updateStatusUI = (elements, isActive) => {
  if (isActive) {
    elements.statusCard.classList.remove('paused');
    elements.statusText.textContent = '保護中';
  } else {
    elements.statusCard.classList.add('paused');
    elements.statusText.textContent = '一時停止';
  }
};

/**
 * Render hidden items list
 * @param {HTMLElement} container - Container element
 * @param {Array<string>} items - Hidden items
 */
const renderHiddenItems = (container, items) => {
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="no-items">隠蔽されたアイテムはありません</p>';
    return;
  }

  container.innerHTML = items
    .map(item => `<div class="hidden-item">${escapeHtml(item)}</div>`)
    .join('');
};

/**
 * Setup event listeners
 * @param {Object} elements - UI elements
 */
const setupEventListeners = (elements) => {
  // Toggle protection on/off
  elements.globalToggle.addEventListener('change', async (e) => {
    const isActive = e.target.checked;
    await StorageManager.setIsPaused(!isActive);
    updateStatusUI(elements, isActive);
    
    if (!isActive) {
      chrome.action.setBadgeText({ text: '' });
    }
  });

  // Expand/collapse hidden items list
  elements.expandBtn.addEventListener('click', () => {
    const isExpanded = elements.hiddenList.classList.toggle('show');
    elements.expandBtn.classList.toggle('expanded', isExpanded);
  });

  // Reveal blurred content
  elements.revealBtn.addEventListener('click', () => {
    elements.blurOverlay.classList.add('hidden');
  });

  // Open settings page
  elements.openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
};

/**
 * Setup storage change listener
 * @param {Object} elements - UI elements
 */
const setupStorageListener = (elements) => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.hiddenCount) {
      elements.hiddenCount.textContent = changes.hiddenCount.newValue || 0;
    }

    if (changes.hiddenItems) {
      renderHiddenItems(elements.itemsContent, changes.hiddenItems.newValue || []);
    }
  });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
