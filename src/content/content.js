/**
 * Content script for Privacy Shield extension
 * Handles detection and hiding of privacy-sensitive content on web pages
 * @module content
 */

import { StorageManager } from '../utils/storage.js';
import { RulesManager } from '../utils/rules.js';
import { Logger } from '../utils/logger.js';
import {
  truncateText,
  findTargetElement,
  isElementHidden,
  waitForDOMReady,
  sendMessageSafely,
  debounce
} from '../utils/helpers.js';
import {
  MAX_TEXT_LENGTH_SMALL,
  MAX_TEXT_LENGTH_LARGE,
  SAVE_DEBOUNCE_DELAY,
  TOAST_DURATION,
  TOAST_ANIMATION_DURATION,
  MESSAGE_TYPES
} from '../config/constants.js';

(() => {
  'use strict';

  // State variables
  let isPaused = false;
  let hiddenItemsSet = new Set();
  let toastShown = false;
  let currentDomainRules = null;
  let userRules = null;

  /**
   * Initialize the content script
   */
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
      Logger.error('Failed to initialize content script', error);
    }
  };

  /**
   * Load initial state from storage
   */
  const loadState = async () => {
    try {
      isPaused = await StorageManager.getIsPaused();
      userRules = await StorageManager.getUserRules();
    } catch (error) {
      Logger.error('Failed to load state', error);
    }
  };

  /**
   * Load domain-specific rules for the current page
   */
  const loadDomainRules = async () => {
    try {
      const hostname = window.location.hostname;
      currentDomainRules = await RulesManager.loadDomainRules(hostname);
    } catch (error) {
      Logger.error('Failed to load domain rules', error);
    }
  };

  /**
   * Setup listener for storage changes
   */
  const setupStorageListener = () => {
    chrome.storage.onChanged.addListener(handleStorageChange);
  };

  /**
   * Setup mutation observer to watch for DOM changes
   */
  const setupMutationObserver = () => {
    const observer = new MutationObserver(() => {
      if (!isPaused) {
        runHidingLogic();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  /**
   * Handle storage change events
   * @param {Object} changes - Changed storage items
   * @param {string} area - Storage area name
   */
  const handleStorageChange = (changes, area) => {
    if (area !== 'local') return;

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

  /**
   * Update body class based on paused state
   */
  const updateBodyClass = () => {
    if (isPaused) {
      document.body.classList.add('privacy-guard-paused');
    } else {
      document.body.classList.remove('privacy-guard-paused');
    }
  };

  /**
   * Unhide all previously hidden elements
   */
  const unhideAll = () => {
    document.querySelectorAll('[data-privacy-hidden]').forEach(el => {
      el.style.display = '';
      el.removeAttribute('data-privacy-hidden');
    });
  };

  /**
   * Update badge count in the extension icon
   * @param {number} count - Number of hidden items
   */
  const updateBadge = (count) => {
    sendMessageSafely({ type: MESSAGE_TYPES.UPDATE_COUNT, count });
  };

  /**
   * Save hidden items to storage
   */
  const saveHiddenItems = async () => {
    try {
      await StorageManager.setHiddenData(hiddenItemsSet.size, Array.from(hiddenItemsSet));
      updateBadge(hiddenItemsSet.size);
    } catch (error) {
      Logger.error('Failed to save hidden items', error);
    }
  };

  /**
   * Debounced save function
   */
  const debouncedSaveHiddenItems = debounce(saveHiddenItems, SAVE_DEBOUNCE_DELAY);

  /**
   * Hide an element and track it
   * @param {HTMLElement} el - Element to hide
   * @param {string} reason - Reason for hiding
   * @returns {boolean} True if element was newly hidden
   */
  const hideElement = (el, reason) => {
    if (isElementHidden(el)) return false;

    el.style.display = 'none';
    el.setAttribute('data-privacy-hidden', 'true');

    const itemText = truncateText(el.innerText) || reason || 'Hidden Item';
    if (!hiddenItemsSet.has(itemText)) {
      hiddenItemsSet.add(itemText);
      return true;
    }
    return false;
  };

  /**
   * Hide elements matching CSS selectors
   * @param {Array<string>} selectors - CSS selectors to match
   * @returns {boolean} True if any elements were hidden
   */
  const hideBySelectors = (selectors) => {
    let changed = false;
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
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

  /**
   * Hide elements containing specific keywords
   * @param {Array<string|Object>} keywords - Keywords to search for
   * @returns {boolean} True if any elements were hidden
   */
  const hideByKeywords = (keywords) => {
    if (!keywords || keywords.length === 0) return false;

    // Filter enabled keywords and extract values
    const activeKeywords = keywords
      .map(k => {
        if (typeof k === 'string') return k;
        return k.enabled ? k.value : null;
      })
      .filter(Boolean);

    if (activeKeywords.length === 0) return false;

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

      for (const keyword of activeKeywords) {
        if (text && text.includes(keyword)) {
          const target = findTargetElement(node, MAX_TEXT_LENGTH_SMALL, MAX_TEXT_LENGTH_LARGE);
          if (target && !target.hasAttribute('data-privacy-hidden')) {
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

  /**
   * Hide elements matching regex patterns
   * @param {Array<string>} patterns - Regex patterns to match
   * @returns {boolean} True if any elements were hidden
   */
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
          if (target && !target.hasAttribute('data-privacy-hidden')) {
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

  /**
   * Show toast notification
   */
  const showToast = () => {
    if (toastShown) return;
    toastShown = true;

    const toast = document.createElement('div');
    toast.id = 'privacy-guard-toast';
    toast.innerHTML = `
      <div class="pg-toast-content">
        <svg class="pg-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>プライバシーを保護しました</span>
      </div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('pg-toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('pg-toast-show');
      toast.classList.add('pg-toast-hide');
      setTimeout(() => toast.remove(), TOAST_ANIMATION_DURATION);
    }, TOAST_DURATION);
  };

  /**
   * Run the main hiding logic
   */
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

  // Initialize when DOM is ready
  waitForDOMReady().then(init);
})();
