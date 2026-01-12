(() => {
  // src/config/constants.js
  var BADGE_COLOR = "#6366f1";
  var DEFAULT_USER_RULES = {
    keywords: [],
    patterns: []
  };
  var STORAGE_KEYS = {
    IS_PAUSED: "isPaused",
    HIDDEN_COUNT: "hiddenCount",
    HIDDEN_ITEMS: "hiddenItems",
    USER_RULES: "userRules",
    DOMAIN_RULES: "domainRules"
  };
  var MESSAGE_TYPES = {
    UPDATE_COUNT: "UPDATE_COUNT",
    GET_RULES: "GET_RULES",
    SAVE_RULES: "SAVE_RULES"
  };

  // src/utils/logger.js
  var LOG_PREFIX = "[Privacy Shield]";
  var Logger = class {
    /**
     * Log an error message
     * @param {string} message - The error message
     * @param {Error|any} [error] - Optional error object or additional data
     */
    static error(message, error = null) {
      console.error(`${LOG_PREFIX} ${message}`, error || "");
    }
    /**
     * Log a warning message
     * @param {string} message - The warning message
     * @param {any} [data] - Optional additional data
     */
    static warn(message, data = null) {
      console.warn(`${LOG_PREFIX} ${message}`, data || "");
    }
    /**
     * Log an info message
     * @param {string} message - The info message
     * @param {any} [data] - Optional additional data
     */
    static info(message, data = null) {
      console.info(`${LOG_PREFIX} ${message}`, data || "");
    }
    /**
     * Log a debug message
     * @param {string} message - The debug message
     * @param {any} [data] - Optional additional data
     */
    static debug(message, data = null) {
      console.debug(`${LOG_PREFIX} ${message}`, data || "");
    }
    /**
     * Log a message with a specific level
     * @param {string} level - The log level
     * @param {string} message - The message
     * @param {any} [data] - Optional additional data
     */
    static log(level, message, data = null) {
      const logMethod = console[level.toLowerCase()] || console.log;
      logMethod.call(console, `${LOG_PREFIX} [${level}] ${message}`, data || "");
    }
  };

  // src/utils/storage.js
  var StorageManager = class {
    /**
     * Get a value from storage
     * @param {string|string[]} keys - Storage key(s) to retrieve
     * @returns {Promise<Object>} The stored values
     */
    static async get(keys) {
      try {
        return await chrome.storage.local.get(keys);
      } catch (error) {
        Logger.error("Failed to get from storage", error);
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
        Logger.error("Failed to set storage", error);
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
        Logger.error("Failed to remove from storage", error);
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
        Logger.error("Failed to initialize storage", error);
        return false;
      }
    }
  };

  // src/background/background.js
  var handleInstall = async () => {
    try {
      setBadge("", BADGE_COLOR);
      await StorageManager.initialize();
      Logger.info("Extension installed successfully");
    } catch (error) {
      Logger.error("Failed to handle installation", error);
    }
  };
  var setBadge = async (text, color, tabId = null) => {
    const options = { text };
    if (tabId) options.tabId = tabId;
    await chrome.action.setBadgeText(options).catch((error) => Logger.debug("Failed to set badge text.", error));
    const colorOptions = { color };
    if (tabId) colorOptions.tabId = tabId;
    await chrome.action.setBadgeBackgroundColor(colorOptions).catch((error) => Logger.debug("Failed to set badge background color.", error));
  };
  var handleUpdateCount = (request, sender) => {
    const count = request.count;
    const tabId = sender.tab?.id;
    if (tabId) {
      if (count > 0) {
        setBadge(count.toString(), BADGE_COLOR, tabId);
      } else {
        setBadge("", BADGE_COLOR, tabId);
      }
    }
  };
  var handleGetRules = async (sendResponse) => {
    try {
      const userRules = await StorageManager.getUserRules();
      const domainRules = await StorageManager.getDomainRules();
      sendResponse({ userRules, domainRules });
    } catch (error) {
      Logger.error("Failed to get rules", error);
      sendResponse({ error: error.message });
    }
  };
  var handleSaveRules = async (request, sendResponse) => {
    try {
      if (request.userRules) {
        await StorageManager.setUserRules(request.userRules);
      }
      if (request.domainRules) {
        await StorageManager.setDomainRules(request.domainRules);
      }
      sendResponse({ success: true });
    } catch (error) {
      Logger.error("Failed to save rules", error);
      sendResponse({ success: false, error: error.message });
    }
  };
  var handleMessage = (request, sender, sendResponse) => {
    try {
      switch (request.type) {
        case MESSAGE_TYPES.UPDATE_COUNT:
          handleUpdateCount(request, sender);
          return false;
        case MESSAGE_TYPES.GET_RULES:
          handleGetRules(sendResponse);
          return true;
        case MESSAGE_TYPES.SAVE_RULES:
          handleSaveRules(request, sendResponse);
          return true;
        default:
          Logger.warn("Unknown message type", request.type);
          return false;
      }
    } catch (error) {
      Logger.error("Error handling message", error);
      sendResponse({ error: error.message });
      return false;
    }
  };
  var handleTabUpdate = (tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
      setBadge("", BADGE_COLOR, tabId);
    }
  };
  chrome.runtime.onInstalled.addListener(handleInstall);
  chrome.runtime.onMessage.addListener(handleMessage);
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
  Logger.info("Background service worker initialized");
})();
//# sourceMappingURL=background.js.map
