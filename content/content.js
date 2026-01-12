(() => {
  // src/config/constants.js
  var MAX_TEXT_LENGTH_SMALL = 100;
  var MAX_TEXT_LENGTH_LARGE = 200;
  var PREVIEW_TEXT_LENGTH = 50;
  var SAVE_DEBOUNCE_DELAY = 500;
  var TOAST_DURATION = 3e3;
  var TOAST_ANIMATION_DURATION = 300;
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

  // src/config/config.js
  var SUPPORTED_DOMAINS = {
    google: {
      name: "Google Search",
      matches: ["www.google.com", "www.google.co.jp"],
      enabled: true,
      selectors: [".O4T6Pe", ".vqkKIe", ".eKPi4", "update-location", ".dfB0uf"]
    },
    gemini: {
      name: "Google Gemini",
      matches: ["gemini.google.com"],
      enabled: true,
      selectors: ["location-footer", ".location-menu-item-container"]
    },
    amazon: {
      name: "Amazon.co.jp",
      matches: ["www.amazon.co.jp"],
      enabled: true,
      selectors: [
        "#nav-global-location-popover-link",
        "#glow-ingress-block",
        "#contextualIngressPtLink",
        "#contextualIngressPtLabel",
        "#contextualIngressPtLabel_deliveryShortLine",
        ".insert-encrypted-trigger-text"
      ]
    }
  };
  var SUPPORTED_DOMAIN_PATTERNS = Object.values(SUPPORTED_DOMAINS).flatMap((d) => d.matches);

  // src/utils/rules.js
  var RulesManager = class {
    /**
     * Load domain rules for the current hostname
     * @param {string} hostname - The current page hostname
     * @returns {Promise<Object|null>} The domain rules or null if not found
     */
    static async loadDomainRules(hostname) {
      try {
        const storedRules = await StorageManager.getDomainRules();
        if (storedRules) {
          for (const [key, domain] of Object.entries(storedRules)) {
            if (domain.matches && domain.matches.some((m) => hostname.includes(m))) {
              return domain;
            }
          }
        }
        try {
          const defaultRules = await fetch(chrome.runtime.getURL("rules.json")).then((r) => r.json());
          for (const [key, domain] of Object.entries(defaultRules.domains)) {
            if (domain.matches && domain.matches.some((m) => hostname.includes(m))) {
              return domain;
            }
          }
        } catch (fetchError) {
          Logger.warn("Failed to fetch default rules, using built-in config", fetchError);
        }
        for (const [key, domain] of Object.entries(SUPPORTED_DOMAINS)) {
          if (domain.matches && domain.matches.some((m) => hostname.includes(m))) {
            return domain;
          }
        }
        return null;
      } catch (error) {
        Logger.error("Failed to load domain rules", error);
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
      return patterns.map((p) => {
        try {
          return new RegExp(p, "g");
        } catch (error) {
          Logger.warn(`Invalid pattern: ${p}`, error);
          return null;
        }
      }).filter(Boolean);
    }
    /**
     * Test if a pattern matches text
     * @param {string} pattern - The pattern to test
     * @param {string} text - The text to test against
     * @returns {Array<string>|null} Array of matches or null if invalid/no match
     */
    static testPattern(pattern, text) {
      try {
        const regex = new RegExp(pattern, "g");
        return text.match(regex);
      } catch (error) {
        Logger.warn("Pattern test failed", error);
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
  };

  // src/utils/helpers.js
  function truncateText(text, maxLength = PREVIEW_TEXT_LENGTH) {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength);
  }
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
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
  function isElementHidden(element) {
    return element.style.display === "none" || element.hasAttribute("data-privacy-hidden");
  }
  function waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
      } else {
        resolve();
      }
    });
  }
  async function sendMessageSafely(message) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      return null;
    }
  }

  // src/content/content.js
  (() => {
    "use strict";
    let isPaused = false;
    let hiddenItemsSet = /* @__PURE__ */ new Set();
    let toastShown = false;
    let currentDomainRules = null;
    let userRules = null;
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
        Logger.error("Failed to initialize content script", error);
      }
    };
    const loadState = async () => {
      try {
        isPaused = await StorageManager.getIsPaused();
        userRules = await StorageManager.getUserRules();
      } catch (error) {
        Logger.error("Failed to load state", error);
      }
    };
    const loadDomainRules = async () => {
      try {
        const hostname = window.location.hostname;
        currentDomainRules = await RulesManager.loadDomainRules(hostname);
      } catch (error) {
        Logger.error("Failed to load domain rules", error);
      }
    };
    const setupStorageListener = () => {
      chrome.storage.onChanged.addListener(handleStorageChange);
    };
    const setupMutationObserver = () => {
      const observer = new MutationObserver(() => {
        if (!isPaused) {
          runHidingLogic();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    };
    const handleStorageChange = (changes, area) => {
      if (area !== "local") return;
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
    const updateBodyClass = () => {
      if (isPaused) {
        document.body.classList.add("privacy-guard-paused");
      } else {
        document.body.classList.remove("privacy-guard-paused");
      }
    };
    const unhideAll = () => {
      document.querySelectorAll("[data-privacy-hidden]").forEach((el) => {
        el.style.display = "";
        el.removeAttribute("data-privacy-hidden");
      });
    };
    const updateBadge = (count) => {
      sendMessageSafely({ type: MESSAGE_TYPES.UPDATE_COUNT, count });
    };
    const saveHiddenItems = async () => {
      try {
        await StorageManager.setHiddenData(hiddenItemsSet.size, Array.from(hiddenItemsSet));
        updateBadge(hiddenItemsSet.size);
      } catch (error) {
        Logger.error("Failed to save hidden items", error);
      }
    };
    const debouncedSaveHiddenItems = debounce(saveHiddenItems, SAVE_DEBOUNCE_DELAY);
    const hideElement = (el, reason) => {
      if (isElementHidden(el)) return false;
      el.style.display = "none";
      el.setAttribute("data-privacy-hidden", "true");
      const itemText = truncateText(el.innerText) || reason || "Hidden Item";
      if (!hiddenItemsSet.has(itemText)) {
        hiddenItemsSet.add(itemText);
        return true;
      }
      return false;
    };
    const hideBySelectors = (selectors) => {
      let changed = false;
      selectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((el) => {
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
            if (target && !target.hasAttribute("data-privacy-hidden")) {
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
            if (target && !target.hasAttribute("data-privacy-hidden")) {
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
    const showToast = () => {
      if (toastShown) return;
      toastShown = true;
      const toast = document.createElement("div");
      toast.id = "privacy-guard-toast";
      toast.innerHTML = `
      <div class="pg-toast-content">
        <svg class="pg-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u3092\u4FDD\u8B77\u3057\u307E\u3057\u305F</span>
      </div>
    `;
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.add("pg-toast-show");
      });
      setTimeout(() => {
        toast.classList.remove("pg-toast-show");
        toast.classList.add("pg-toast-hide");
        setTimeout(() => toast.remove(), TOAST_ANIMATION_DURATION);
      }, TOAST_DURATION);
    };
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
        debouncedSaveHiddenItems();
        showToast();
      }
    };
    waitForDOMReady().then(init);
  })();
})();
//# sourceMappingURL=content.js.map
