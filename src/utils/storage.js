/**
 * Storage Manager for unified storage operations
 * @module storage
 */

import { STORAGE_KEYS, DEFAULT_USER_RULES } from '../config/constants.js';
import { Logger } from './logger.js';

/**
 * StorageManager class for handling chrome.storage operations
 */
export class StorageManager {
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
