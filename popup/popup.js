/**
 * Smart Links Manager - Popup Controller
 * Full CRUD, Filter, Search, Sort, Import/Export, and Theme Engine
 */

// Application State
const state = {
  links: [],
  categories: ['Work', 'Development', 'Design', 'Reading', 'Personal', 'Tools'],
  currentTab: null,
  activeFilter: 'all', // 'all', 'pinned', or category name
  searchQuery: '',
  sortBy: 'recent',
  theme: 'dark',
  editingLinkId: null
};

// DOM Elements Cache
const elements = {
  // Themes & Headers
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  iconThemeDark: document.getElementById('icon-theme-dark'),
  iconThemeLight: document.getElementById('icon-theme-light'),
  btnBackupOpen: document.getElementById('btn-backup-open'),
  btnAddCustomLink: document.getElementById('btn-add-custom-link'),

  // Quick Save Bar
  currentTabFavicon: document.getElementById('current-tab-favicon'),
  currentTabFaviconFallback: document.getElementById('current-tab-favicon-fallback'),
  currentTabTitle: document.getElementById('current-tab-title'),
  btnQuickSave: document.getElementById('btn-quick-save'),
  quickSaveBtnText: document.getElementById('quick-save-btn-text'),

  // Search & Filter
  searchInput: document.getElementById('search-input'),
  btnSearchClear: document.getElementById('btn-search-clear'),
  categoriesList: document.getElementById('categories-list'),
  sortSelect: document.getElementById('sort-select'),
  linksCountBadge: document.getElementById('links-count-badge'),
  activeFilterLabel: document.getElementById('active-filter-label'),
  btnOpenAllCategory: document.getElementById('btn-open-all-category'),

  // Lists & Empty State
  linksContainer: document.getElementById('links-container'),
  emptyState: document.getElementById('empty-state'),
  emptyStateSubtitle: document.getElementById('empty-state-subtitle'),
  btnEmptyAdd: document.getElementById('btn-empty-add'),

  // Link Add/Edit Modal
  linkModal: document.getElementById('link-modal'),
  modalTitle: document.getElementById('modal-title'),
  linkForm: document.getElementById('link-form'),
  linkIdField: document.getElementById('link-id-field'),
  linkUrlField: document.getElementById('link-url-field'),
  linkTitleField: document.getElementById('link-title-field'),
  linkCategoryField: document.getElementById('link-category-field'),
  linkNewCategoryField: document.getElementById('link-new-category-field'),
  linkTagsField: document.getElementById('link-tags-field'),
  linkNotesField: document.getElementById('link-notes-field'),
  linkPinnedField: document.getElementById('link-pinned-field'),
  btnFetchTabUrl: document.getElementById('btn-fetch-tab-url'),
  btnModalClose: document.getElementById('btn-modal-close'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  urlError: document.getElementById('url-error'),

  // Backup Modal
  backupModal: document.getElementById('backup-modal'),
  btnBackupClose: document.getElementById('btn-backup-close'),
  btnExportJson: document.getElementById('btn-export-json'),
  importFileInput: document.getElementById('import-file-input'),
  btnResetAll: document.getElementById('btn-reset-all'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadStateFromStorage();
  applyTheme(state.theme);
  await fetchActiveTabInfo();
  renderCategories();
  renderLinks();
  bindEvents();
});

// Load stored state
async function loadStateFromStorage() {
  const data = await chrome.storage.local.get(['links', 'categories', 'theme', 'sortBy']);
  if (data.links) state.links = data.links;
  if (data.categories) state.categories = data.categories;
  if (data.theme) state.theme = data.theme;
  if (data.sortBy) {
    state.sortBy = data.sortBy;
    elements.sortSelect.value = state.sortBy;
  }
}

// Fetch Active Tab Info
async function fetchActiveTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && !tab.url.startsWith('chrome://')) {
      state.currentTab = {
        title: tab.title || 'Current Webpage',
        url: tab.url,
        favIconUrl: tab.favIconUrl || getFaviconUrl(tab.url)
      };

      elements.currentTabTitle.textContent = state.currentTab.title;
      elements.currentTabTitle.title = `${state.currentTab.title} (${state.currentTab.url})`;

      if (state.currentTab.favIconUrl) {
        elements.currentTabFavicon.src = state.currentTab.favIconUrl;
        elements.currentTabFavicon.classList.remove('hidden');
        elements.currentTabFaviconFallback.classList.add('hidden');
        elements.currentTabFavicon.onerror = () => {
          elements.currentTabFavicon.classList.add('hidden');
          elements.currentTabFaviconFallback.classList.remove('hidden');
        };
      } else {
        elements.currentTabFavicon.classList.add('hidden');
        elements.currentTabFaviconFallback.classList.remove('hidden');
      }

      // Check if current tab is already saved
      const isAlreadySaved = state.links.some(l => l.url.toLowerCase() === state.currentTab.url.toLowerCase());
      if (isAlreadySaved) {
        elements.btnQuickSave.classList.add('saved');
        elements.quickSaveBtnText.textContent = 'Saved ✓';
      } else {
        elements.btnQuickSave.classList.remove('saved');
        elements.quickSaveBtnText.textContent = 'Save Tab';
      }
    } else {
      elements.currentTabTitle.textContent = 'Active tab unavailable (Internal / New tab)';
      elements.btnQuickSave.disabled = true;
      elements.btnQuickSave.style.opacity = '0.5';
      elements.currentTabFavicon.classList.add('hidden');
      elements.currentTabFaviconFallback.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to get active tab:', err);
  }
}

// Bind Event Listeners
function bindEvents() {
  // Theme Toggle
  elements.btnThemeToggle.addEventListener('click', async () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    await chrome.storage.local.set({ theme: state.theme });
  });

  // Quick Save Button
  elements.btnQuickSave.addEventListener('click', async () => {
    if (!state.currentTab || !state.currentTab.url) return;
    
    // Check if already saved
    const existingIndex = state.links.findIndex(l => l.url.toLowerCase() === state.currentTab.url.toLowerCase());
    if (existingIndex !== -1) {
      showToast('Already saved in Smart Links!');
      return;
    }

    const newLink = {
      id: 'link_' + Date.now(),
      title: state.currentTab.title,
      url: state.currentTab.url,
      category: 'Personal',
      tags: [],
      notes: '',
      pinned: false,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.links.unshift(newLink);
    await saveLinksToStorage();
    elements.btnQuickSave.classList.add('saved');
    elements.quickSaveBtnText.textContent = 'Saved ✓';
    showToast('Bookmark saved successfully!');
    renderCategories();
    renderLinks();
  });

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    if (state.searchQuery) {
      elements.btnSearchClear.classList.remove('hidden');
    } else {
      elements.btnSearchClear.classList.add('hidden');
    }
    renderLinks();
  });

  elements.btnSearchClear.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.btnSearchClear.classList.add('hidden');
    elements.searchInput.focus();
    renderLinks();
  });

  // Sort dropdown
  elements.sortSelect.addEventListener('change', async (e) => {
    state.sortBy = e.target.value;
    await chrome.storage.local.set({ sortBy: state.sortBy });
    renderLinks();
  });

  // Open All in current category
  elements.btnOpenAllCategory.addEventListener('click', () => {
    const visibleLinks = getFilteredAndSortedLinks();
    if (visibleLinks.length === 0) {
      showToast('No links to open');
      return;
    }

    if (visibleLinks.length > 8) {
      if (!confirm(`Are you sure you want to open ${visibleLinks.length} tabs at once?`)) {
        return;
      }
    }

    visibleLinks.forEach(link => {
      chrome.tabs.create({ url: link.url, active: false });
    });
    showToast(`Opened ${visibleLinks.length} tabs`);
  });

  // Open Add Custom Link Modal
  elements.btnAddCustomLink.addEventListener('click', () => openLinkModal());
  elements.btnEmptyAdd.addEventListener('click', () => openLinkModal());

  // Modal Close buttons
  elements.btnModalClose.addEventListener('click', closeLinkModal);
  elements.btnModalCancel.addEventListener('click', closeLinkModal);
  elements.linkModal.addEventListener('click', (e) => {
    if (e.target === elements.linkModal) closeLinkModal();
  });

  // Fetch active tab into modal URL
  elements.btnFetchTabUrl.addEventListener('click', () => {
    if (state.currentTab) {
      elements.linkUrlField.value = state.currentTab.url;
      if (!elements.linkTitleField.value) {
        elements.linkTitleField.value = state.currentTab.title;
      }
    }
  });

  // Link Form Submit
  elements.linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveLinkForm();
  });

  // Backup Modal open/close
  elements.btnBackupOpen.addEventListener('click', () => {
    elements.backupModal.classList.remove('hidden');
  });
  elements.btnBackupClose.addEventListener('click', () => {
    elements.backupModal.classList.add('hidden');
  });
  elements.backupModal.addEventListener('click', (e) => {
    if (e.target === elements.backupModal) elements.backupModal.classList.add('hidden');
  });

  // Backup: Export JSON
  elements.btnExportJson.addEventListener('click', exportLinksJson);

  // Backup: Import JSON
  elements.importFileInput.addEventListener('change', importLinksJson);

  // Backup: Reset All
  elements.btnResetAll.addEventListener('click', handleResetAll);

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== elements.searchInput && !isModalOpen()) {
      e.preventDefault();
      elements.searchInput.focus();
    } else if (e.key === 'Escape') {
      if (!elements.linkModal.classList.contains('hidden')) closeLinkModal();
      if (!elements.backupModal.classList.contains('hidden')) elements.backupModal.classList.add('hidden');
    }
  });
}

function isModalOpen() {
  return !elements.linkModal.classList.contains('hidden') || !elements.backupModal.classList.contains('hidden');
}

// Apply Theme
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    elements.iconThemeDark.classList.add('hidden');
    elements.iconThemeLight.classList.remove('hidden');
  } else {
    document.body.classList.remove('light-theme');
    elements.iconThemeDark.classList.remove('hidden');
    elements.iconThemeLight.classList.add('hidden');
  }
}

// Render Categories Bar
function renderCategories() {
  // Aggregate existing categories from links + defaults
  const usedCategories = new Set(state.categories);
  state.links.forEach(link => {
    if (link.category) usedCategories.add(link.category);
  });
  const allCategories = Array.from(usedCategories);

  elements.categoriesList.innerHTML = '';

  // "All" Pill
  const allPill = createCategoryPill('All', 'all', state.activeFilter === 'all');
  elements.categoriesList.appendChild(allPill);

  // "⭐ Pinned" Pill
  const pinnedCount = state.links.filter(l => l.pinned).length;
  if (pinnedCount > 0) {
    const pinnedPill = createCategoryPill(`⭐ Pinned (${pinnedCount})`, 'pinned', state.activeFilter === 'pinned');
    elements.categoriesList.appendChild(pinnedPill);
  }

  // Category Pills
  allCategories.forEach(cat => {
    const count = state.links.filter(l => l.category === cat).length;
    const pill = createCategoryPill(`${cat} (${count})`, cat, state.activeFilter === cat);
    elements.categoriesList.appendChild(pill);
  });
}

function createCategoryPill(label, filterKey, isActive) {
  const btn = document.createElement('button');
  btn.className = `category-pill ${isActive ? 'active' : ''}`;
  btn.textContent = label;
  btn.addEventListener('click', () => {
    state.activeFilter = filterKey;
    renderCategories();
    renderLinks();
  });
  return btn;
}

// Filter and Sort Links Logic
function getFilteredAndSortedLinks() {
  let filtered = [...state.links];

  // 1. Category / Filter
  if (state.activeFilter === 'pinned') {
    filtered = filtered.filter(l => l.pinned);
  } else if (state.activeFilter !== 'all') {
    filtered = filtered.filter(l => (l.category || '').toLowerCase() === state.activeFilter.toLowerCase());
  }

  // 2. Search Query
  if (state.searchQuery) {
    const q = state.searchQuery;
    filtered = filtered.filter(l => {
      const matchTitle = (l.title || '').toLowerCase().includes(q);
      const matchUrl = (l.url || '').toLowerCase().includes(q);
      const matchNotes = (l.notes || '').toLowerCase().includes(q);
      const matchTags = (l.tags || []).some(t => t.toLowerCase().includes(q));
      const matchCategory = (l.category || '').toLowerCase().includes(q);
      return matchTitle || matchUrl || matchNotes || matchTags || matchCategory;
    });
  }

  // 3. Sorting
  filtered.sort((a, b) => {
    // Pinned items stay on top unless filtering specifically
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    switch (state.sortBy) {
      case 'az':
        return (a.title || '').localeCompare(b.title || '');
      case 'clicks':
        return (b.clicks || 0) - (a.clicks || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'recent':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return filtered;
}

// Render Links List
function renderLinks() {
  const visibleLinks = getFilteredAndSortedLinks();

  // Update Status Bar
  elements.linksCountBadge.textContent = `${visibleLinks.length} ${visibleLinks.length === 1 ? 'link' : 'links'}`;
  elements.activeFilterLabel.textContent = state.activeFilter !== 'all' ? `• Filter: ${state.activeFilter}` : '';

  if (visibleLinks.length === 0) {
    elements.linksContainer.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    if (state.searchQuery) {
      elements.emptyStateSubtitle.textContent = `No bookmarks match "${state.searchQuery}"`;
    } else {
      elements.emptyStateSubtitle.textContent = 'Save pages you visit or add new custom bookmarks.';
    }
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.linksContainer.innerHTML = '';

  visibleLinks.forEach(link => {
    const card = createLinkCard(link);
    elements.linksContainer.appendChild(card);
  });
}

// Build a Link Card DOM Node
function createLinkCard(link) {
  const card = document.createElement('div');
  card.className = `link-card ${link.pinned ? 'pinned' : ''}`;
  card.dataset.id = link.id;

  const domain = extractDomain(link.url);
  const faviconUrl = getFaviconUrl(link.url);

  // Top Section (Favicon, Title, Domain, Actions)
  const topSection = document.createElement('div');
  topSection.className = 'link-card-top';

  // Main Info clickable area (opens tab)
  const mainInfo = document.createElement('div');
  mainInfo.className = 'link-main-info';
  mainInfo.title = `Open ${link.title}\n${link.url}`;
  mainInfo.addEventListener('click', () => handleOpenLink(link));

  // Favicon Box
  const favBox = document.createElement('div');
  favBox.className = 'link-favicon-box';
  const img = document.createElement('img');
  img.className = 'link-favicon';
  img.src = faviconUrl;
  img.alt = '';
  img.onerror = () => {
    favBox.textContent = (domain.charAt(0) || '🔗').toUpperCase();
    favBox.style.fontSize = '10px';
    favBox.style.fontWeight = 'bold';
  };
  favBox.appendChild(img);

  // Text Details
  const textDetails = document.createElement('div');
  textDetails.className = 'link-text-details';

  const titleEl = document.createElement('span');
  titleEl.className = 'link-title';
  titleEl.textContent = link.title || domain;

  const urlEl = document.createElement('span');
  urlEl.className = 'link-url-preview';
  urlEl.textContent = domain;

  textDetails.appendChild(titleEl);
  textDetails.appendChild(urlEl);

  mainInfo.appendChild(favBox);
  mainInfo.appendChild(textDetails);

  // Action Buttons Toolbar
  const actions = document.createElement('div');
  actions.className = 'link-card-actions';

  // Copy Button
  const btnCopy = document.createElement('button');
  btnCopy.className = 'card-action-btn copy-btn';
  btnCopy.title = 'Copy Link URL';
  btnCopy.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  btnCopy.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(link.url);
  });

  // Pin Button
  const btnPin = document.createElement('button');
  btnPin.className = `card-action-btn pin-btn ${link.pinned ? 'is-pinned' : ''}`;
  btnPin.title = link.pinned ? 'Unpin bookmark' : 'Pin to top';
  btnPin.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="${link.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  btnPin.addEventListener('click', async (e) => {
    e.stopPropagation();
    await handleTogglePin(link.id);
  });

  // Edit Button
  const btnEdit = document.createElement('button');
  btnEdit.className = 'card-action-btn edit-btn';
  btnEdit.title = 'Edit Smart Link';
  btnEdit.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
  btnEdit.addEventListener('click', (e) => {
    e.stopPropagation();
    openLinkModal(link);
  });

  // Delete Button
  const btnDelete = document.createElement('button');
  btnDelete.className = 'card-action-btn delete-btn';
  btnDelete.title = 'Delete Link';
  btnDelete.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
  btnDelete.addEventListener('click', async (e) => {
    e.stopPropagation();
    await handleDeleteLink(link.id);
  });

  actions.appendChild(btnCopy);
  actions.appendChild(btnPin);
  actions.appendChild(btnEdit);
  actions.appendChild(btnDelete);

  topSection.appendChild(mainInfo);
  topSection.appendChild(actions);
  card.appendChild(topSection);

  // Optional Notes Preview
  if (link.notes && link.notes.trim()) {
    const notesEl = document.createElement('div');
    notesEl.className = 'link-notes-preview';
    notesEl.textContent = link.notes;
    card.appendChild(notesEl);
  }

  // Bottom Metadata (Category, Tags, Clicks)
  const bottomSection = document.createElement('div');
  bottomSection.className = 'link-card-bottom';

  const tagsRow = document.createElement('div');
  tagsRow.className = 'link-tags-row';

  if (link.category) {
    const catBadge = document.createElement('span');
    catBadge.className = 'tag-badge category-badge';
    catBadge.textContent = link.category;
    catBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      state.activeFilter = link.category;
      renderCategories();
      renderLinks();
    });
    tagsRow.appendChild(catBadge);
  }

  if (link.tags && Array.isArray(link.tags)) {
    link.tags.forEach(tag => {
      if (tag.trim()) {
        const tagBadge = document.createElement('span');
        tagBadge.className = 'tag-badge';
        tagBadge.textContent = '#' + tag.trim();
        tagBadge.addEventListener('click', (e) => {
          e.stopPropagation();
          state.searchQuery = tag.trim();
          elements.searchInput.value = tag.trim();
          elements.btnSearchClear.classList.remove('hidden');
          renderLinks();
        });
        tagsRow.appendChild(tagBadge);
      }
    });
  }

  const clicksEl = document.createElement('span');
  clicksEl.className = 'link-clicks-count';
  clicksEl.textContent = `${link.clicks || 0} visits`;

  bottomSection.appendChild(tagsRow);
  bottomSection.appendChild(clicksEl);
  card.appendChild(bottomSection);

  return card;
}

// Open link in browser tab & increment clicks
async function handleOpenLink(link) {
  // Increment clicks in state
  const target = state.links.find(l => l.id === link.id);
  if (target) {
    target.clicks = (target.clicks || 0) + 1;
    await saveLinksToStorage();
  }
  chrome.tabs.create({ url: link.url, active: true });
}

// Toggle Pin Status
async function handleTogglePin(id) {
  const link = state.links.find(l => l.id === id);
  if (link) {
    link.pinned = !link.pinned;
    link.updatedAt = new Date().toISOString();
    await saveLinksToStorage();
    showToast(link.pinned ? 'Pinned to top ⭐' : 'Unpinned');
    renderCategories();
    renderLinks();
  }
}

// Delete Link
async function handleDeleteLink(id) {
  const index = state.links.findIndex(l => l.id === id);
  if (index !== -1) {
    const deleted = state.links.splice(index, 1)[0];
    await saveLinksToStorage();
    showToast('Deleted link');
    
    // Refresh Quick Save button if active tab matches deleted
    if (state.currentTab && state.currentTab.url.toLowerCase() === deleted.url.toLowerCase()) {
      elements.btnQuickSave.classList.remove('saved');
      elements.quickSaveBtnText.textContent = 'Save Tab';
    }

    renderCategories();
    renderLinks();
  }
}

// Open Add/Edit Modal
function openLinkModal(link = null) {
  elements.urlError.classList.add('hidden');
  populateCategoryDropdown();

  if (link) {
    state.editingLinkId = link.id;
    elements.modalTitle.textContent = 'Edit Smart Link';
    elements.linkIdField.value = link.id;
    elements.linkUrlField.value = link.url;
    elements.linkTitleField.value = link.title;
    elements.linkCategoryField.value = link.category || 'General';
    elements.linkNewCategoryField.value = '';
    elements.linkTagsField.value = (link.tags || []).join(', ');
    elements.linkNotesField.value = link.notes || '';
    elements.linkPinnedField.checked = !!link.pinned;
  } else {
    state.editingLinkId = null;
    elements.modalTitle.textContent = 'Add Smart Link';
    elements.linkIdField.value = '';
    elements.linkUrlField.value = '';
    elements.linkTitleField.value = '';
    elements.linkCategoryField.value = state.activeFilter !== 'all' && state.activeFilter !== 'pinned' ? state.activeFilter : 'Personal';
    elements.linkNewCategoryField.value = '';
    elements.linkTagsField.value = '';
    elements.linkNotesField.value = '';
    elements.linkPinnedField.checked = false;

    // Prefill active tab if available
    if (state.currentTab && state.currentTab.url) {
      elements.linkUrlField.value = state.currentTab.url;
      elements.linkTitleField.value = state.currentTab.title;
    }
  }

  elements.linkModal.classList.remove('hidden');
  elements.linkTitleField.focus();
}

// Close Add/Edit Modal
function closeLinkModal() {
  elements.linkModal.classList.add('hidden');
  elements.linkForm.reset();
  state.editingLinkId = null;
}

// Populate Category select options in modal
function populateCategoryDropdown() {
  const select = elements.linkCategoryField;
  select.innerHTML = '';
  
  const allCats = new Set([...state.categories]);
  state.links.forEach(l => { if (l.category) allCats.add(l.category); });

  allCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// Handle Form Submission
async function handleSaveLinkForm() {
  let url = elements.linkUrlField.value.trim();
  const title = elements.linkTitleField.value.trim();
  let category = elements.linkNewCategoryField.value.trim() || elements.linkCategoryField.value;
  const tagsRaw = elements.linkTagsField.value.trim();
  const notes = elements.linkNotesField.value.trim();
  const pinned = elements.linkPinnedField.checked;

  if (!url) {
    elements.urlError.textContent = 'URL cannot be empty';
    elements.urlError.classList.remove('hidden');
    return;
  }

  // Auto-prepend https:// if missing protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Parse tags
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) : [];

  if (state.editingLinkId) {
    // Update existing
    const existing = state.links.find(l => l.id === state.editingLinkId);
    if (existing) {
      existing.url = url;
      existing.title = title || extractDomain(url);
      existing.category = category;
      existing.tags = tags;
      existing.notes = notes;
      existing.pinned = pinned;
      existing.updatedAt = new Date().toISOString();
      showToast('Smart Link updated!');
    }
  } else {
    // Create new
    const newLink = {
      id: 'link_' + Date.now(),
      title: title || extractDomain(url),
      url: url,
      category: category,
      tags: tags,
      notes: notes,
      pinned: pinned,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.links.unshift(newLink);
    showToast('New Smart Link added!');
  }

  // Update categories list if new one was added
  if (category && !state.categories.includes(category)) {
    state.categories.push(category);
    await chrome.storage.local.set({ categories: state.categories });
  }

  await saveLinksToStorage();
  closeLinkModal();
  renderCategories();
  renderLinks();
  await fetchActiveTabInfo();
}

// Backup: Export JSON
function exportLinksJson() {
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalLinks: state.links.length,
    categories: state.categories,
    links: state.links
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-links-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Exported backup successfully!');
}

// Backup: Import JSON
async function importLinksJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed.links)) {
        // Merge links avoiding duplicate URLs
        let addedCount = 0;
        parsed.links.forEach(imported => {
          if (imported.url && !state.links.some(l => l.url.toLowerCase() === imported.url.toLowerCase())) {
            state.links.push({
              id: imported.id || 'link_' + Date.now() + Math.random().toString(36).substr(2, 4),
              title: imported.title || imported.url,
              url: imported.url,
              category: imported.category || 'Personal',
              tags: Array.isArray(imported.tags) ? imported.tags : [],
              notes: imported.notes || '',
              pinned: !!imported.pinned,
              clicks: imported.clicks || 0,
              createdAt: imported.createdAt || new Date().toISOString(),
              updatedAt: imported.updatedAt || new Date().toISOString()
            });
            addedCount++;
          }
        });

        if (Array.isArray(parsed.categories)) {
          parsed.categories.forEach(c => {
            if (!state.categories.includes(c)) state.categories.push(c);
          });
          await chrome.storage.local.set({ categories: state.categories });
        }

        await saveLinksToStorage();
        elements.backupModal.classList.add('hidden');
        renderCategories();
        renderLinks();
        showToast(`Imported ${addedCount} new links!`);
      } else {
        showToast('Invalid backup file format');
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast('Error reading JSON file');
    }
  };
  reader.readAsText(file);
}

// Backup: Reset All
async function handleResetAll() {
  if (confirm('Are you sure you want to permanently clear all smart links?')) {
    state.links = [];
    state.categories = ['Work', 'Development', 'Design', 'Reading', 'Personal', 'Tools'];
    await chrome.storage.local.set({ links: [], categories: state.categories });
    elements.backupModal.classList.add('hidden');
    renderCategories();
    renderLinks();
    await fetchActiveTabInfo();
    showToast('All links cleared');
  }
}

// Helper: Save links array to storage
async function saveLinksToStorage() {
  await chrome.storage.local.set({ links: state.links });
}

// Helper: Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied URL to clipboard!');
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Copied URL to clipboard!');
  }
}

// Helper: Show temporary toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 2000);
}

// Helper: Extract clean domain name
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}

// Helper: Get Favicon URL from Google Favicons service
function getFaviconUrl(url) {
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}
