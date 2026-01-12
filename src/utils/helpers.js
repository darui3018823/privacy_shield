/**
 * Helper utility functions
 * @module helpers
 */

import { PREVIEW_TEXT_LENGTH } from '../config/constants.js';

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate text to a maximum length
 * Normalizes whitespace (including newlines) to single spaces for display
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=PREVIEW_TEXT_LENGTH] - Maximum length
 * @returns {string} Truncated text with normalized whitespace
 */
export function truncateText(text, maxLength = PREVIEW_TEXT_LENGTH) {
  if (!text) return text;

  // Normalize whitespace: replace all consecutive whitespace (including newlines) with a single space
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }
  return normalized.substring(0, maxLength) + '…';
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
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
export function formatDateForFilename(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Create an export data object with version and timestamp
 * @param {Object} userRules - User rules
 * @param {Object} domainRules - Domain rules
 * @param {string} version - Config version
 * @returns {Object} Export data object
 */
export function createExportData(userRules, domainRules, version) {
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
export function parseImportData(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    // Basic validation: ensure it's a non-null object
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
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
export function findTargetElement(node, maxSmall, maxLarge) {
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
export function isElementHidden(element) {
  return element.style.display === 'none' || element.hasAttribute('data-privacy-hidden');
}

/**
 * Wait for DOM to be ready
 * @returns {Promise<void>} Resolves when DOM is ready
 */
export function waitForDOMReady() {
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
    // Extension context invalidated - this is expected when extension reloads
    // Don't log as it's not an actual error condition
    return null;
  }
}
