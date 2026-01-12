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
  var CONFIG_VERSION = "1.0";

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
    static async setUserRules(userRules2) {
      return await this.set({ [STORAGE_KEYS.USER_RULES]: userRules2 });
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
    static async setDomainRules(domainRules2) {
      return await this.set({ [STORAGE_KEYS.DOMAIN_RULES]: domainRules2 });
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
    static isDomainEnabled(domainRules2) {
      return domainRules2 && domainRules2.enabled !== false;
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
    static async saveUserRules(userRules2) {
      return await StorageManager.setUserRules(userRules2);
    }
    /**
     * Save domain rules
     * @param {Object} domainRules - Domain rules object
     * @returns {Promise<boolean>} True if successful
     */
    static async saveDomainRules(domainRules2) {
      return await StorageManager.setDomainRules(domainRules2);
    }
  };

  // src/utils/helpers.js
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  function formatDateForFilename(date = /* @__PURE__ */ new Date()) {
    return date.toISOString().slice(0, 10);
  }
  function createExportData(userRules2, domainRules2, version) {
    return {
      version,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      userRules: userRules2,
      domainRules: domainRules2
    };
  }
  function parseImportData(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return null;
      }
      return data;
    } catch (error) {
      return null;
    }
  }

  // src/options/options.js
  var userRules = { keywords: [], patterns: [] };
  var domainRules = {};
  var init = async () => {
    try {
      await loadRules();
      renderAll();
      setupNavigation();
      setupKeywordHandlers();
      setupPatternHandlers();
      setupDomainHandlers();
      setupImportExport();
    } catch (error) {
      Logger.error("Failed to initialize options page", error);
    }
  };
  var loadRules = async () => {
    try {
      userRules = await StorageManager.getUserRules();
      domainRules = await StorageManager.getDomainRules() || SUPPORTED_DOMAINS;
    } catch (error) {
      Logger.error("Failed to load rules", error);
    }
  };
  var renderAll = () => {
    renderKeywords();
    renderPatterns();
    renderDomains();
  };
  var setupNavigation = () => {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".section");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const sectionId = item.dataset.section;
        navItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        sections.forEach((s) => s.classList.remove("active"));
        document.getElementById(`${sectionId}-section`).classList.add("active");
      });
    });
  };
  var setupKeywordHandlers = () => {
    const keywordInput = document.getElementById("keywordInput");
    const addKeywordBtn = document.getElementById("addKeywordBtn");
    addKeywordBtn.addEventListener("click", () => addKeyword(keywordInput));
    keywordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addKeywordBtn.click();
    });
  };
  var setupPatternHandlers = () => {
    const patternInput = document.getElementById("patternInput");
    const addPatternBtn = document.getElementById("addPatternBtn");
    const testText = document.getElementById("testText");
    addPatternBtn.addEventListener("click", () => addPattern(patternInput));
    patternInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addPatternBtn.click();
    });
    patternInput.addEventListener("input", () => updateTestResult(patternInput, testText));
    testText.addEventListener("input", () => updateTestResult(patternInput, testText));
  };
  var setupDomainHandlers = () => {
  };
  var setupImportExport = () => {
    const exportBtn = document.getElementById("exportBtn");
    const importBtn = document.getElementById("importBtn");
    const importFile = document.getElementById("importFile");
    exportBtn.addEventListener("click", handleExport);
    importBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", handleImport);
  };
  var addKeyword = async (input) => {
    const value = input.value.trim();
    if (!value) return;
    if (userRules.keywords.includes(value)) {
      showToast("\u3053\u306E\u30AD\u30FC\u30EF\u30FC\u30C9\u306F\u65E2\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u3059", "warning");
      return;
    }
    userRules.keywords.push(value);
    input.value = "";
    await saveAndRender();
    showToast("\u30AD\u30FC\u30EF\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F");
  };
  var deleteKeyword = async (index) => {
    userRules.keywords.splice(index, 1);
    await saveAndRender();
  };
  var renderKeywords = () => {
    const keywordsList = document.getElementById("keywordsList");
    if (userRules.keywords.length === 0) {
      keywordsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <p>\u30AD\u30FC\u30EF\u30FC\u30C9\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093</p>
        <span>\u4E0A\u306E\u30D5\u30A9\u30FC\u30E0\u304B\u3089\u30AD\u30FC\u30EF\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044</span>
      </div>
    `;
      return;
    }
    keywordsList.innerHTML = userRules.keywords.map((keyword, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(keyword)}</span>
        <button class="btn btn-danger delete-keyword" data-index="${index}">\u524A\u9664</button>
      </div>
    `).join("");
    keywordsList.querySelectorAll(".delete-keyword").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        deleteKeyword(index);
      });
    });
  };
  var addPattern = async (input) => {
    const value = input.value.trim();
    if (!value) return;
    if (!RulesManager.isValidPattern(value)) {
      showToast("\u7121\u52B9\u306A\u6B63\u898F\u8868\u73FE\u3067\u3059", "error");
      return;
    }
    if (userRules.patterns.includes(value)) {
      showToast("\u3053\u306E\u6B63\u898F\u8868\u73FE\u306F\u65E2\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u3059", "warning");
      return;
    }
    userRules.patterns.push(value);
    input.value = "";
    await saveAndRender();
    showToast("\u6B63\u898F\u8868\u73FE\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F");
  };
  var deletePattern = async (index) => {
    userRules.patterns.splice(index, 1);
    await saveAndRender();
  };
  var renderPatterns = () => {
    const patternsList = document.getElementById("patternsList");
    if (userRules.patterns.length === 0) {
      patternsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
        <p>\u6B63\u898F\u8868\u73FE\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093</p>
        <span>\u4E0A\u306E\u30D5\u30A9\u30FC\u30E0\u304B\u3089\u6B63\u898F\u8868\u73FE\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044</span>
      </div>
    `;
      return;
    }
    patternsList.innerHTML = userRules.patterns.map((pattern, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(pattern)}</span>
        <button class="btn btn-danger delete-pattern" data-index="${index}">\u524A\u9664</button>
      </div>
    `).join("");
    patternsList.querySelectorAll(".delete-pattern").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        deletePattern(index);
      });
    });
  };
  var updateTestResult = (patternInput, testText) => {
    const testResult = document.getElementById("testResult");
    const pattern = patternInput.value.trim();
    const text = testText.value;
    if (!pattern || !text) {
      testResult.classList.add("hidden");
      return;
    }
    const matches = RulesManager.testPattern(pattern, text);
    if (matches === null) {
      testResult.className = "test-result error";
      testResult.innerHTML = `
      <span class="test-icon">\u2717</span>
      <span class="test-message">\u7121\u52B9\u306A\u6B63\u898F\u8868\u73FE</span>
    `;
    } else if (matches && matches.length > 0) {
      testResult.className = "test-result success";
      testResult.innerHTML = `
      <span class="test-icon">\u2713</span>
      <span class="test-message">${matches.length}\u4EF6\u30DE\u30C3\u30C1: ${matches.slice(0, 3).join(", ")}${matches.length > 3 ? "..." : ""}</span>
    `;
    } else {
      testResult.className = "test-result warning";
      testResult.innerHTML = `
      <span class="test-icon">\u2212</span>
      <span class="test-message">\u30DE\u30C3\u30C1\u3057\u307E\u305B\u3093\u3067\u3057\u305F</span>
    `;
    }
  };
  var renderDomains = () => {
    const domainCards = document.getElementById("domainCards");
    domainCards.innerHTML = Object.entries(domainRules).map(([key, domain]) => `
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
              <div class="domain-card-url">${domain.matches.join(", ")}</div>
            </div>
          </div>
          <label class="domain-toggle">
            <input type="checkbox" ${domain.enabled ? "checked" : ""} data-domain="${key}">
            <span class="domain-toggle-slider"></span>
          </label>
        </div>
        ${domain.selectors && domain.selectors.length > 0 ? `
          <div class="domain-card-selectors">
            <div class="domain-card-selectors-title">\u96A0\u853D\u30BB\u30EC\u30AF\u30BF</div>
            <div class="selector-tags">
              ${domain.selectors.map((s) => `<span class="selector-tag">${escapeHtml(s)}</span>`).join("")}
            </div>
          </div>
        ` : ""}
      </div>
    `).join("");
    domainCards.querySelectorAll(".domain-toggle input").forEach((toggle) => {
      toggle.addEventListener("change", async (e) => {
        const domainKey = e.target.dataset.domain;
        domainRules[domainKey].enabled = e.target.checked;
        await saveRules();
        showToast(`${domainRules[domainKey].name} \u3092${e.target.checked ? "\u6709\u52B9" : "\u7121\u52B9"}\u306B\u3057\u307E\u3057\u305F`);
      });
    });
  };
  var saveRules = async () => {
    try {
      await StorageManager.setUserRules(userRules);
      await StorageManager.setDomainRules(domainRules);
    } catch (error) {
      Logger.error("Failed to save rules", error);
      showToast("\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F", "error");
    }
  };
  var saveAndRender = async () => {
    await saveRules();
    renderKeywords();
    renderPatterns();
  };
  var handleExport = () => {
    try {
      const data = createExportData(userRules, domainRules, CONFIG_VERSION);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `privacy-guard-settings-${formatDateForFilename()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("\u8A2D\u5B9A\u3092\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3057\u305F");
    } catch (error) {
      Logger.error("Failed to export settings", error);
      showToast("\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F", "error");
    }
  };
  var handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = parseImportData(text);
      if (!data) {
        showToast("\u7121\u52B9\u306A\u30D5\u30A1\u30A4\u30EB\u5F62\u5F0F\u3067\u3059", "error");
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
      showToast("\u8A2D\u5B9A\u3092\u30A4\u30F3\u30DD\u30FC\u30C8\u3057\u307E\u3057\u305F");
    } catch (error) {
      Logger.error("Failed to import settings", error);
      showToast("\u30A4\u30F3\u30DD\u30FC\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F: " + error.message, "error");
    } finally {
      e.target.value = "";
    }
  };
  var showToast = (message, type = "success") => {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    const icon = toast.querySelector(".toast-icon");
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    if (type === "success") {
      toast.style.background = "linear-gradient(135deg, #10b981, #059669)";
      icon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
    } else if (type === "error") {
      toast.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      icon.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>';
    } else if (type === "warning") {
      toast.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
      icon.innerHTML = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>';
    }
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 3e3);
  };
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=options.js.map
