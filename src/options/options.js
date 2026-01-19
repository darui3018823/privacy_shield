/**
 * Options page script for Privacy Shield extension
 * Manages settings, rules, and configuration interface
 * @module options
 */

import { StorageManager } from '../utils/storage.js';
import { RulesManager } from '../utils/rules.js';
import { Logger } from '../utils/logger.js';
import {
  escapeHtml,
  createExportData,
  parseImportData,
  formatDateForFilename
} from '../utils/helpers.js';
import { STORAGE_KEYS, DEFAULT_GENERAL_SETTINGS, DEFAULT_USER_RULES } from '../config/constants.js';
import { SUPPORTED_DOMAINS } from '../config/config.js';
import { CONFIG_VERSION } from '../config/constants.js';

// State variables
let userRules = { keywords: [], patterns: [] };
let domainRules = {};
let generalSettings = {};
let selectedKeywords = new Set();
let selectedPatterns = new Set();

/**
 * Initialize the options page
 */
const init = async () => {
  try {
    await loadRules();
    renderAll();
    setupNavigation();
    setupKeywordHandlers();
    setupPatternHandlers();
    setupDomainHandlers();
    setupGeneralSettingsHandlers();
    setupKeyboardShortcuts();
    setupImportExport();

    // Display Version
    const manifest = chrome.runtime.getManifest();
    const versionEl = document.getElementById('appVersion');
    if (versionEl) {
      versionEl.textContent = manifest.version;
    }
  } catch (error) {
    Logger.error('Failed to initialize options page', error);
  }
};

/**
 * Load rules from storage and migrate data if necessary
 */
const loadRules = async () => {
  try {
    userRules = await StorageManager.getUserRules();
    domainRules = (await StorageManager.getDomainRules()) || SUPPORTED_DOMAINS;

    // Load general settings
    const storedSettings = await StorageManager.get(STORAGE_KEYS.GENERAL_SETTINGS);
    generalSettings = storedSettings[STORAGE_KEYS.GENERAL_SETTINGS] || DEFAULT_GENERAL_SETTINGS;

    // Data Migration: Convert string keywords/patterns to objects if necessary
    // This ensures backward compatibility and upgrades existing data
    if (userRules.keywords.length > 0 && typeof userRules.keywords[0] === 'string') {
      userRules.keywords = userRules.keywords.map(k => ({ value: k, enabled: true }));
      Logger.info('Migrated keywords to object format');
      await saveRules(); // Save the migrated format immediately
    }

    // Do same for patterns if we decide to toggle them later (good practice to start now)
    if (userRules.patterns.length > 0 && typeof userRules.patterns[0] === 'string') {
      userRules.patterns = userRules.patterns.map(p => ({ value: p, enabled: true }));
      Logger.info('Migrated patterns to object format');
      await saveRules();
    }

  } catch (error) {
    Logger.error('Failed to load rules', error);
  }
};

/**
 * Render all UI sections
 */
const renderAll = () => {
  renderKeywords();
  renderPatterns();
  renderDomains();
  renderStatistics();
};

/**
 * Setup navigation between sections
 */
const setupNavigation = () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;

      navItems.forEach(i => {
        i.classList.remove('active');
        i.setAttribute('aria-selected', 'false');
      });
      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`${sectionId}-section`).classList.add('active');
    });
  });
};

/**
 * Setup keyword management handlers
 */
const setupKeywordHandlers = () => {
  const keywordInput = document.getElementById('keywordInput');
  const addKeywordBtn = document.getElementById('addKeywordBtn');
  const keywordSearch = document.getElementById('keywordSearch');

  addKeywordBtn.addEventListener('click', () => addKeyword(keywordInput));
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeywordBtn.click();
  });

  // Search handler
  keywordSearch.addEventListener('input', (e) => {
    renderKeywords(e.target.value);
  });
};

/**
 * Setup pattern management handlers
 */
const setupPatternHandlers = () => {
  const patternInput = document.getElementById('patternInput');
  const addPatternBtn = document.getElementById('addPatternBtn');
  const testText = document.getElementById('testText');

  addPatternBtn.addEventListener('click', () => addPattern(patternInput));
  patternInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPatternBtn.click();
  });

  // Setup pattern tester
  patternInput.addEventListener('input', () => updateTestResult(patternInput, testText));
  testText.addEventListener('input', () => updateTestResult(patternInput, testText));

  // Search handler
  const patternSearch = document.getElementById('patternSearch');
  patternSearch.addEventListener('input', (e) => {
    renderPatterns(e.target.value);
  });
};

/**
 * Setup domain management handlers
 */
const setupDomainHandlers = () => {
  // Domain toggle handlers are set up in renderDomains()
  const domainSearch = document.getElementById('domainSearch');
  domainSearch.addEventListener('input', (e) => {
    renderDomains(e.target.value);
  });
};

/**
 * Setup general settings handlers
 */
const setupGeneralSettingsHandlers = () => {
  const themeSelect = document.getElementById('themeSelect');
  const showBadgeToggle = document.getElementById('showBadgeToggle');

  // Initialize values
  themeSelect.value = generalSettings.theme;
  showBadgeToggle.checked = generalSettings.showBadge;

  // Theme handler
  themeSelect.addEventListener('change', async (e) => {
    generalSettings.theme = e.target.value;
    applyTheme(generalSettings.theme);
    await saveGeneralSettings();
  });

  // Badge handler
  showBadgeToggle.addEventListener('change', async (e) => {
    generalSettings.showBadge = e.target.checked;
    await saveGeneralSettings();
    // Notify background script to update badge
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE_SETTINGS', showBadge: generalSettings.showBadge });
  });

  // Reset Settings handler
  const resetBtn = document.getElementById('resetSettingsBtn');
  resetBtn.addEventListener('click', () => {
    showConfirmationModal('本当にすべての設定をリセットしますか？\nこの操作は取り消せません。', resetToDefaults);
  });
};

/**
 * Reset all settings to default
 */
const resetToDefaults = async () => {
  try {
    // Reset state variables
    userRules = JSON.parse(JSON.stringify(DEFAULT_USER_RULES));
    domainRules = JSON.parse(JSON.stringify(SUPPORTED_DOMAINS));
    generalSettings = { ...DEFAULT_GENERAL_SETTINGS };

    // Save to storage
    await saveRules();
    await saveGeneralSettings();

    // Re-render
    renderAll();

    // Update settings UI inputs
    document.getElementById('themeSelect').value = generalSettings.theme;
    document.getElementById('showBadgeToggle').checked = generalSettings.showBadge;

    applyTheme(generalSettings.theme);

    showToast('設定を初期化しました');
  } catch (error) {
    Logger.error('Failed to reset settings', error);
    showToast('リセットに失敗しました', 'error');
  }
};

/**
 * Apply theme to the page
 * @param {string} theme - 'dark' or 'light'
 */
const applyTheme = (theme) => {
  document.body.setAttribute('data-theme', theme);
  // Implementation for theme switching logic via CSS variables would go here
  // For now we just set the attribute
};
const setupImportExport = () => {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImport);
};

/**
 * Add a keyword to the list
 * @param {HTMLInputElement} input - Keyword input element
 */
const addKeyword = async (input) => {
  const value = input.value.trim();
  if (!value) return;

  // Check for duplicates (stored as objects now)
  if (userRules.keywords.some(k => k.value === value)) {
    showToast('このキーワードは既に登録されています', 'warning');
    return;
  }

  userRules.keywords.push({ value: value, enabled: true });
  input.value = '';
  await saveAndRender();
  showToast('キーワードを追加しました');
};

/**
 * Delete a keyword
 * @param {number} index - Index of keyword to delete
 */
const deleteKeyword = async (index) => {
  userRules.keywords.splice(index, 1);
  selectedKeywords.clear(); // Clear selection on delete
  await saveAndRender();
};

/**
 * Bulk delete keywords
 */
const deleteBulkKeywords = async () => {
  // Sort indices in descending order to avoid shift issues
  const indices = Array.from(selectedKeywords).sort((a, b) => b - a);
  indices.forEach(index => {
    userRules.keywords.splice(index, 1);
  });
  selectedKeywords.clear();
  await saveAndRender();
  showToast(`${indices.length}件のキーワードを削除しました`);
};

/**
 * Render keywords list
 * @param {string} filter - Search filter text
 */
const renderKeywords = (filter = '') => {
  const keywordsList = document.getElementById('keywordsList');
  // Only allow drag & drop when not filtering
  const isDraggable = !filter;

  let keywords = userRules.keywords;
  if (filter) {
    const lowerFilter = filter.toLowerCase();
    keywords = keywords.filter(k => {
      const val = typeof k === 'string' ? k : k.value;
      return val.toLowerCase().includes(lowerFilter);
    });
  }

  if (keywords.length === 0) {
    if (filter) {
      keywordsList.innerHTML = `
        <div class="empty-state">
            <p>検索結果が見つかりません</p>
        </div>`;
    } else {
      keywordsList.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            </svg>
            <p>キーワードが登録されていません</p>
            <span>上のフォームからキーワードを追加してください</span>
        </div>
        `;
    }
    return;
  }

  keywordsList.innerHTML = keywords
    .map((item, index) => {
      // Handle both old string format (fallback) and new object format
      const keyword = typeof item === 'string' ? item : item.value;
      const isEnabled = typeof item === 'string' ? true : item.enabled;

      return `
      <div class="item-card fade-in ${isEnabled ? '' : 'disabled'}" 
           style="animation-delay: ${index * 0.05}s" 
           data-index="${index}"
           draggable="${isDraggable}">
        ${isDraggable ? `
        <div class="drag-handle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
        </div>` : ''}
        <span class="item-text blurred" title="クリックして表示/非表示">${escapeHtml(keyword)}</span>
        <div class="item-actions">
            <label class="toggle-switch">
                <input type="checkbox" class="keyword-toggle" data-index="${index}" ${isEnabled ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
            <button class="btn btn-danger delete-keyword" data-index="${index}">削除</button>
        </div>
      </div>
    `})
    .join('');

  if (isDraggable) {
    setupDragAndDrop(keywordsList, 'keywords');
  }

  // Attach event listeners
  keywordsList.querySelectorAll('.delete-keyword').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      showConfirmationModal('このキーワードを削除しますか？', () => deleteKeyword(index));
    });
  });

  // Attach toggle listeners
  keywordsList.querySelectorAll('.keyword-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const index = parseInt(e.target.dataset.index);
      const isChecked = e.target.checked;

      // Update state
      if (typeof userRules.keywords[index] === 'object') {
        userRules.keywords[index].enabled = isChecked;
      } else {
        // Fallback migration if somehow still string
        userRules.keywords[index] = { value: userRules.keywords[index], enabled: isChecked };
      }

      // Update UI class without full re-render for better UX
      const card = e.target.closest('.item-card');
      if (isChecked) {
        card.classList.remove('disabled');
      } else {
        card.classList.add('disabled');
      }

      await saveRules();
    });
  });

  // Attach blur toggle listeners
  keywordsList.querySelectorAll('.item-text').forEach(text => {
    text.addEventListener('click', (e) => {
      e.target.classList.toggle('blurred');
      e.target.classList.toggle('revealed');
    });
  });
};

/**
 * Add a pattern to the list
 * @param {HTMLInputElement} input - Pattern input element
 */
const addPattern = async (input) => {
  const value = input.value.trim();
  if (!value) return;

  if (!RulesManager.isValidPattern(value)) {
    showToast('無効な正規表現です', 'error');
    return;
  }

  if (userRules.patterns.some(p => (typeof p === 'string' ? p : p.value) === value)) {
    showToast('この正規表現は既に登録されています', 'warning');
    return;
  }

  userRules.patterns.push({ value: value, enabled: true });
  input.value = '';
  await saveAndRender();
  showToast('正規表現を追加しました');
};

/**
 * Delete a pattern
 * @param {number} index - Index of pattern to delete
 */
const deletePattern = async (index) => {
  userRules.patterns.splice(index, 1);
  selectedPatterns.clear();
  await saveAndRender();
};

/**
 * Bulk delete patterns
 */
const deleteBulkPatterns = async () => {
  // Sort indices in descending order
  const indices = Array.from(selectedPatterns).sort((a, b) => b - a);
  indices.forEach(index => {
    userRules.patterns.splice(index, 1);
  });
  selectedPatterns.clear();
  await saveAndRender();
  showToast(`${indices.length}件の正規表現を削除しました`);
};

/**
 * Render patterns list
 * @param {string} filter - Search filter text
 */
const renderPatterns = (filter = '') => {
  const patternsList = document.getElementById('patternsList');
  // Only allow drag & drop when not filtering
  const isDraggable = !filter;

  let patterns = userRules.patterns;
  if (filter) {
    const lowerFilter = filter.toLowerCase();
    patterns = patterns.filter(p => {
      const val = typeof p === 'string' ? p : p.value;
      return val.toLowerCase().includes(lowerFilter);
    });
  }

  if (patterns.length === 0) {
    if (filter) {
      patternsList.innerHTML = `
        <div class="empty-state">
            <p>検索結果が見つかりません</p>
        </div>`;
    } else {
      patternsList.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
            </svg>
            <p>正規表現が登録されていません</p>
            <span>上のフォームから正規表現を追加してください</span>
        </div>
        `;
    }
    return;
  }

  patternsList.innerHTML = patterns
    .map((item, index) => {
      const pattern = typeof item === 'string' ? item : item.value;
      const isEnabled = typeof item === 'string' ? true : item.enabled;

      return `
      <div class="item-card fade-in ${isEnabled ? '' : 'disabled'}" 
           style="animation-delay: ${index * 0.05}s" 
           data-index="${index}"
           draggable="${isDraggable}">
        ${isDraggable ? `
        <div class="drag-handle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
        </div>` : ''}
        <span class="item-text blurred" title="クリックして表示/非表示">${escapeHtml(pattern)}</span>
        <div class="item-actions">
            <label class="toggle-switch">
                <input type="checkbox" class="pattern-toggle" data-index="${index}" ${isEnabled ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
            <button class="btn btn-danger delete-pattern" data-index="${index}">削除</button>
        </div>
      </div>
    `})
    .join('');

  if (isDraggable) {
    setupDragAndDrop(patternsList, 'patterns');
  }

  // Attach event listeners
  patternsList.querySelectorAll('.delete-pattern').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      showConfirmationModal('この正規表現パターンを削除しますか？', () => deletePattern(index));
    });
  });

  // Attach toggle listeners
  patternsList.querySelectorAll('.pattern-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const index = parseInt(e.target.dataset.index);
      const isChecked = e.target.checked;

      // Update state
      if (typeof userRules.patterns[index] === 'object') {
        userRules.patterns[index].enabled = isChecked;
      } else {
        userRules.patterns[index] = { value: userRules.patterns[index], enabled: isChecked };
      }

      // Update UI class
      const card = e.target.closest('.item-card');
      if (isChecked) {
        card.classList.remove('disabled');
      } else {
        card.classList.add('disabled');
      }

      await saveRules();
    });
  });

  // Attach blur toggle listeners
  patternsList.querySelectorAll('.item-text').forEach(text => {
    text.addEventListener('click', (e) => {
      e.target.classList.toggle('blurred');
      e.target.classList.toggle('revealed');
    });
  });
};

/**
 * Update pattern test result
 * @param {HTMLInputElement} patternInput - Pattern input element
 * @param {HTMLInputElement} testText - Test text input element
 */
const updateTestResult = (patternInput, testText) => {
  const testResult = document.getElementById('testResult');
  const pattern = patternInput.value.trim();
  const text = testText.value;

  if (!pattern || !text) {
    testResult.classList.add('hidden');
    return;
  }

  const matches = RulesManager.testPattern(pattern, text);

  if (matches === null) {
    testResult.className = 'test-result error';
    testResult.innerHTML = `
      <span class="test-icon">✗</span>
      <span class="test-message">無効な正規表現</span>
    `;
  } else if (matches && matches.length > 0) {
    testResult.className = 'test-result success';
    testResult.innerHTML = `
      <span class="test-icon">✓</span>
      <span class="test-message">${matches.length}件マッチ: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}</span>
    `;
  } else {
    testResult.className = 'test-result warning';
    testResult.innerHTML = `
      <span class="test-icon">−</span>
      <span class="test-message">マッチしませんでした</span>
    `;
  }
};

/**
 * Render domains list
 * @param {string} filter - Search filter text
 */
const renderDomains = (filter = '') => {
  const domainCards = document.getElementById('domainCards');

  let entries = Object.entries(domainRules);
  if (filter) {
    const lowerFilter = filter.toLowerCase();
    entries = entries.filter(([key, domain]) => {
      return domain.name.toLowerCase().includes(lowerFilter) ||
        domain.matches.some(m => m.toLowerCase().includes(lowerFilter));
    });
  }

  domainCards.innerHTML = entries
    .map(([key, domain], index) => `
      <div class="domain-card fade-in" style="animation-delay: ${index * 0.05}s" data-domain="${key}">
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
              <div class="domain-card-url">${domain.matches.join(', ')}</div>
            </div>
          </div>
          <label class="domain-toggle">
            <input type="checkbox" ${domain.enabled ? 'checked' : ''} data-domain="${key}">
            <span class="domain-toggle-slider"></span>
          </label>
        </div>
        ${domain.selectors && domain.selectors.length > 0 ? `
          <div class="domain-card-selectors">
            <div class="domain-card-selectors-title">隠蔽セレクタ</div>
            <div class="selector-tags">
              ${domain.selectors.map(s => `<span class="selector-tag">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `)
    .join('');

  // Attach event listeners for domain toggles
  domainCards.querySelectorAll('.domain-toggle input').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const domainKey = e.target.dataset.domain;
      domainRules[domainKey].enabled = e.target.checked;
      await saveRules();
      showToast(`${domainRules[domainKey].name} を${e.target.checked ? '有効' : '無効'}にしました`);
    });
  });
};

/**
 * Save rules to storage
 */
/**
 * Save general settings to storage
 */
const saveGeneralSettings = async () => {
  try {
    await StorageManager.set({ [STORAGE_KEYS.GENERAL_SETTINGS]: generalSettings });
    showToast('設定を保存しました');
  } catch (error) {
    Logger.error('Failed to save settings', error);
    showToast('保存に失敗しました', 'error');
  }
};

/**
 * Save rules to storage
 */
const saveRules = async () => {
  try {
    await StorageManager.setUserRules(userRules);
    await StorageManager.setDomainRules(domainRules);
  } catch (error) {
    Logger.error('Failed to save rules', error);
    showToast('保存に失敗しました', 'error');
  }
};

/**
 * Save rules and re-render UI
 */
const saveAndRender = async () => {
  await saveRules();
  renderKeywords();
  renderPatterns();
};

/**
 * Setup keyboard shortcuts
 */
const setupKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Ctrl+S / Cmd+S to save (though auto-save is on, manual save gives feedback)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveAndRender();
      showToast('設定を保存しました');
    }

    // Escape to close modal
    if (e.key === 'Escape') {
      const modal = document.getElementById('confirmationModal');
      if (modal.classList.contains('show')) {
        closeModal();
      }
    }
  });
};

/**
 * Render statistics
 */
const renderStatistics = async () => {
  try {
    // In a real app, we'd fetch these from storage where the background script saves them
    // For now, let's look for a stats object or use placeholders
    const stats = (await StorageManager.get('stats')).stats || {
      totalBlocked: 0,
      keywordBlocked: 0,
      patternBlocked: 0
    };

    document.getElementById('totalBlockedCount').textContent = stats.totalBlocked.toLocaleString();
    document.getElementById('keywordBlockedCount').textContent = stats.keywordBlocked.toLocaleString();
    document.getElementById('patternBlockedCount').textContent = stats.patternBlocked.toLocaleString();
  } catch (error) {
    Logger.error('Failed to load statistics', error);
  }
};

/**
 * Setup drag and drop functionality
* @param {HTMLElement} container - Container element
* @param {string} ruleType - 'keywords' or 'patterns'
*/
const setupDragAndDrop = (container, ruleType) => {
  let draggedItem = null;

  const items = container.querySelectorAll('.item-card');

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.index);
      setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', () => {
      draggedItem = null;
      items.forEach(i => i.classList.remove('dragging', 'drag-over'));
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (item === draggedItem) return;

      const rect = item.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      item.classList.add('drag-over');

      // Visual feedback for insertion point
      if (e.clientY < midpoint) {
        item.style.borderTop = '2px solid var(--accent-primary)';
        item.style.borderBottom = '';
      } else {
        item.style.borderTop = '';
        item.style.borderBottom = '2px solid var(--accent-primary)';
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
      item.style.borderTop = '';
      item.style.borderBottom = '';
    });

    item.addEventListener('drop', async (e) => {
      e.preventDefault();
      item.style.borderTop = '';
      item.style.borderBottom = '';

      if (item === draggedItem) return;

      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = parseInt(item.dataset.index);

      // Reorder array
      const list = userRules[ruleType];
      const [movedItem] = list.splice(fromIndex, 1);

      // Calculate actual insertion index
      // If dragging from top to bottom, index shifts by -1 after removal
      // But we can simply use splicing logic:
      // Insert at toIndex.

      /* 
         However, standard behavior depends on drop position (above/below).
         For simplicity in this v1 implementation, we'll swap or insert.
         Let's use a simpler "move to position" logic.
      */

      list.splice(toIndex, 0, movedItem);

      await saveAndRender();
    });
  });
};

/**
 * Handle export functionality
 */
const handleExport = () => {
  try {
    const data = createExportData(userRules, domainRules, CONFIG_VERSION);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-guard-settings-${formatDateForFilename()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('設定をエクスポートしました');
  } catch (error) {
    Logger.error('Failed to export settings', error);
    showToast('エクスポートに失敗しました', 'error');
  }
};

/**
 * Handle import functionality
 * @param {Event} e - File input change event
 */
const handleImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = parseImportData(text);

    if (!data) {
      showToast('無効なファイル形式です', 'error');
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
    showToast('設定をインポートしました');
  } catch (error) {
    Logger.error('Failed to import settings', error);
    showToast('インポートに失敗しました: ' + error.message, 'error');
  } finally {
    e.target.value = '';
  }
};

/**
 * Show confirmation modal
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Callback when confirmed
 */
const showConfirmationModal = (message, onConfirm) => {
  const modal = document.getElementById('confirmationModal');
  const modalMessage = document.getElementById('modalMessage');
  const cancelBtn = document.getElementById('modalCancelBtn');
  const confirmBtn = document.getElementById('modalConfirmBtn');

  modalMessage.textContent = message;
  modal.classList.remove('hidden');
  // Force reflow
  void modal.offsetWidth;
  modal.classList.add('show');

  // Clean up previous listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  // Add new listeners
  newConfirmBtn.addEventListener('click', async () => {
    closeModal();
    await onConfirm();
  });

  newCancelBtn.addEventListener('click', closeModal);

  // Check if clicked outside
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
};

/**
 * Close modal
 */
const closeModal = () => {
  const modal = document.getElementById('confirmationModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
};

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} [type='success'] - Toast type (success, error, warning)
 */
const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const icon = toast.querySelector('.toast-icon');

  toastMessage.textContent = message;
  toast.classList.remove('hidden');

  // Set icon and color based on type
  if (type === 'success') {
    toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    icon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
  } else if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    icon.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>';
  } else if (type === 'warning') {
    toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    icon.innerHTML = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>';
  }

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
