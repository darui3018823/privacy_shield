document.addEventListener('DOMContentLoaded', async () => {
    const globalToggle = document.getElementById('globalToggle');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const hiddenCount = document.getElementById('hiddenCount');
    const currentDomain = document.getElementById('currentDomain');
    const domainStatus = document.getElementById('domainStatus');
    const expandBtn = document.getElementById('expandBtn');
    const hiddenList = document.getElementById('hiddenList');
    const blurOverlay = document.getElementById('blurOverlay');
    const revealBtn = document.getElementById('revealBtn');
    const itemsContent = document.getElementById('itemsContent');
    const openSettings = document.getElementById('openSettings');

    const supportedDomains = ['google.com', 'google.co.jp', 'gemini.google.com', 'amazon.co.jp'];

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let tabDomain = '';

    try {
        const url = new URL(tab.url);
        tabDomain = url.hostname.replace('www.', '');

        // Friendly Name Mapping
        let displayName = tabDomain;
        if (tabDomain.includes('gemini.google.com')) {
            displayName = 'Google Gemini';
        } else if (tabDomain.includes('google.com') || tabDomain.includes('google.co.jp')) {
            displayName = 'Google Search';
        } else if (tabDomain.includes('amazon.co.jp')) {
            displayName = 'Amazon.co.jp';
        }
        currentDomain.textContent = displayName;

        // Favicon Logic
        const domainIconContainer = document.querySelector('.domain-icon');
        const faviconUrl = tab.favIconUrl;

        if (faviconUrl) {
            domainIconContainer.innerHTML = `<img src="${faviconUrl}" alt="favicon">`;
        } else {
            // Default Icon (SVG) - already present in HTML, but we keep the structure just in case
            domainIconContainer.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
             `;
        }


        const isSupported = supportedDomains.some(d => tabDomain.includes(d));
        if (!isSupported) {
            domainStatus.classList.add('unsupported');
            domainStatus.querySelector('.domain-badge').textContent = '未対応';
        }
    } catch (e) {
        currentDomain.textContent = '不明';
        domainStatus.classList.add('unsupported');
        domainStatus.querySelector('.domain-badge').textContent = '不明';
    }

    const loadState = async () => {
        const { isPaused, hiddenCount: count, hiddenItems } = await chrome.storage.local.get([
            'isPaused',
            'hiddenCount',
            'hiddenItems'
        ]);

        globalToggle.checked = !isPaused;
        updateStatusUI(!isPaused);
        hiddenCount.textContent = count || 0;

        if (hiddenItems && hiddenItems.length > 0) {
            renderHiddenItems(hiddenItems);
        }
    };

    const updateStatusUI = (isActive) => {
        if (isActive) {
            statusCard.classList.remove('paused');
            statusText.textContent = '保護中';
        } else {
            statusCard.classList.add('paused');
            statusText.textContent = '一時停止';
        }
    };

    const renderHiddenItems = (items) => {
        if (!items || items.length === 0) {
            itemsContent.innerHTML = '<p class="no-items">隠蔽されたアイテムはありません</p>';
            return;
        }

        itemsContent.innerHTML = items.map(item =>
            `<div class="hidden-item">${escapeHtml(item)}</div>`
        ).join('');
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    globalToggle.addEventListener('change', async (e) => {
        const isActive = e.target.checked;
        await chrome.storage.local.set({ isPaused: !isActive });
        updateStatusUI(isActive);
        if (!isActive) {
            chrome.action.setBadgeText({ text: '' });
        }
    });

    expandBtn.addEventListener('click', () => {
        const isExpanded = hiddenList.classList.toggle('show');
        expandBtn.classList.toggle('expanded', isExpanded);
    });
    revealBtn.addEventListener('click', () => {
        blurOverlay.classList.add('hidden');
    });
    openSettings.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;

        if (changes.hiddenCount) {
            hiddenCount.textContent = changes.hiddenCount.newValue || 0;
        }

        if (changes.hiddenItems) {
            renderHiddenItems(changes.hiddenItems.newValue || []);
        }
    });
    await loadState();
});
