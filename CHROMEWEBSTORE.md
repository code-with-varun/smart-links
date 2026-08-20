# Chrome Web Store Listing — Smart Links Manager

> Last Updated: 2026-08-20

## Store Listing

**Extension Name** [REQUIRED]
Smart Links Manager

**Short Description** [REQUIRED]
Smart bookmark & URL manager with tags, categories, instant search, quick save, in-place edit, and one-click open.

**Detailed Description** [REQUIRED]
Smart Links Manager is a modern, high-performance bookmark and URL manager designed to streamline your daily web workflow.

Developed by Varunakshay for Runit Infotech, this extension helps you save, categorize, tag, and find your daily web resources with zero friction.

Key Features:
- 1-Click Save: Instantly detect and save your current active tab with title and favicon.
- Organize by Categories & Tags: Filter links effortlessly using interactive category pills and hashtag filters.
- Real-Time Search: Fast, instant search across link titles, domains, notes, and tags with keyboard shortcut navigation ('/' to search).
- Pin Favorites: Keep your high-priority links pinned right at the top of your deck.
- In-Place Editing: Edit titles, URLs, tags, and personal notes anytime without opening separate settings pages.
- Safe Delete Confirmation: Custom confirmation modal prevents accidental link deletion.
- Batch Open: Open all links within a specific collection with a single click.
- Data Backup & Migration: One-click JSON export and import for seamless backup and cross-device synchronization.
- Dark & Light Themes: Sleek modern glassmorphic interface with automatic theme persistence.

How to Use:
1. Click the Smart Links Manager icon in your toolbar to open your deck.
2. Click "Save Tab" to bookmark your current page immediately, or click "+ Add" to create a custom entry.
3. Organize links by selecting a category or tagging them with keywords.
4. Click on any bookmark to open it in a new tab, or use the search bar (press '/') to instantly find saved links.

Privacy & Security:
All your bookmarks, categories, and preferences are stored 100% locally on your machine using Chrome's secure storage API. Smart Links Manager does NOT track your browsing history, does NOT collect analytics, and never communicates with external third-party servers.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Saves, organizes, edits, and searches bookmarks and links with tags, categories, and one-click tab opening.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Small Icon | 48×48 PNG | ✅ Ready | `icons/icon-48.png` |
| Toolbar Icon | 16×16 PNG | ✅ Ready | `icons/icon-16.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ To be captured from browser | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To be captured from browser | |

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `storage` | permissions | Required to store and persist user bookmarks, custom categories, tags, pinned links, and theme preference locally on the user's device. |
| `tabs` | permissions | Required to read the current active tab's title, URL, and favicon for the 1-click 'Save Tab' feature, and to batch open bookmarked links in new tabs. |
| `activeTab` | permissions | Required to access the active tab context when invoked via toolbar action to prefill the bookmark form. |
| `contextMenus` | permissions | Required to provide right-click options ('Bookmark Page to Smart Links' and 'Save Link to Smart Links') on web pages. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|---|---|---|---|---|
| Personally identifiable info | No | No | N/A | No |
| Health info | No | No | N/A | No |
| Financial info | No | No | N/A | No |
| Authentication info | No | No | N/A | No |
| Personal communications | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | No | No | N/A | No |
| User activity | No | No | N/A | No |
| Website content | No | No | N/A | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Distribution

**Visibility**: Public  
**Regions**: All regions  
**Pricing**: Free  

---

## Developer Info

**Publisher Name**: Runit Infotech  
**Developer**: Varunakshay  
**Contact / Support Email**: contact@runitinfotech.com  
**Website**: https://runitinfotech.com  

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.0.0 | 2026-08-20 | Initial production release with Manifest V3, CRUD link management, category filters, quick active tab save, JSON backup/restore, delete confirmation modal, and dark/light themes. | Draft |
