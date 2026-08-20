# Smart Links Manager ⚡

A modern, high-performance Google Chrome extension to manage, organize, tag, and search bookmarks with zero friction. Built strictly using **Manifest V3** with rich visual aesthetics and dark/light mode support.

> **Developed by**: Varunakshay  
> **Company**: Runit Infotech  

---

## Features

- ⚡ **1-Click Quick Save**: Detects active tab's title, URL, and favicon to save instantly.
- 🗂️ **Categories & Hashtags**: Organize links by spaces (Work, Dev, Design, Reading, Tools, Custom) and tags.
- 🔍 **Real-time Instant Search**: Search by title, URL, notes, and tags with `/` hotkey.
- 📌 **Pin Favorites**: Keep your daily go-to resources pinned at the top.
- ✏️ **In-Place CRUD**: Add, edit, delete (with custom confirmation modal), copy, and open bookmarks with real-time feedback.
- 🛡️ **Safe Deletion**: Integrated confirmation dialog prevents accidental link deletions.
- 🚀 **Batch Open**: Open all links in a category in one click.
- 💾 **Backup & Restore**: Export and import full bookmark collections via JSON.
- 🌗 **Dark / Light Modes**: Sleek glassmorphic theme with persistent preferences.
- 🔒 **100% Private**: Stores all data locally in `chrome.storage.local`. No external tracking or telemetry.

---

## Installation (Developer Mode)

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** button.
5. Select the folder `chrome apps/smart-links-manager/`.
6. Pin the extension to your Chrome toolbar.

---

## Project Structure

```
smart-links-manager/
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
├── CHROMEWEBSTORE.md        # Chrome Web Store submission metadata
├── manifest.json            # Manifest V3 extension configuration
├── icons/                   # Extension icons (16x16, 48x48, 128x128)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── background/
│   └── service-worker.js    # Service worker with context menus & badge sync
└── popup/
    ├── popup.html           # Main popup markup with delete modal & branding footer
    ├── popup.css            # Modern design system & responsive styling
    └── popup.js             # State management, CRUD, search, and storage
```

---

## Credits & License

- **Developer**: Varunakshay
- **Organization**: Runit Infotech
- **License**: MIT
