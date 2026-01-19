/**
 * Constants and configuration values for the Privacy Shield extension
 * @module constants
 */

/**
 * Default badge color for the extension icon
 * @constant {string}
 */
export const BADGE_COLOR = '#6366f1';

/**
 * Maximum text length to consider for hiding (characters)
 * @constant {number}
 */
export const MAX_TEXT_LENGTH_SMALL = 100;

/**
 * Maximum text length for parent element (characters)
 * @constant {number}
 */
export const MAX_TEXT_LENGTH_LARGE = 200;

/**
 * Maximum preview text length for hidden items (characters)
 * @constant {number}
 */
export const PREVIEW_TEXT_LENGTH = 50;

/**
 * Debounce delay for saving hidden items (milliseconds)
 * @constant {number}
 */
export const SAVE_DEBOUNCE_DELAY = 500;

/**
 * Toast display duration (milliseconds)
 * @constant {number}
 */
export const TOAST_DURATION = 3000;

/**
 * Toast animation duration (milliseconds)
 * @constant {number}
 */
export const TOAST_ANIMATION_DURATION = 300;

/**
 * Default user rules structure
 * @constant {Object}
 */
export const DEFAULT_USER_RULES = {
  keywords: [],
  patterns: []
};

/**
 * Storage keys used by the extension
 * @constant {Object}
 */
export const STORAGE_KEYS = {
  IS_PAUSED: 'isPaused',
  HIDDEN_COUNT: 'hiddenCount',
  HIDDEN_ITEMS: 'hiddenItems',
  USER_RULES: 'userRules',
  DOMAIN_RULES: 'domainRules',
  GENERAL_SETTINGS: 'generalSettings'
};

/**
 * Available themes
 * @constant {Object}
 */
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

/**
 * Default general settings
 * @constant {Object}
 */
export const DEFAULT_GENERAL_SETTINGS = {
  theme: THEMES.DARK,
  showBadge: true
};

/**
 * Message types for chrome.runtime messaging
 * @constant {Object}
 */
export const MESSAGE_TYPES = {
  UPDATE_COUNT: 'UPDATE_COUNT',
  GET_RULES: 'GET_RULES',
  SAVE_RULES: 'SAVE_RULES'
};

/**
 * Configuration version for import/export
 * @constant {string}
 */
export const CONFIG_VERSION = '1.0';
