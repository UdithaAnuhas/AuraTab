# ✨ HomeTab

> A premium, minimalist new tab homepage for Chromium browsers featuring iOS-inspired glassmorphism, dynamic widgets, intelligent search, and complete personalization.

---

## 🌟 Highlights

- **💎 Apple iOS-Inspired Glassmorphism:** Ultra-clean frosted glass surfaces, dynamic tonal color palettes, dark/light/system theme modes, and fluid micro-animations.
- **🔍 Smart Search & AI Mode:** Instant Google search suggestions with keyboard navigation, custom search engines, voice search, and an AI Mode that routes queries directly to Google AI, Google Gemini, ChatGPT, or Perplexity.
- **📁 Full Bookmarks Manager:** Integrated sidebar with folder tree browsing, bookmark search, custom context menus (open, edit, copy, delete), and seamless sync with Chrome's native bookmark database.
- **👤 Google Account Avatar Sync:** Seamlessly detects and syncs your Google profile avatar, or lets you upload your own custom profile picture.
- **🌤️ Live Weather:** Real-time weather conditions and forecasts powered by Open-Meteo (no API keys required, privacy-respecting, auto-geolocation or manual search).
- **⏱️ Header & Lockscreen Clock:** Digital and analog clock modes with 12/24-hour toggle, live seconds, localized date strings, and 8 curated typography choices (Outfit, Inter, Space Grotesk, Orbitron, Urbanist, and more).
- **🖼️ 4K Wallpapers & Uploads:** Curated collection of high-resolution nature and abstract wallpapers, automatic daily rotation, or custom wallpaper upload with built-in blur, dim, and brightness controls.
- **⚡ Speed-Dial Shortcuts:** Drag-and-drop shortcuts grid with official brand SVGs, automatic high-res favicons, and optional Chrome Top Sites.
- **✅ Quick To-Do List:** Built-in task manager with completion toggles, due dates, and persistent local storage.
- **🧩 Google Apps Popover:** Quick launcher for Google Workspace apps (Drive, Gmail, YouTube, Docs, Sheets, Meet, Calendar) with customizable pinned favorites.
- **🌍 35+ Languages & RTL Support:** Fully localized in over 35 languages including Arabic, Hebrew, Urdu, Persian, Spanish, French, German, Japanese, Chinese, and Hindi.
- **🔒 Privacy First & Offline-Ready:** Zero trackers, zero analytics, zero external telemetry. All preferences stay synchronized across your browsers using `chrome.storage.sync` and IndexedDB.

---

## 🚀 Installation

HomeTab is built as a standard **Manifest V3** Chrome Extension and runs on any Chromium-based browser (Google Chrome, Microsoft Edge, Brave, Vivaldi, Opera, Arc).

### Load as an Unpacked Extension:

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/your-username/hometab.git
   ```
   *(Or download and extract the ZIP file)*

2. Open your Chromium browser and navigate to the Extensions page:
   - **Chrome / Brave:** `chrome://extensions`
   - **Edge:** `edge://extensions`

3. Turn on **Developer mode** (toggle switch in the top-right corner).

4. Click the **Load unpacked** button.

5. Select the `Hometab` folder containing `manifest.json`.

6. Open a new tab (`Ctrl+T` or `Cmd+T`) — your HomeTab experience is live!

---

## 🛠️ Architecture & Project Structure

```
Hometab/
├── manifest.json             # Chrome Manifest V3 configuration & CSP
├── newtab.html               # Main application markup
├── _locales/                 # Chrome Web Store internationalization
│   └── en/
│       └── messages.json
├── i18n/                     # In-app translations (35+ languages)
│   ├── en.json, es.json, fr.json, de.json, ar.json, ...
├── css/                      # Modular Vanilla CSS
│   ├── base.css              # Reset, CSS variables, typography tokens
│   ├── glass.css             # Glassmorphic panels, blurs, and shadows
│   ├── themes.css            # Light, dark, and auto theme palettes
│   ├── widgets.css           # Widget-specific styling (Clock, Search, Bookmarks, Todo)
│   ├── settings.css          # Settings drawer & custom modal styles
│   ├── fonts.css             # Embedded font-face declarations
│   └── responsive.css        # Adaptive viewports & mobile scaling
├── fonts/                    # Embedded local WOFF2 web fonts (Outfit, Inter, etc.)
├── icons/                    # High-res extension icons and SVG assets
└── js/                       # Modular Vanilla JavaScript
    ├── theme-bootstrap.js    # Synchronous pre-paint theme & font initializer
    ├── storage.js            # Storage layer (sync, local, IndexedDB fallbacks)
    ├── i18n.js               # Internationalization engine with RTL detection
    ├── theme.js              # Color math, Material You tonal palette generator
    ├── clock.js              # High-performance requestAnimationFrame clock
    ├── weather.js            # Open-Meteo weather client & caching
    ├── search.js             # Google Omnibox search & AI mode switcher
    ├── shortcuts.js          # Speed dial grid with drag-and-drop reordering
    ├── bookmarks.js          # Chrome bookmarks API integration & custom tree
    ├── todo.js               # Task management logic
    ├── ai-tools.js           # AI productivity tools launcher
    ├── panels.js             # Sliding drawer & popover animation manager
    ├── settings.js           # Settings manager & preferences controls
    ├── wallpaper.js          # Gallery, daily rotation, canvas downscaling
    └── app.js                # Core coordinator, greeting, & Google account sync
```

---

## 🔐 Permissions & Security

HomeTab complies strictly with the **Chrome Manifest V3 Content Security Policy (CSP)**. No inline scripts or `eval()` are used.

| Permission | Purpose |
| :--- | :--- |
| `storage` | Synchronizes user settings (theme, clock format, weather preferences) across signed-in browsers. |
| `unlimitedStorage` | Allows storing custom uploaded wallpapers locally in `chrome.storage.local` and IndexedDB. |
| `bookmarks` | Reads and manages bookmarks and folders in the bookmarks sidebar. |
| `topSites` | Optionally displays your most-visited websites in the shortcuts grid. |
| `favicon` | Loads crisp website favicons for your bookmarks using Chrome's native favicon cache. |

### Network Permissions (`host_permissions`):
- `https://api.open-meteo.com/*` & `https://geocoding-api.open-meteo.com/*`: Live weather forecasts and city search.
- `https://images.unsplash.com/*`: High-definition curated photography.
- `https://suggestqueries.google.com/*`: Real-time search query completions.
- `https://*.google.com/*` & `https://*.googleusercontent.com/*`: Google account avatar synchronization.

---

## 🎨 Customization Options

Inside the **Settings** menu (click the gear icon in the top right), you can configure:
- **Appearance:** Light, Dark, or System Auto mode; 12 accent colors or custom hex picker; Material You dynamic palettes.
- **Header Clock:** Toggle time, date, 12h/24h format, live seconds, clock size, and clock font.
- **Greeting:** Toggle greeting message, hide/show name, custom name input, or custom greeting text override.
- **Wallpaper:** Select from curated 4K photography, daily rotation, solid/mesh gradients, or upload your own image with blur/dim sliders.
- **Search Engine:** Choose Google, DuckDuckGo, Bing, Brave, Yahoo, Ecosia, or define a Custom Search URL.
- **AI Search Mode:** Choose Google AI Overview, Gemini, ChatGPT, or Perplexity.
- **Widget Visibility:** Freely toggle any widget (Weather, Shortcuts, Bookmarks, To-Dos, AI Tools, Apps).
- **Backup & Restore:** Export and import your entire configuration as JSON.

---

## 📄 License

MIT License © 2026 HomeTab Contributors. Free and open source for everyone.
