(() => {
  // src/config/constants.js
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

  // src/utils/helpers.js
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

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
  var DOMAIN_DISPLAY_NAMES = {
    "gemini.google.com": "Google Gemini",
    "google.com": "Google Search",
    "google.co.jp": "Google Search",
    "amazon.co.jp": "Amazon.co.jp"
  };
  var SUPPORTED_DOMAIN_PATTERNS = Object.values(SUPPORTED_DOMAINS).flatMap((d) => d.matches);
  function getDomainDisplayName(domain) {
    for (const [key, value] of Object.entries(DOMAIN_DISPLAY_NAMES)) {
      if (domain.includes(key)) {
        return value;
      }
    }
    return domain;
  }
  function isSupportedDomain(domain) {
    return SUPPORTED_DOMAIN_PATTERNS.some((pattern) => domain.includes(pattern));
  }

  // src/popup/popup.js
  var init = async () => {
    try {
      const elements = getUIElements();
      const tab = await getCurrentTab();
      setupDomainInfo(elements, tab);
      await loadState(elements);
      setupEventListeners(elements);
      setupStorageListener(elements);
    } catch (error) {
      Logger.error("Failed to initialize popup", error);
    }
  };
  var getUIElements = () => {
    return {
      globalToggle: document.getElementById("globalToggle"),
      statusCard: document.getElementById("statusCard"),
      statusDot: document.getElementById("statusDot"),
      statusText: document.getElementById("statusText"),
      hiddenCount: document.getElementById("hiddenCount"),
      currentDomain: document.getElementById("currentDomain"),
      domainStatus: document.getElementById("domainStatus"),
      expandBtn: document.getElementById("expandBtn"),
      hiddenList: document.getElementById("hiddenList"),
      blurOverlay: document.getElementById("blurOverlay"),
      revealBtn: document.getElementById("revealBtn"),
      itemsContent: document.getElementById("itemsContent"),
      openSettings: document.getElementById("openSettings")
    };
  };
  var getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  };
  var setupDomainInfo = (elements, tab) => {
    try {
      const url = new URL(tab.url);
      const tabDomain = url.hostname.replace("www.", "");
      const displayName = getDomainDisplayName(tabDomain);
      elements.currentDomain.textContent = displayName;
      setupFavicon(tab.favIconUrl);
      const isSupported = isSupportedDomain(tabDomain);
      if (!isSupported) {
        elements.domainStatus.classList.add("unsupported");
        elements.domainStatus.querySelector(".domain-badge").textContent = "\u672A\u5BFE\u5FDC";
      }
    } catch (error) {
      Logger.warn("Failed to setup domain info", error);
      elements.currentDomain.textContent = "\u4E0D\u660E";
      elements.domainStatus.classList.add("unsupported");
      elements.domainStatus.querySelector(".domain-badge").textContent = "\u4E0D\u660E";
    }
  };
  var setupFavicon = (faviconUrl) => {
    const domainIconContainer = document.querySelector(".domain-icon");
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
  var loadState = async (elements) => {
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
      Logger.error("Failed to load state", error);
    }
  };
  var updateStatusUI = (elements, isActive) => {
    if (isActive) {
      elements.statusCard.classList.remove("paused");
      elements.statusText.textContent = "\u4FDD\u8B77\u4E2D";
    } else {
      elements.statusCard.classList.add("paused");
      elements.statusText.textContent = "\u4E00\u6642\u505C\u6B62";
    }
  };
  var renderHiddenItems = (container, items) => {
    if (!items || items.length === 0) {
      container.innerHTML = '<p class="no-items">\u96A0\u853D\u3055\u308C\u305F\u30A2\u30A4\u30C6\u30E0\u306F\u3042\u308A\u307E\u305B\u3093</p>';
      return;
    }
    container.innerHTML = items.map((item) => `<div class="hidden-item">${escapeHtml(item)}</div>`).join("");
  };
  var setupEventListeners = (elements) => {
    elements.globalToggle.addEventListener("change", async (e) => {
      const isActive = e.target.checked;
      await StorageManager.setIsPaused(!isActive);
      updateStatusUI(elements, isActive);
      if (!isActive) {
        chrome.action.setBadgeText({ text: "" });
      }
    });
    elements.expandBtn.addEventListener("click", () => {
      const isExpanded = elements.hiddenList.classList.toggle("show");
      elements.expandBtn.classList.toggle("expanded", isExpanded);
    });
    elements.revealBtn.addEventListener("click", () => {
      elements.blurOverlay.classList.add("hidden");
    });
    elements.openSettings.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  };
  var setupStorageListener = (elements) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes.hiddenCount) {
        elements.hiddenCount.textContent = changes.hiddenCount.newValue || 0;
      }
      if (changes.hiddenItems) {
        renderHiddenItems(elements.itemsContent, changes.hiddenItems.newValue || []);
      }
    });
  };
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=popup.js.map
