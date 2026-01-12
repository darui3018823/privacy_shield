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
import { SUPPORTED_DOMAINS } from '../config/config.js';
import { CONFIG_VERSION } from '../config/constants.js';

// State variables
let userRules = { keywords: [], patterns: [] };
let domainRules = {};

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
    setupImportExport();
  } catch (error) {
    Logger.error('Failed to initialize options page', error);
  }
};

/**
 * Load rules from storage
 */
const loadRules = async () => {
  try {
    userRules = await StorageManager.getUserRules();
    domainRules = (await StorageManager.getDomainRules()) || SUPPORTED_DOMAINS;
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

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

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

  addKeywordBtn.addEventListener('click', () => addKeyword(keywordInput));
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeywordBtn.click();
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
};

/**
 * Setup domain management handlers
 */
const setupDomainHandlers = () => {
  // Domain toggle handlers are set up in renderDomains()
};

/**
 * Setup import/export functionality
 */
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

  if (userRules.keywords.includes(value)) {
    showToast('このキーワードは既に登録されています', 'warning');
    return;
  }

  userRules.keywords.push(value);
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
  await saveAndRender();
};

/**
 * Render keywords list
 */
const renderKeywords = () => {
  const keywordsList = document.getElementById('keywordsList');

  if (userRules.keywords.length === 0) {
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
    return;
  }

  keywordsList.innerHTML = userRules.keywords
    .map((keyword, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(keyword)}</span>
        <button class="btn btn-danger delete-keyword" data-index="${index}">削除</button>
      </div>
    `)
    .join('');

  // Attach event listeners
  keywordsList.querySelectorAll('.delete-keyword').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteKeyword(index);
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

  if (userRules.patterns.includes(value)) {
    showToast('この正規表現は既に登録されています', 'warning');
    return;
  }

  userRules.patterns.push(value);
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
  await saveAndRender();
};

/**
 * Render patterns list
 */
const renderPatterns = () => {
  const patternsList = document.getElementById('patternsList');

  if (userRules.patterns.length === 0) {
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
    return;
  }

  patternsList.innerHTML = userRules.patterns
    .map((pattern, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(pattern)}</span>
        <button class="btn btn-danger delete-pattern" data-index="${index}">削除</button>
      </div>
    `)
    .join('');

  // Attach event listeners
  patternsList.querySelectorAll('.delete-pattern').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deletePattern(index);
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
 */
const renderDomains = () => {
  const domainCards = document.getElementById('domainCards');

  domainCards.innerHTML = Object.entries(domainRules)
    .map(([key, domain]) => `
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
