/**
 * Popup UI script for Privacy Shield extension
 * Manages the extension popup interface and status display
 * @module popup
 */

import { StorageManager } from '../utils/storage.js';
import { Logger } from '../utils/logger.js';
import { escapeHtml } from '../utils/helpers.js';
import { getDomainDisplayName, isSupportedDomain } from '../config/config.js';

/**
 * Initialize popup UI
 */
const init = async () => {
  try {
    const elements = getUIElements();
    const tab = await getCurrentTab();
    
    setupDomainInfo(elements, tab);
    await loadState(elements);
    setupEventListeners(elements);
    setupStorageListener(elements);
  } catch (error) {
    Logger.error('Failed to initialize popup', error);
  }
};

/**
 * Get all UI element references
 * @returns {Object} Object containing UI element references
 */
const getUIElements = () => {
  return {
    globalToggle: document.getElementById('globalToggle'),
    statusCard: document.getElementById('statusCard'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    hiddenCount: document.getElementById('hiddenCount'),
    currentDomain: document.getElementById('currentDomain'),
    domainStatus: document.getElementById('domainStatus'),
    expandBtn: document.getElementById('expandBtn'),
    hiddenList: document.getElementById('hiddenList'),
    blurOverlay: document.getElementById('blurOverlay'),
    revealBtn: document.getElementById('revealBtn'),
    itemsContent: document.getElementById('itemsContent'),
    openSettings: document.getElementById('openSettings')
  };
};

/**
 * Get the current active tab
 * @returns {Promise<Object>} Current tab object
 */
const getCurrentTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

/**
 * Setup domain information display
 * @param {Object} elements - UI elements
 * @param {Object} tab - Current tab
 */
const setupDomainInfo = (elements, tab) => {
  try {
    const url = new URL(tab.url);
    const tabDomain = url.hostname.replace('www.', '');

    // Set display name
    const displayName = getDomainDisplayName(tabDomain);
    elements.currentDomain.textContent = displayName;

    // Setup favicon
    setupFavicon(tab.favIconUrl);

    // Check if domain is supported
    const isSupported = isSupportedDomain(tabDomain);
    if (!isSupported) {
      elements.domainStatus.classList.add('unsupported');
      elements.domainStatus.querySelector('.domain-badge').textContent = '未対応';
    }
  } catch (error) {
    Logger.warn('Failed to setup domain info', error);
    elements.currentDomain.textContent = '不明';
    elements.domainStatus.classList.add('unsupported');
    elements.domainStatus.querySelector('.domain-badge').textContent = '不明';
  }
};

/**
 * Setup favicon display
 * @param {string} faviconUrl - Favicon URL from tab
 */
const setupFavicon = (faviconUrl) => {
  const domainIconContainer = document.querySelector('.domain-icon');
  
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

/**
 * Load state from storage
 * @param {Object} elements - UI elements
 */
const loadState = async (elements) => {
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
    Logger.error('Failed to load state', error);
  }
};

/**
 * Update status UI based on active state
 * @param {Object} elements - UI elements
 * @param {boolean} isActive - Whether protection is active
 */
const updateStatusUI = (elements, isActive) => {
  if (isActive) {
    elements.statusCard.classList.remove('paused');
    elements.statusText.textContent = '保護中';
  } else {
    elements.statusCard.classList.add('paused');
    elements.statusText.textContent = '一時停止';
  }
};

/**
 * Render hidden items list
 * @param {HTMLElement} container - Container element
 * @param {Array<string>} items - Hidden items
 */
const renderHiddenItems = (container, items) => {
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="no-items">隠蔽されたアイテムはありません</p>';
    return;
  }

  container.innerHTML = items
    .map(item => `<div class="hidden-item">${escapeHtml(item)}</div>`)
    .join('');
};

/**
 * Setup event listeners
 * @param {Object} elements - UI elements
 */
const setupEventListeners = (elements) => {
  // Toggle protection on/off
  elements.globalToggle.addEventListener('change', async (e) => {
    const isActive = e.target.checked;
    await StorageManager.setIsPaused(!isActive);
    updateStatusUI(elements, isActive);
    
    if (!isActive) {
      chrome.action.setBadgeText({ text: '' });
    }
  });

  // Expand/collapse hidden items list
  elements.expandBtn.addEventListener('click', () => {
    const isExpanded = elements.hiddenList.classList.toggle('show');
    elements.expandBtn.classList.toggle('expanded', isExpanded);
  });

  // Reveal blurred content
  elements.revealBtn.addEventListener('click', () => {
    elements.blurOverlay.classList.add('hidden');
  });

  // Open settings page
  elements.openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
};

/**
 * Setup storage change listener
 * @param {Object} elements - UI elements
 */
const setupStorageListener = (elements) => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.hiddenCount) {
      elements.hiddenCount.textContent = changes.hiddenCount.newValue || 0;
    }

    if (changes.hiddenItems) {
      renderHiddenItems(elements.itemsContent, changes.hiddenItems.newValue || []);
    }
  });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
