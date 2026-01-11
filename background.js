// Universal Privacy Shield - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });

    chrome.storage.local.get(['userRules'], (result) => {
        if (!result.userRules) {
            chrome.storage.local.set({
                userRules: {
                    keywords: [],
                    patterns: []
                },
                isPaused: false
            });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPDATE_COUNT') {
        const count = request.count;
        const tabId = sender.tab?.id;

        if (tabId) {
            if (count > 0) {
                chrome.action.setBadgeText({ text: count.toString(), tabId });
                chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
            } else {
                chrome.action.setBadgeText({ text: '', tabId });
            }
        }
    }

    if (request.type === 'GET_RULES') {
        chrome.storage.local.get(['userRules', 'domainRules'], (result) => {
            sendResponse(result);
        });
        return true;
    }

    if (request.type === 'SAVE_RULES') {
        chrome.storage.local.set({
            userRules: request.userRules,
            domainRules: request.domainRules
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        chrome.action.setBadgeText({ text: '', tabId });
    }
});
