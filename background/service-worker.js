/**
 * Smart Links Manager - Background Service Worker (Manifest V3)
 */

// Initialize default data and context menus on installation
chrome.runtime.onInstalled.addListener(async () => {
  // Set up default categories and sample welcome link if first run
  const data = await chrome.storage.local.get(['links', 'categories', 'theme']);
  
  if (!data.categories) {
    await chrome.storage.local.set({
      categories: ['Work', 'Development', 'Design', 'Reading', 'Personal', 'Tools']
    });
  }

  if (!data.links) {
    const welcomeLinks = [
      {
        id: 'link_' + Date.now(),
        title: 'Chrome Web Store Developer Dashboard',
        url: 'https://chrome.google.com/webstore/devconsole',
        category: 'Development',
        tags: ['chrome', 'store', 'publishing'],
        notes: 'Publish and manage Chrome Extensions',
        pinned: true,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'link_' + (Date.now() + 1),
        title: 'Chrome Extensions Documentation',
        url: 'https://developer.chrome.com/docs/extensions/',
        category: 'Development',
        tags: ['docs', 'manifest-v3', 'api'],
        notes: 'Official Google guide and API reference for Manifest V3',
        pinned: false,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'link_' + (Date.now() + 2),
        title: 'GitHub',
        url: 'https://github.com',
        category: 'Tools',
        tags: ['git', 'code', 'collaboration'],
        notes: 'Code hosting and version control',
        pinned: false,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    await chrome.storage.local.set({ links: welcomeLinks });
  }

  if (!data.theme) {
    await chrome.storage.local.set({ theme: 'dark' });
  }

  // Create context menus for quick saving
  chrome.contextMenus.create({
    id: 'smart-links-save-page',
    title: 'Bookmark Page to Smart Links',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'smart-links-save-link',
    title: 'Save Link to Smart Links',
    contexts: ['link']
  });

  await updateBadge();
});

// Handle Context Menu Actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let targetUrl = '';
  let targetTitle = '';

  if (info.menuItemId === 'smart-links-save-link' && info.linkUrl) {
    targetUrl = info.linkUrl;
    targetTitle = info.selectionText || info.linkUrl;
  } else if (info.menuItemId === 'smart-links-save-page' && tab) {
    targetUrl = tab.url || info.pageUrl;
    targetTitle = tab.title || targetUrl;
  }

  if (!targetUrl || targetUrl.startsWith('chrome://')) return;

  const { links = [] } = await chrome.storage.local.get('links');
  
  // Check if link already exists
  const exists = links.some(l => l.url.toLowerCase() === targetUrl.toLowerCase());
  if (!exists) {
    const newLink = {
      id: 'link_' + Date.now(),
      title: targetTitle || targetUrl,
      url: targetUrl,
      category: 'Personal',
      tags: ['quick-save'],
      notes: '',
      pinned: false,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    links.unshift(newLink);
    await chrome.storage.local.set({ links });
  }

  // Show badge confirmation flash
  await flashBadge('✓', '#10B981');
  await updateBadge();
});

// Listen to storage changes to keep badge count in sync
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.links) {
    updateBadge();
  }
});

// Helper: Update extension badge with total link count
async function updateBadge() {
  const { links = [] } = await chrome.storage.local.get('links');
  const count = links.length;
  const badgeText = count > 0 ? String(count) : '';
  await chrome.action.setBadgeText({ text: badgeText });
  await chrome.action.setBadgeBackgroundColor({ color: '#6366F1' });
}

// Helper: Flash badge temporarily for action confirmation
async function flashBadge(text, color) {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(async () => {
    await updateBadge();
  }, 1500);
}
