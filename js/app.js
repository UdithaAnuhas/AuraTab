/**
 * App - Main orchestrator
 * Initializes all modules, manages greeting, toasts, and Google Apps popover
 */
'use strict';

const AccountAvatar = (() => {
  const DEFAULT_AVATAR = 'icons/account_avatar.png';
  let currentAvatar = DEFAULT_AVATAR;

  function _validateImageUrl(url) {
    return new Promise((resolve) => {
      if (!url || typeof url !== 'string' || url.includes('default-user')) {
        resolve(false);
        return;
      }
      const testImg = new Image();
      testImg.onload = () => resolve(true);
      testImg.onerror = () => resolve(false);
      testImg.src = url;
    });
  }

  function _urlToDataUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const dim = Math.min(img.naturalWidth || 96, img.naturalHeight || 96, 128);
          canvas.width = dim;
          canvas.height = dim;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, dim, dim);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(url);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function init() {
    try {
      const syncData = await Storage.getSync(['customAvatar']);
      const localData = await Storage.getLocal(['customAvatar']);
      const candidate = (syncData && syncData.customAvatar) || (localData && localData.customAvatar);

      if (candidate) {
        if (candidate.startsWith('data:image/')) {
          currentAvatar = candidate;
        } else {
          const ok = await _validateImageUrl(candidate);
          if (ok) {
            currentAvatar = candidate;
          } else {
            // Broken or blocked URL - immediately clear it from storage!
            await Storage.setSync({ customAvatar: null });
            await Storage.setLocal({ customAvatar: null });
            currentAvatar = DEFAULT_AVATAR;
          }
        }
      } else {
        currentAvatar = DEFAULT_AVATAR;
      }
    } catch (e) {
      console.warn('AccountAvatar init error:', e);
      currentAvatar = DEFAULT_AVATAR;
    }
    _updateDom(currentAvatar);
  }

  function getAvatarUrl() {
    return currentAvatar || DEFAULT_AVATAR;
  }

  async function setAvatar(src) {
    currentAvatar = src || DEFAULT_AVATAR;
    try {
      await Storage.setSync({ customAvatar: src });
    } catch (e) {
      console.warn('Sync quota fallback to local:', e);
    }
    try {
      await Storage.setLocal({ customAvatar: src });
    } catch (e) {
      console.warn('Local storage error:', e);
    }
    _updateDom(currentAvatar);
  }

  async function resetAvatar() {
    currentAvatar = DEFAULT_AVATAR;
    await Storage.setSync({ customAvatar: null });
    await Storage.setLocal({ customAvatar: null });
    _updateDom(DEFAULT_AVATAR);
  }

  function _updateDom(src) {
    document.querySelectorAll('.account-avatar-img, .settings-avatar-preview').forEach(img => {
      const onErr = () => {
        img.removeEventListener('error', onErr);
        img.src = DEFAULT_AVATAR;
      };
      img.addEventListener('error', onErr);
      img.src = src || DEFAULT_AVATAR;
    });
  }

  async function _probeGoogleAvatar(notify = false) {
    try {
      const res = await fetch('https://www.google.com/', {
        credentials: 'include',
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      // Match google user avatar URL (specifically excluding default-user)
      const matches = html.match(/https:\/\/(?:lh\d+|play-lh)\.googleusercontent\.com\/(?:ogw|a|a-)\/(?!default-user)[^"'\s<>\\]+/gi);
      if (matches && matches.length > 0) {
        let url = matches[0].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
        if (url.includes('=s')) {
          url = url.replace(/=s\d+(-[a-z0-9]+)?/i, '=s96-c');
        } else if (!url.includes('=')) {
          url += '=s96-c';
        }

        const dataUrl = await _urlToDataUrl(url);
        const finalUrl = dataUrl || url;
        const isValid = await _validateImageUrl(finalUrl);

        if (isValid) {
          await setAvatar(finalUrl);
          if (notify && typeof App !== 'undefined' && App.showToast) {
            App.showToast('Google Account avatar synced successfully!');
          }
          return true;
        }
      }

      if (notify && typeof App !== 'undefined' && App.showToast) {
        App.showToast('No active Google sign-in detected on google.com');
      }
      return false;
    } catch (e) {
      console.warn('Failed to probe Google avatar:', e);
      if (notify && typeof App !== 'undefined' && App.showToast) {
        App.showToast('Could not reach Google to sync avatar');
      }
      return false;
    }
  }

  return {
    init,
    getAvatarUrl,
    setAvatar,
    resetAvatar,
    syncFromGoogle: () => _probeGoogleAvatar(true)
  };
})();
window.AccountAvatar = AccountAvatar;

const App = (() => {
  const DEFAULT_GOOGLE_FAV_NAMES = [
    'Account', 'Search', 'Gmail', 'YouTube', 'Play', 'News', 'Maps', 'Meet', 'Chat'
  ];

  const ALL_GOOGLE_APPS = [
    {
      name: 'Account',
      url: 'https://myaccount.google.com',
      icon: '<img src="icons/account_avatar.png" alt="Account" class="account-avatar-img">'
    },
    {
      name: 'Search',
      url: 'https://google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/web-64dp/logo_googleg_color_2x_web_64dp.png" alt="Search">'
    },
    {
      name: 'Gmail',
      url: 'https://mail.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/gmail_2020q4/v8/web-64dp/logo_gmail_2020q4_color_2x_web_64dp.png" alt="Gmail">'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/youtube/v9/web-64dp/logo_youtube_color_2x_web_64dp.png" alt="YouTube">'
    },
    {
      name: 'Play',
      url: 'https://play.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/play_prism/v7/web-64dp/logo_play_prism_color_2x_web_64dp.png" alt="Play">'
    },
    {
      name: 'News',
      url: 'https://news.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/news_64dp.png" alt="News">'
    },
    {
      name: 'Maps',
      url: 'https://maps.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/maps/v7/web-64dp/logo_maps_color_2x_web_64dp.png" alt="Maps">'
    },
    {
      name: 'Meet',
      url: 'https://meet.google.com',
      icon: '<img src="icons/google_meet.png" alt="Meet">'
    },
    {
      name: 'Chat',
      url: 'https://chat.google.com',
      icon: '<img src="icons/google_chat.png" alt="Chat">'
    },
    {
      name: 'Drive',
      url: 'https://drive.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/drive_2020q4/v8/web-64dp/logo_drive_2020q4_color_2x_web_64dp.png" alt="Drive">'
    },
    {
      name: 'Calendar',
      url: 'https://calendar.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/calendar_2020q4/v8/web-64dp/logo_calendar_2020q4_color_2x_web_64dp.png" alt="Calendar">'
    },
    {
      name: 'Photos',
      url: 'https://photos.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/photos/v8/web-64dp/logo_photos_color_2x_web_64dp.png" alt="Photos">'
    },
    {
      name: 'Translate',
      url: 'https://translate.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/translate/v6/web-64dp/logo_translate_color_2x_web_64dp.png" alt="Translate">'
    },
    {
      name: 'Vids',
      url: 'https://vids.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/vids_64dp.png" alt="Vids">'
    },
    {
      name: 'Sheets',
      url: 'https://sheets.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/sheets_2020q4/v8/web-64dp/logo_sheets_2020q4_color_2x_web_64dp.png" alt="Sheets">'
    },
    {
      name: 'Docs',
      url: 'https://docs.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/docs_2020q4/v6/web-64dp/logo_docs_2020q4_color_2x_web_64dp.png" alt="Docs">'
    },
    {
      name: 'Slides',
      url: 'https://slides.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/slides_2020q4/v6/web-64dp/logo_slides_2020q4_color_2x_web_64dp.png" alt="Slides">'
    },
    {
      name: 'Google One',
      url: 'https://one.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/one_64dp.png" alt="Google One">'
    },
    {
      name: 'Shopping',
      url: 'https://shopping.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/shopping_64dp.png" alt="Shopping">'
    },
    {
      name: 'Finance',
      url: 'https://google.com/finance',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/finance_64dp.png" alt="Finance">'
    },
    {
      name: 'Keep',
      url: 'https://keep.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/keep_2020q4/v8/web-64dp/logo_keep_2020q4_color_2x_web_64dp.png" alt="Keep">'
    },
    {
      name: 'My Ad Centre',
      url: 'https://myadcenter.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/my_ad_center_64dp.png" alt="My Ad Centre">'
    },
    {
      name: 'Classroom',
      url: 'https://classroom.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/classroom/v7/web-64dp/logo_classroom_color_2x_web_64dp.png" alt="Classroom">'
    },
    {
      name: 'Google Ads',
      url: 'https://ads.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/ads_64dp.png" alt="Google Ads">'
    },
    {
      name: 'Merchant Center',
      url: 'https://merchants.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/merchant_center_64dp.png" alt="Merchant Center">'
    },
    {
      name: 'Contacts',
      url: 'https://contacts.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/contacts/v7/web-64dp/logo_contacts_color_2x_web_64dp.png" alt="Contacts">'
    },
    {
      name: 'Travel',
      url: 'https://google.com/travel',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/travel_64dp.png" alt="Travel">'
    },
    {
      name: 'Forms',
      url: 'https://forms.google.com',
      icon: '<img src="https://fonts.gstatic.com/s/i/productlogos/forms_2020q4/v6/web-64dp/logo_forms_2020q4_color_2x_web_64dp.png" alt="Forms">'
    },
    {
      name: 'Books',
      url: 'https://books.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/play_books_64dp.png" alt="Books">'
    },
    {
      name: 'Chrome Web Store',
      url: 'https://chromewebstore.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/chrome_store_64dp.png" alt="Chrome Web Store">'
    },
    {
      name: 'Password Manager',
      url: 'https://passwords.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/password_manager_64dp.png" alt="Password Manager">'
    },
    {
      name: 'Google Analytics',
      url: 'https://analytics.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/analytics_64dp.png" alt="Google Analytics">'
    },
    {
      name: 'Blogger',
      url: 'https://blogger.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/blogger_64dp.png" alt="Blogger">'
    },
    {
      name: 'Wallet',
      url: 'https://wallet.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/wallet_64dp.png" alt="Wallet">'
    },
    {
      name: 'Notebook',
      url: 'https://notebooklm.google',
      icon: '<img src="icons/google_notebook.png" alt="Notebook">'
    },
    {
      name: 'Tasks',
      url: 'https://tasks.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/tasks_64dp.png" alt="Tasks">'
    },
    {
      name: 'Gemini',
      url: 'https://gemini.google.com',
      icon: '<img src="https://ssl.gstatic.com/images/branding/product/2x/gemini_64dp.png" alt="Gemini">'
    }
  ];

  async function init() {
    try {
      // Load i18n first
      await I18n.load();

      // Load theme (may already be applied by bootstrap)
      await Theme.load();

      // Initialize account avatar (load cached / probe Google session)
      await AccountAvatar.init();

      // Apply widget visibility
      await _applyWidgetVisibility();

      // Immediate Greeting based on current time (zero lag)
      updateGreeting();

      // Init all modules (non-blocking)
      await Promise.all([
        Clock.init(),
        Weather.init(),
        Search.init(),
        Shortcuts.init(),
        AITools.init(),
        Todo.init(),
        Bookmarks.init(),
        Wallpaper.init(),
      ]);

      // Init settings
      Settings.init();

      // Greeting
      updateGreeting();

      // Google Apps popover
      _setupGoogleApps();

      // Clock click to toggle style (and legacy button if present)
      const clockWidget = document.getElementById('clock-widget');
      if (clockWidget) {
        clockWidget.addEventListener('click', () => {
          Clock.toggle();
        });
      }
      const clockToggleBtn = document.getElementById('btn-clock-toggle');
      if (clockToggleBtn) {
        clockToggleBtn.addEventListener('click', () => {
          Clock.toggle();
        });
      }

      // Quick wallpaper cycle button
      const quickWallBtn = document.getElementById('btn-quick-wallpaper');
      if (quickWallBtn) {
        quickWallBtn.addEventListener('click', async () => {
          const next = await Wallpaper.cycleWallpaper();
          App.showToast(`Wallpaper: ${next.name}`);
        });
      }

      // Add stagger animation to center content
      document.querySelector('.center-content').classList.add('stagger');

      // Close popovers on outside click
      document.addEventListener('click', (e) => {
        let anyPopoverOpen = false;
        document.querySelectorAll('.popover').forEach(p => {
          if (p.style.display !== 'none' && !p.contains(e.target)) {
            // Check if click is on the toggle button
            const toggleBtns = ['btn-ai-tools', 'btn-google-apps'];
            const isToggle = toggleBtns.some(id => {
              const btn = document.getElementById(id);
              return btn && (btn === e.target || btn.contains(e.target));
            });
            if (!isToggle) p.style.display = 'none';
          }
          if (p.style.display !== 'none') anyPopoverOpen = true;
        });

        const anySidePanelOpen = Array.from(document.querySelectorAll('.side-panel, .settings-panel')).some(p => p.style.display !== 'none' && !p.classList.contains('panel-closing'));
        if (!anyPopoverOpen && !anySidePanelOpen && typeof window.setActiveNav === 'function') {
          window.setActiveNav('nav-home');
        }
      });

      // Home tab and brand logo reset
      const homeLink = document.getElementById('nav-home');
      const brandLogo = document.getElementById('brand-logo');
      const closeAllPanels = (e) => {
        if (e) e.preventDefault();
        document.querySelectorAll('.popover').forEach(p => p.style.display = 'none');
        if (typeof Panels !== 'undefined') {
          Panels.closeAll();
        } else {
          document.querySelectorAll('.side-panel, .settings-panel').forEach(p => p.style.display = 'none');
        }
        if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      };
      if (homeLink) homeLink.addEventListener('click', closeAllPanels);
      if (brandLogo) brandLogo.addEventListener('click', closeAllPanels);

    } catch (e) {
      console.error('App init error:', e);
    }
  }

  async function updateGreeting() {
    const greetingEl = document.getElementById('greeting-text');
    const nameEl = document.getElementById('greeting-name');
    const commaEl = document.getElementById('greeting-comma');

    // Immediately compute and display the live time-based greeting (zero lag)
    const now = new Date();
    const hour = now.getHours();
    const timeGreeting = (typeof I18n !== 'undefined' && I18n.getGreeting) ? I18n.getGreeting() :
      ((hour >= 5 && hour < 12) ? 'Good morning' :
       (hour >= 12 && hour < 17) ? 'Good afternoon' :
       (hour >= 17 && hour < 22) ? 'Good evening' : 'Good night');

    if (greetingEl) {
      greetingEl.textContent = timeGreeting;
    }

    if (localStorage.getItem('hometab_showGreetingName') === 'false') {
      if (nameEl) {
        nameEl.textContent = '';
        nameEl.style.display = 'none';
      }
      if (commaEl) commaEl.style.display = 'none';
    }

    const data = await Storage.getSync(['userName', 'customGreeting', 'showGreetingName']);
    const showName = (data.showGreetingName !== false) && (localStorage.getItem('hometab_showGreetingName') !== 'false');
    const defaultName = 'Wahal';
    const userName = (data.userName !== undefined && data.userName !== null && data.userName !== '') ? data.userName : defaultName;

    if (data.customGreeting && data.customGreeting.trim()) {
      if (greetingEl) greetingEl.textContent = data.customGreeting.trim();
      if (nameEl) {
        nameEl.textContent = '';
        nameEl.style.display = 'none';
      }
      if (commaEl) commaEl.style.display = 'none';
    } else {
      if (greetingEl) greetingEl.textContent = timeGreeting;
      if (!showName) {
        if (nameEl) {
          nameEl.textContent = '';
          nameEl.style.display = 'none';
        }
        if (commaEl) commaEl.style.display = 'none';
      } else {
        if (nameEl) {
          nameEl.style.display = '';
          nameEl.textContent = userName;
        }
        if (commaEl) commaEl.style.display = userName ? 'inline' : 'none';
      }
    }

    if (nameEl) {
      nameEl.contentEditable = 'false';
    }
  }

  async function _applyWidgetVisibility() {
    const data = await Storage.getSync(['widgetVisibility', 'showBookmarksNav', 'showAiTools', 'showGoogleApps']);
    const vis = data.widgetVisibility || {};
    Object.entries(vis).forEach(([id, visible]) => {
      const el = document.getElementById(id);
      if (el) el.style.display = visible ? '' : 'none';
    });

    const bkmBtn = document.getElementById('btn-bookmarks');
    if (bkmBtn && data.showBookmarksNav !== undefined) {
      bkmBtn.style.display = data.showBookmarksNav ? '' : 'none';
    }
    const aiBtn = document.getElementById('btn-ai-tools');
    if (aiBtn && data.showAiTools !== undefined) {
      aiBtn.style.display = data.showAiTools ? '' : 'none';
    }
    const gAppsBtn = document.getElementById('btn-google-apps');
    if (gAppsBtn && data.showGoogleApps !== undefined) {
      gAppsBtn.style.display = data.showGoogleApps ? '' : 'none';
    }
  }

  function _setupGoogleApps() {
    const btn = document.getElementById('btn-google-apps');
    const popover = document.getElementById('google-apps-popover');
    if (!btn || !popover) return;

    const favGrid = document.getElementById('google-apps-fav-grid');
    const moreGrid = document.getElementById('google-apps-more-grid');
    const editBtn = document.getElementById('btn-gapps-edit');
    const editHint = document.getElementById('gapps-edit-hint');

    const STORAGE_KEY = 'hometab_gapps_favorites';

    function getSavedFavorites() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(name => ALL_GOOGLE_APPS.some(a => a.name === name));
            if (valid.length > 0) return valid;
          }
        }
      } catch (err) {
        console.warn('Failed to parse saved google apps favorites', err);
      }
      return DEFAULT_GOOGLE_FAV_NAMES.slice();
    }

    function saveFavorites(favNames) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favNames));
        if (typeof Storage !== 'undefined' && Storage.setSync) {
          Storage.setSync({ googleAppsFavorites: favNames });
        }
      } catch (err) {
        console.warn('Failed to save google apps favorites', err);
      }
    }

    let favoriteNames = getSavedFavorites();
    let isEditing = false;
    let draggedAppName = null;

    const PENCIL_ICON = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    `;
    const CHECK_ICON = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;

    function updateEditState(editing, notify = true) {
      isEditing = editing;
      popover.classList.toggle('is-editing', isEditing);
      if (editBtn) {
        editBtn.classList.toggle('is-active', isEditing);
        editBtn.setAttribute('title', isEditing ? 'Done editing' : 'Customize favorites');
        editBtn.setAttribute('aria-label', isEditing ? 'Done editing' : 'Customize favorites');
        editBtn.innerHTML = isEditing ? CHECK_ICON : PENCIL_ICON;
      }
      if (editHint) {
        editHint.style.display = isEditing ? '' : 'none';
      }
      if (!isEditing && notify) {
        saveFavorites(favoriteNames);
        showToast('Favorites saved');
      }
      renderGrids();
    }

    function renderGrids() {
      if (!favGrid || !moreGrid) return;
      favGrid.innerHTML = '';
      moreGrid.innerHTML = '';

      const favApps = [];
      favoriteNames.forEach(name => {
        const app = ALL_GOOGLE_APPS.find(a => a.name === name);
        if (app) favApps.push(app);
      });

      const moreApps = ALL_GOOGLE_APPS.filter(a => !favoriteNames.includes(a.name));

      favApps.forEach(app => favGrid.appendChild(createAppElement(app, true)));
      moreApps.forEach(app => moreGrid.appendChild(createAppElement(app, false)));
    }

    function createAppElement(app, isFav) {
      const a = document.createElement('a');
      a.className = 'google-app-item';
      a.href = app.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = isEditing ? (isFav ? `Remove ${app.name} from favorites` : `Add ${app.name} to favorites`) : app.name;
      a.dataset.name = app.name;
      a.draggable = isEditing;

      const icon = document.createElement('span');
      icon.className = 'google-app-icon';
      if (app.name === 'Account') {
        const img = document.createElement('img');
        img.className = 'account-avatar-img';
        img.alt = 'Account';
        const onErr = () => {
          img.removeEventListener('error', onErr);
          img.src = 'icons/account_avatar.png';
        };
        img.addEventListener('error', onErr);
        img.src = AccountAvatar.getAvatarUrl();
        icon.appendChild(img);
      } else {
        icon.innerHTML = app.icon;
      }

      const name = document.createElement('span');
      name.className = 'google-app-name';
      name.textContent = app.name;

      a.appendChild(icon);
      a.appendChild(name);

      if (isEditing) {
        const badge = document.createElement('span');
        badge.className = `gapps-action-badge ${isFav ? 'remove' : 'add'}`;
        badge.textContent = isFav ? '−' : '+';
        badge.title = isFav ? 'Remove from favorites' : 'Add to favorites';
        a.appendChild(badge);
      }

      // Handle item click
      a.addEventListener('click', (e) => {
        if (isEditing) {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(app.name, isFav);
        }
      });

      // Drag and drop handlers
      a.addEventListener('dragstart', (e) => {
        if (!isEditing) return;
        draggedAppName = app.name;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', app.name);
        setTimeout(() => a.classList.add('is-dragged'), 0);
      });

      a.addEventListener('dragend', () => {
        a.classList.remove('is-dragged');
        popover.querySelectorAll('.google-app-item').forEach(el => el.classList.remove('drag-over'));
        draggedAppName = null;
      });

      a.addEventListener('dragover', (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        a.classList.add('drag-over');
      });

      a.addEventListener('dragleave', () => {
        a.classList.remove('drag-over');
      });

      a.addEventListener('drop', (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();
        a.classList.remove('drag-over');
        const sourceName = draggedAppName || e.dataTransfer.getData('text/plain');
        if (!sourceName || sourceName === app.name) return;

        handleDropOnItem(sourceName, app.name, isFav);
      });

      return a;
    }

    function toggleFavorite(appName, currentlyFav) {
      if (currentlyFav) {
        if (favoriteNames.length <= 1) {
          showToast('Keep at least one favorite app');
          return;
        }
        favoriteNames = favoriteNames.filter(n => n !== appName);
      } else {
        favoriteNames.push(appName);
      }
      saveFavorites(favoriteNames);
      renderGrids();
    }

    function handleDropOnItem(sourceName, targetName, targetIsFav) {
      const sourceIsFav = favoriteNames.includes(sourceName);

      if (targetIsFav) {
        favoriteNames = favoriteNames.filter(n => n !== sourceName);
        const targetIndex = favoriteNames.indexOf(targetName);
        if (targetIndex >= 0) {
          favoriteNames.splice(targetIndex, 0, sourceName);
        } else {
          favoriteNames.push(sourceName);
        }
      } else {
        if (sourceIsFav) {
          if (favoriteNames.length <= 1) {
            showToast('Keep at least one favorite app');
            return;
          }
          favoriteNames = favoriteNames.filter(n => n !== sourceName);
        }
      }
      saveFavorites(favoriteNames);
      renderGrids();
    }

    const favCard = popover.querySelector('.gapps-fav-card');
    if (favCard) {
      favCard.addEventListener('dragover', (e) => {
        if (!isEditing) return;
        e.preventDefault();
      });
      favCard.addEventListener('drop', (e) => {
        if (!isEditing) return;
        if (e.target.closest('.google-app-item')) return;
        e.preventDefault();
        const sourceName = draggedAppName || e.dataTransfer.getData('text/plain');
        if (!sourceName) return;
        if (!favoriteNames.includes(sourceName)) {
          favoriteNames.push(sourceName);
          saveFavorites(favoriteNames);
          renderGrids();
        }
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateEditState(!isEditing);
      });
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = popover.style.display !== 'none';
      if (isEditing) updateEditState(false, false);
      _closeAll();
      if (!isOpen) {
        popover.style.display = '';
        if (typeof window.setActiveNav === 'function') window.setActiveNav('btn-google-apps');
        const rect = btn.getBoundingClientRect();
        const popoverWidth = 336;
        let left = rect.left + (rect.width / 2) - (popoverWidth / 2);
        if (left + popoverWidth > window.innerWidth - 12) {
          left = window.innerWidth - popoverWidth - 12;
        }
        if (left < 12) {
          left = 12;
        }
        popover.style.left = `${left}px`;
        popover.style.top = `${rect.bottom + 10}px`;
        popover.style.right = 'auto';
        popover.style.bottom = 'auto';
        popover.style.transform = 'none';
      } else {
        if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
      }
    });

    const closeBtn = popover.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (isEditing) updateEditState(false, false);
        popover.style.display = 'none';
        if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
      });
    }

    document.addEventListener('click', (e) => {
      if (popover.style.display !== 'none' && !popover.contains(e.target) && !btn.contains(e.target)) {
        if (isEditing) updateEditState(false, false);
        popover.style.display = 'none';
        if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
      }
    });

    renderGrids();
  }

  function _closeAll() {
    document.querySelectorAll('.popover').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-panel').forEach(p => p.style.display = 'none');
    if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
  }

  /** Show a toast notification with optional action button */
  function showToast(message, duration = 3000, actionText = null, onAction = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';

    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    let dismissTimer;

    if (actionText && typeof onAction === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action-btn';
      actionBtn.textContent = actionText;
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(dismissTimer);
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
        onAction();
      });
      toast.appendChild(actionBtn);
    }

    container.appendChild(toast);

    dismissTimer = setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { init, updateGreeting, showToast };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
