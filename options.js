// Universal Privacy Shield - Options Page Script

document.addEventListener('DOMContentLoaded', async () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    const keywordInput = document.getElementById('keywordInput');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const keywordsList = document.getElementById('keywordsList');

    const patternInput = document.getElementById('patternInput');
    const addPatternBtn = document.getElementById('addPatternBtn');
    const patternsList = document.getElementById('patternsList');
    const testText = document.getElementById('testText');
    const testResult = document.getElementById('testResult');

    const domainCards = document.getElementById('domainCards');

    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    let userRules = { keywords: [], patterns: [] };
    let domainRules = {};

    const defaultDomains = {
        google: {
            name: 'Google検索',
            matches: ['www.google.com', 'www.google.co.jp'],
            enabled: true,
            selectors: ['.O4T6Pe', '.vqkKIe', '.eKPi4', 'update-location', '.dfB0uf']
        },
        amazon: {
            name: 'Amazon.co.jp',
            matches: ['www.amazon.co.jp'],
            enabled: true,
            selectors: []
        }
    };

    const init = async () => {
        const stored = await chrome.storage.local.get(['userRules', 'domainRules']);
        userRules = stored.userRules || { keywords: [], patterns: [] };
        domainRules = stored.domainRules || defaultDomains;

        renderKeywords();
        renderPatterns();
        renderDomains();
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;

            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${sectionId}-section`).classList.add('active');
        });
    });

    // Manage Keywords
    const renderKeywords = () => {
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

        keywordsList.innerHTML = userRules.keywords.map((keyword, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(keyword)}</span>
        <button class="btn btn-danger delete-keyword" data-index="${index}">削除</button>
      </div>
    `).join('');

        keywordsList.querySelectorAll('.delete-keyword').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                userRules.keywords.splice(index, 1);
                saveAndRender();
            });
        });
    };

    addKeywordBtn.addEventListener('click', () => {
        const value = keywordInput.value.trim();
        if (!value) return;

        if (userRules.keywords.includes(value)) {
            showToast('このキーワードは既に登録されています', 'warning');
            return;
        }

        userRules.keywords.push(value);
        keywordInput.value = '';
        saveAndRender();
        showToast('キーワードを追加しました');
    });

    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addKeywordBtn.click();
    });

    const renderPatterns = () => {
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

        patternsList.innerHTML = userRules.patterns.map((pattern, index) => `
      <div class="item-card" data-index="${index}">
        <span class="item-text">${escapeHtml(pattern)}</span>
        <button class="btn btn-danger delete-pattern" data-index="${index}">削除</button>
      </div>
    `).join('');

        patternsList.querySelectorAll('.delete-pattern').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                userRules.patterns.splice(index, 1);
                saveAndRender();
            });
        });
    };

    addPatternBtn.addEventListener('click', () => {
        const value = patternInput.value.trim();
        if (!value) return;

        try {
            new RegExp(value);
        } catch (e) {
            showToast('無効な正規表現です: ' + e.message, 'error');
            return;
        }

        if (userRules.patterns.includes(value)) {
            showToast('この正規表現は既に登録されています', 'warning');
            return;
        }

        userRules.patterns.push(value);
        patternInput.value = '';
        saveAndRender();
        showToast('正規表現を追加しました');
    });

    patternInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPatternBtn.click();
    });

    const updateTestResult = () => {
        const pattern = patternInput.value.trim();
        const text = testText.value;

        if (!pattern || !text) {
            testResult.classList.add('hidden');
            return;
        }

        try {
            const regex = new RegExp(pattern, 'g');
            const matches = text.match(regex);

            if (matches && matches.length > 0) {
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
        } catch (e) {
            testResult.className = 'test-result error';
            testResult.innerHTML = `
        <span class="test-icon">✗</span>
        <span class="test-message">無効な正規表現: ${e.message}</span>
      `;
        }
    };

    patternInput.addEventListener('input', updateTestResult);
    testText.addEventListener('input', updateTestResult);

    const renderDomains = () => {
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
    `).join('');

        domainCards.querySelectorAll('.domain-toggle input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const domainKey = e.target.dataset.domain;
                domainRules[domainKey].enabled = e.target.checked;
                saveRules();
                showToast(`${domainRules[domainKey].name} を${e.target.checked ? '有効' : '無効'}にしました`);
            });
        });
    };

    const saveRules = async () => {
        await chrome.storage.local.set({ userRules, domainRules });
    };

    const saveAndRender = async () => {
        await saveRules();
        renderKeywords();
        renderPatterns();
    };

    exportBtn.addEventListener('click', () => {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            userRules,
            domainRules
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privacy-guard-settings-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('設定をエクスポートしました');
    });

    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (data.userRules) {
                userRules = data.userRules;
            }
            if (data.domainRules) {
                domainRules = { ...domainRules, ...data.domainRules };
            }

            await saveRules();
            renderKeywords();
            renderPatterns();
            renderDomains();

            showToast('設定をインポートしました');
        } catch (e) {
            showToast('インポートに失敗しました: ' + e.message, 'error');
        }

        importFile.value = '';
    });

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const showToast = (message, type = 'success') => {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');

        const icon = toast.querySelector('.toast-icon');
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

    await init();
});
