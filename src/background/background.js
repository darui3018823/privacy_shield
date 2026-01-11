/**
 * Background service worker for Privacy Shield extension
 * Handles badge updates, rule management, and extension lifecycle
 * @module background
 */

import { StorageManager } from '../utils/storage.js';
import { Logger } from '../utils/logger.js';
import { MESSAGE_TYPES, BADGE_COLOR } from '../config/constants.js';

/**
 * Handle extension installation
 */
const handleInstall = async () => {
  try {
    setBadge('', BADGE_COLOR);
    await StorageManager.initialize();
    Logger.info('Extension installed successfully');
  } catch (error) {
    Logger.error('Failed to handle installation', error);
  }
};

/**
 * Set badge text and color
 * @param {string} text - Badge text
 * @param {string} color - Badge background color
 * @param {number} [tabId] - Optional tab ID
 */
const setBadge = (text, color, tabId = null) => {
  const options = { text };
  if (tabId) options.tabId = tabId;
  
  chrome.action.setBadgeText(options);
  
  const colorOptions = { color };
  if (tabId) colorOptions.tabId = tabId;
  
  chrome.action.setBadgeBackgroundColor(colorOptions);
};

/**
 * Handle UPDATE_COUNT message
 * @param {Object} request - Message request object
 * @param {Object} sender - Message sender
 */
const handleUpdateCount = (request, sender) => {
  const count = request.count;
  const tabId = sender.tab?.id;

  if (tabId) {
    if (count > 0) {
      setBadge(count.toString(), BADGE_COLOR, tabId);
    } else {
      setBadge('', BADGE_COLOR, tabId);
    }
  }
};

/**
 * Handle GET_RULES message
 * @param {Function} sendResponse - Response callback
 */
const handleGetRules = async (sendResponse) => {
  try {
    const userRules = await StorageManager.getUserRules();
    const domainRules = await StorageManager.getDomainRules();
    sendResponse({ userRules, domainRules });
  } catch (error) {
    Logger.error('Failed to get rules', error);
    sendResponse({ error: error.message });
  }
};

/**
 * Handle SAVE_RULES message
 * @param {Object} request - Message request object
 * @param {Function} sendResponse - Response callback
 */
const handleSaveRules = async (request, sendResponse) => {
  try {
    if (request.userRules) {
      await StorageManager.setUserRules(request.userRules);
    }
    if (request.domainRules) {
      await StorageManager.setDomainRules(request.domainRules);
    }
    sendResponse({ success: true });
  } catch (error) {
    Logger.error('Failed to save rules', error);
    sendResponse({ success: false, error: error.message });
  }
};

/**
 * Handle incoming messages
 * @param {Object} request - Message request
 * @param {Object} sender - Message sender
 * @param {Function} sendResponse - Response callback
 * @returns {boolean} True if response is async
 */
const handleMessage = (request, sender, sendResponse) => {
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
        Logger.warn('Unknown message type', request.type);
        return false;
    }
  } catch (error) {
    Logger.error('Error handling message', error);
    sendResponse({ error: error.message });
    return false;
  }
};

/**
 * Handle tab updates
 * @param {number} tabId - Tab ID
 * @param {Object} changeInfo - Change information
 * @param {Object} tab - Tab object
 */
const handleTabUpdate = (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    setBadge('', BADGE_COLOR, tabId);
  }
};

// Register event listeners
chrome.runtime.onInstalled.addListener(handleInstall);
chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onUpdated.addListener(handleTabUpdate);

Logger.info('Background service worker initialized');
