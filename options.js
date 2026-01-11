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
 * Options page script for Privacy Shield extension
 * Manages settings, rules, and configuration interface
 * @module options
 */








// State variables
let userRules = { keywords: [], patterns: [] };
let domainRules = {};

/**
 * Initialize the options page
 */
const init = async () => {
  try {
    await loadRules();
    renderAll();
    setupNavigation();
    setupKeywordHandlers();
    setupPatternHandlers();
    setupDomainHandlers();
    setupImportExport();
  } catch (error) {
    Logger.error('Failed to initialize options page', error);
  }
};

/**
 * Load rules from storage
 */
const loadRules = async () => {
  try {
    userRules = await StorageManager.getUserRules();
    domainRules = (await StorageManager.getDomainRules()) || SUPPORTED_DOMAINS;
  } catch (error) {
    Logger.error('Failed to load rules', error);
  }
};

/**
 * Render all UI sections
 */
const renderAll = () => {
  renderKeywords();
  renderPatterns();
  renderDomains();
};

/**
 * Setup navigation between sections
 */
const setupNavigation = () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`${sectionId}-section`).classList.add('active');
    });
  });
};

/**
 * Setup keyword management handlers
 */
const setupKeywordHandlers = () => {
  const keywordInput = document.getElementById('keywordInput');
  const addKeywordBtn = document.getElementById('addKeywordBtn');

  addKeywordBtn.addEventListener('click', () => addKeyword(keywordInput));
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeywordBtn.click();
  });
};

/**
 * Setup pattern management handlers
 */
const setupPatternHandlers = () => {
  const patternInput = document.getElementById('patternInput');
  const addPatternBtn = document.getElementById('addPatternBtn');
  const testText = document.getElementById('testText');

  addPatternBtn.addEventListener('click', () => addPattern(patternInput));
  patternInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPatternBtn.click();
  });

  // Setup pattern tester
  patternInput.addEventListener('input', () => updateTestResult(patternInput, testText));
  testText.addEventListener('input', () => updateTestResult(patternInput, testText));
};

/**
 * Setup domain management handlers
 */
const setupDomainHandlers = () => {
  // Domain toggle handlers are set up in renderDomains()
};

/**
 * Setup import/export functionality
 */
const setupImportExport = () => {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImport);
};

/**
 * Add a keyword to the list
 * @param {HTMLInputElement} input - Keyword input element
 */
const addKeyword = async (input) => {
  const value = input.value.trim();
  if (!value) return;

  if (userRules.keywords.includes(value)) {
    showToast('このキーワードは既に登録されています', 'warning');
    return;
  }

  userRules.keywords.push(value);
  input.value = '';
  await saveAndRender();
  showToast('キーワードを追加しました');
};

/**
 * Delete a keyword
 * @param {number} index - Index of keyword to delete
 */
const deleteKeyword = async (index) => {
  userRules.keywords.splice(index, 1);
  await saveAndRender();
};

/**
 * Render keywords list
 */
const renderKeywords = () => {
  const keywordsList = document.getElementById('keywordsList');

  if (userRules.keywords.length === 0) {
    keywordsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <p>キーワードが登録されていません</p>
        <span>上のフォームからキーワードを追加してください</span>
      </div>
    `;
    return;
  }

  keywordsList.innerHTML = userRules.keywords
    .map((keyword, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(keyword)}</span>
        <button class="btn btn-danger delete-keyword" data-index="${index}">削除</button>
      </div>
    `)
    .join('');

  // Attach event listeners
  keywordsList.querySelectorAll('.delete-keyword').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteKeyword(index);
    });
  });
};

/**
 * Add a pattern to the list
 * @param {HTMLInputElement} input - Pattern input element
 */
const addPattern = async (input) => {
  const value = input.value.trim();
  if (!value) return;

  if (!RulesManager.isValidPattern(value)) {
    showToast('無効な正規表現です', 'error');
    return;
  }

  if (userRules.patterns.includes(value)) {
    showToast('この正規表現は既に登録されています', 'warning');
    return;
  }

  userRules.patterns.push(value);
  input.value = '';
  await saveAndRender();
  showToast('正規表現を追加しました');
};

/**
 * Delete a pattern
 * @param {number} index - Index of pattern to delete
 */
const deletePattern = async (index) => {
  userRules.patterns.splice(index, 1);
  await saveAndRender();
};

/**
 * Render patterns list
 */
const renderPatterns = () => {
  const patternsList = document.getElementById('patternsList');

  if (userRules.patterns.length === 0) {
    patternsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
        <p>正規表現が登録されていません</p>
        <span>上のフォームから正規表現を追加してください</span>
      </div>
    `;
    return;
  }

  patternsList.innerHTML = userRules.patterns
    .map((pattern, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(pattern)}</span>
        <button class="btn btn-danger delete-pattern" data-index="${index}">削除</button>
      </div>
    `)
    .join('');

  // Attach event listeners
  patternsList.querySelectorAll('.delete-pattern').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deletePattern(index);
    });
  });
};

/**
 * Update pattern test result
 * @param {HTMLInputElement} patternInput - Pattern input element
 * @param {HTMLInputElement} testText - Test text input element
 */
const updateTestResult = (patternInput, testText) => {
  const testResult = document.getElementById('testResult');
  const pattern = patternInput.value.trim();
  const text = testText.value;

  if (!pattern || !text) {
    testResult.classList.add('hidden');
    return;
  }

  const matches = RulesManager.testPattern(pattern, text);

  if (matches === null) {
    testResult.className = 'test-result error';
    testResult.innerHTML = `
      <span class="test-icon">✗</span>
      <span class="test-message">無効な正規表現</span>
    `;
  } else if (matches && matches.length > 0) {
    testResult.className = 'test-result success';
    testResult.innerHTML = `
      <span class="test-icon">✓</span>
      <span class="test-message">${matches.length}件マッチ: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}</span>
    `;
  } else {
    testResult.className = 'test-result warning';
    testResult.innerHTML = `
      <span class="test-icon">−</span>
      <span class="test-message">マッチしませんでした</span>
    `;
  }
};

/**
 * Render domains list
 */
const renderDomains = () => {
  const domainCards = document.getElementById('domainCards');

  domainCards.innerHTML = Object.entries(domainRules)
    .map(([key, domain]) => `
      <div class="domain-card" data-domain="${key}">
        <div class="domain-card-header">
          <div class="domain-card-info">
            <div class="domain-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <div class="domain-card-name">${escapeHtml(domain.name)}</div>
              <div class="domain-card-url">${domain.matches.join(', ')}</div>
            </div>
          </div>
          <label class="domain-toggle">
            <input type="checkbox" ${domain.enabled ? 'checked' : ''} data-domain="${key}">
            <span class="domain-toggle-slider"></span>
          </label>
        </div>
        ${domain.selectors && domain.selectors.length > 0 ? `
          <div class="domain-card-selectors">
            <div class="domain-card-selectors-title">隠蔽セレクタ</div>
            <div class="selector-tags">
              ${domain.selectors.map(s => `<span class="selector-tag">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `)
    .join('');

  // Attach event listeners for domain toggles
  domainCards.querySelectorAll('.domain-toggle input').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const domainKey = e.target.dataset.domain;
      domainRules[domainKey].enabled = e.target.checked;
      await saveRules();
      showToast(`${domainRules[domainKey].name} を${e.target.checked ? '有効' : '無効'}にしました`);
    });
  });
};

/**
 * Save rules to storage
 */
const saveRules = async () => {
  try {
    await StorageManager.setUserRules(userRules);
    await StorageManager.setDomainRules(domainRules);
  } catch (error) {
    Logger.error('Failed to save rules', error);
    showToast('保存に失敗しました', 'error');
  }
};

/**
 * Save rules and re-render UI
 */
const saveAndRender = async () => {
  await saveRules();
  renderKeywords();
  renderPatterns();
};

/**
 * Handle export functionality
 */
const handleExport = () => {
  try {
    const data = createExportData(userRules, domainRules, CONFIG_VERSION);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-guard-settings-${formatDateForFilename()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('設定をエクスポートしました');
  } catch (error) {
    Logger.error('Failed to export settings', error);
    showToast('エクスポートに失敗しました', 'error');
  }
};

/**
 * Handle import functionality
 * @param {Event} e - File input change event
 */
const handleImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = parseImportData(text);

    if (!data) {
      showToast('無効なファイル形式です', 'error');
      return;
    }

    if (data.userRules) {
      userRules = data.userRules;
    }
    if (data.domainRules) {
      domainRules = { ...domainRules, ...data.domainRules };
    }

    await saveRules();
    renderAll();
    showToast('設定をインポートしました');
  } catch (error) {
    Logger.error('Failed to import settings', error);
    showToast('インポートに失敗しました: ' + error.message, 'error');
  } finally {
    e.target.value = '';
  }
};

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} [type='success'] - Toast type (success, error, warning)
 */
const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const icon = toast.querySelector('.toast-icon');

  toastMessage.textContent = message;
  toast.classList.remove('hidden');

  // Set icon and color based on type
  if (type === 'success') {
    toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    icon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
  } else if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    icon.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>';
  } else if (type === 'warning') {
    toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    icon.innerHTML = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>';
  }

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
