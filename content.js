(() => {
  'use strict';

  let isPaused = false;
  let hiddenItemsSet = new Set();
  let updateTimeout = null;
  let toastShown = false;
  let currentDomainRules = null;
  let userRules = null;

  const init = async () => {
    const stored = await chrome.storage.local.get(['isPaused', 'rules', 'userRules']);
    isPaused = stored.isPaused || false;
    userRules = stored.userRules || { keywords: [], patterns: [] };

    await loadDomainRules();

    updateBodyClass();
    if (!isPaused) {
      runHidingLogic();
    }

    chrome.storage.onChanged.addListener(handleStorageChange);

    const observer = new MutationObserver(() => {
      if (!isPaused) {
        runHidingLogic();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const loadDomainRules = async () => {
    try {
      const stored = await chrome.storage.local.get(['domainRules']);
      const hostname = window.location.hostname;

      if (stored.domainRules) {
        for (const [key, domain] of Object.entries(stored.domainRules)) {
          if (domain.matches && domain.matches.some(m => hostname.includes(m))) {
            currentDomainRules = domain;
            return;
          }
        }
      }

      const defaultRules = await fetch(chrome.runtime.getURL('rules.json')).then(r => r.json());
      for (const [key, domain] of Object.entries(defaultRules.domains)) {
        if (domain.matches && domain.matches.some(m => hostname.includes(m))) {
          currentDomainRules = domain;
          return;
        }
      }
    } catch (e) {
      console.error('[Privacy Guard] Failed to load rules:', e);
    }
  };

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

  const updateBodyClass = () => {
    if (isPaused) {
      document.body.classList.add('privacy-guard-paused');
    } else {
      document.body.classList.remove('privacy-guard-paused');
    }
  };

  const unhideAll = () => {
    document.querySelectorAll('[data-privacy-hidden]').forEach(el => {
      el.style.display = '';
      el.removeAttribute('data-privacy-hidden');
    });
  };

  const updateBadge = (count) => {
    try {
      chrome.runtime.sendMessage({ type: 'UPDATE_COUNT', count });
    } catch (e) {
    }
  };

  const saveHiddenItems = () => {
    chrome.storage.local.set({
      hiddenCount: hiddenItemsSet.size,
      hiddenItems: Array.from(hiddenItemsSet)
    });
    updateBadge(hiddenItemsSet.size);
  };

  const hideElement = (el, reason) => {
    if (el.style.display === 'none' || el.hasAttribute('data-privacy-hidden')) return false;

    el.style.display = 'none';
    el.setAttribute('data-privacy-hidden', 'true');

    const itemText = el.innerText?.substring(0, 50) || reason || 'Hidden Item';
    if (!hiddenItemsSet.has(itemText)) {
      hiddenItemsSet.add(itemText);
      return true;
    }
    return false;
  };

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
      } catch (e) {
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
          let target = node.parentElement;
          while (target && target.innerText && target.innerText.length < 100) {
            if (target.parentElement && target.parentElement.innerText.length < 200) {
              target = target.parentElement;
            } else {
              break;
            }
          }
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

  const hideByPatterns = (patterns) => {
    if (!patterns || patterns.length === 0) return false;

    let changed = false;
    const regexes = patterns.map(p => {
      try {
        return new RegExp(p, 'g');
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    if (regexes.length === 0) return false;

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
          let target = node.parentElement;
          while (target && target.innerText && target.innerText.length < 100) {
            if (target.parentElement && target.parentElement.innerText.length < 200) {
              target = target.parentElement;
            } else {
              break;
            }
          }
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
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const runHidingLogic = () => {
    if (isPaused || !currentDomainRules) return;

    let changed = false;

    if (currentDomainRules.enabled === false) return;

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
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(saveHiddenItems, 500);
      showToast();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
