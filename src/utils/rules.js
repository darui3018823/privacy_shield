/**
 * Rules Manager for handling domain rules and filtering logic
 * @module rules
 */

import { SUPPORTED_DOMAINS } from '../config/config.js';
import { Logger } from './logger.js';
import { StorageManager } from './storage.js';

/**
 * RulesManager class for managing and processing rules
 */
export class RulesManager {
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
          // Handle object format { value: 'pattern', enabled: true }
          const patternStr = typeof p === 'object' ? (p.enabled ? p.value : null) : p;
          if (!patternStr) return null; // Skip disabled or invalid

          return new RegExp(patternStr, 'g');
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
