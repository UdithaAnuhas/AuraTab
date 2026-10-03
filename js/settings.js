/**
 * Settings panel module
 * Generates the full settings UI with sections for Appearance, Wallpaper, Widgets, etc.
 */
'use strict';

const Settings = (() => {
  async function init() {
    _buildSettingsUI();
    _setupListeners();
  }

  let activeTabId = 'style';

  function _buildSettingsUI(tabToOpen) {
    if (tabToOpen) {
      activeTabId = tabToOpen;
    } else {
      try {
        const savedTab = localStorage.getItem('hometab_settings_tab');
        if (savedTab) activeTabId = savedTab;
      } catch (_) {}
    }

    const body = document.getElementById('settings-body');
    body.innerHTML = '';

    // === TOP CATEGORY NAVIGATION TABS ===
    const tabs = [
      {
        id: 'style',
        label: 'Style',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`
      },
      {
        id: 'widgets',
        label: 'Widgets',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
      },
      {
        id: 'tools',
        label: 'Tools',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      },
      {
        id: 'system',
        label: 'System',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
      }
    ];

    const tabBar = document.createElement('div');
    tabBar.className = 'settings-tab-bar';

    const contentContainer = document.createElement('div');
    contentContainer.className = 'settings-tab-content';

    tabs.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'settings-tab-btn' + (activeTabId === t.id ? ' active' : '');
      btn.innerHTML = `${t.icon}<span>${t.label}</span>`;
      btn.setAttribute('aria-label', `${t.label} Settings`);
      btn.addEventListener('click', () => {
        if (activeTabId === t.id) return;
        activeTabId = t.id;
        try { localStorage.setItem('hometab_settings_tab', activeTabId); } catch (_) {}
        tabBar.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _renderTabContent(activeTabId, contentContainer);
      });
      tabBar.appendChild(btn);
    });

    body.appendChild(tabBar);
    body.appendChild(contentContainer);

    _renderTabContent(activeTabId, contentContainer);
  }

  function _renderTabContent(tabId, container) {
    container.innerHTML = '';

    if (tabId === 'style') {
      // 1. Appearance
      container.appendChild(_section(I18n.t('appearance', 'Appearance'), [
        _row(I18n.t('theme', 'Theme'), _themeModeGroup()),
        _row(I18n.t('accentColor', 'Accent Color'), _colorPicker()),
        _rowStacked(I18n.t('presets', 'Presets'), _presetsGrid()),
        _row(I18n.t('materialYou', 'Material You'), _toggle('materialYou', Theme.materialYou, (val) => {
          Theme.setMaterialYou(val);
          Theme.save();
        })),
        _rowStacked('', _extractButton()),
      ]));

      // 2. Wallpaper
      container.appendChild(_section(I18n.t('wallpaper', 'Wallpaper'), [
        _rowStacked('', _wallpaperTabs()),
        _rowStacked('', _wallpaperContent()),
        _row(I18n.t('blur', 'Blur'), _rangeSlider('wallBlur', Wallpaper.settings.blur, 0, 40, (val) => Wallpaper.setAdjustment('blur', val))),
        _row(I18n.t('dim', 'Dim'), _rangeSlider('wallDim', Wallpaper.settings.dim, 0, 80, (val) => Wallpaper.setAdjustment('dim', val))),
        _row(I18n.t('brightness', 'Brightness'), _rangeSlider('wallBright', Wallpaper.settings.brightness, 50, 150, (val) => Wallpaper.setAdjustment('brightness', val))),
      ]));

    } else if (tabId === 'widgets') {
      // 1. Clock (Header Clock)
      const clockEl = document.getElementById('header-clock-widget');
      const isClockVisible = clockEl ? clockEl.style.display !== 'none' : true;

      const dateEl = document.getElementById('top-date');
      const isDateVisible = dateEl ? dateEl.style.display !== 'none' : true;

      container.appendChild(_section(I18n.t('clock', 'Clock'), [
        _row('Header Clock', _toggle('headerClock', isClockVisible, async (val) => {
          const el = document.getElementById('header-clock-widget');
          if (el) el.style.display = val ? '' : 'none';
          const data = await Storage.getSync(['widgetVisibility']);
          const vis = data.widgetVisibility || {};
          vis['header-clock-widget'] = val;
          await Storage.setSync({ widgetVisibility: vis });
        }), 'Show time in top header'),
        _row('Show Date', _toggle('headerClockDate', isDateVisible, async (val) => {
          const el = document.getElementById('top-date');
          if (el) el.style.display = val ? '' : 'none';
          const data = await Storage.getSync(['widgetVisibility']);
          const vis = data.widgetVisibility || {};
          vis['top-date'] = val;
          await Storage.setSync({ widgetVisibility: vis });
        }), 'Show date under the clock time'),
        _row(I18n.t('show24h', '24-hour Time'), _toggle('clock24h', Clock.is24h, (val) => Clock.set24h(val)), 'Switch between 18:14 and 6:14 PM'),
        _row(I18n.t('showSeconds', 'Show Seconds'), _toggle('showSeconds', Clock.hasSeconds, (val) => Clock.setShowSeconds(val)), 'Display live seconds'),
        _rowStacked(I18n.t('clockFont', 'Clock Font Aesthetic'), _clockFontPicker()),
        _row(I18n.t('clockSize', 'Clock Size'), _rangeSlider('clockSize', Clock.size, 70, 180, (val) => Clock.setSize(val))),
      ]));

      // 2. Shortcuts
      const shortcutsEl = document.getElementById('shortcuts-widget');
      const isShortcutsVisible = shortcutsEl ? shortcutsEl.style.display !== 'none' : true;
      const isAdaptive = (typeof Shortcuts !== 'undefined' && Shortcuts.adaptiveIcons) || false;
      const onEditShortcuts = () => {
        _showShortcutsOrganizer();
      };

      container.appendChild(_section('Shortcuts', [
        _row('Shortcuts', _toggle('showShortcuts', isShortcutsVisible, async (val) => {
          const widget = document.getElementById('shortcuts-widget');
          if (widget) widget.style.display = val ? '' : 'none';
          const data = await Storage.getSync(['widgetVisibility']);
          const vis = data.widgetVisibility || {};
          vis['shortcuts-widget'] = val;
          await Storage.setSync({ widgetVisibility: vis });
        }), 'Show saved shortcuts grid'),
        _row('Edit Shortcuts', _iconBtn(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`, onEditShortcuts), 'Choose which shortcuts get shown', onEditShortcuts),
        _row('<span>Adaptive Icons</span><span class="settings-badge-beta"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.89 18.5A2 2 0 0 0 6.64 21h10.72a2 2 0 0 0 1.75-2.5L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="7" y1="15" x2="17" y2="15"/></svg>Beta</span>', _toggle('adaptiveIcons', isAdaptive, (val) => {
          if (typeof Shortcuts !== 'undefined' && Shortcuts.setAdaptiveIcons) {
            Shortcuts.setAdaptiveIcons(val);
          }
        }), 'Shortcut icons will adapt to theme')
      ]));

      // 3. Search Bar
      const searchEl = document.getElementById('search-widget');
      const isSearchVisible = searchEl ? searchEl.style.display !== 'none' : true;

      container.appendChild(_section(I18n.t('search', 'Search Bar'), [
        _row('Search Bar', _toggle('showSearch', isSearchVisible, async (val) => {
          const widget = document.getElementById('search-widget');
          if (widget) widget.style.display = val ? '' : 'none';
          const data = await Storage.getSync(['widgetVisibility']);
          const vis = data.widgetVisibility || {};
          vis['search-widget'] = val;
          await Storage.setSync({ widgetVisibility: vis });
        }), 'Show search bar in center'),
        _row(I18n.t('searchEngine', 'Search Engine'), _searchEngineSelect()),
        _row(I18n.t('aiProvider', 'AI Search Provider'), _aiProviderSelect()),
        _rowStacked(I18n.t('customUrl', 'Custom URL template'), _customSearchUrlInput()),
      ]));

      // 4. Greeting
      const greetingEl = document.getElementById('greeting-widget');
      const isGreetingVisible = greetingEl ? greetingEl.style.display !== 'none' : true;
      const isNameVisible = localStorage.getItem('hometab_showGreetingName') !== 'false';

      container.appendChild(_section(I18n.t('greeting', 'Greeting'), [
        _row('Greeting', _toggle('showGreeting', isGreetingVisible, async (val) => {
          const widget = document.getElementById('greeting-widget');
          if (widget) widget.style.display = val ? '' : 'none';
          const data = await Storage.getSync(['widgetVisibility']);
          const vis = data.widgetVisibility || {};
          vis['greeting-widget'] = val;
          await Storage.setSync({ widgetVisibility: vis });
        }), 'Show greeting message and date'),
        _row(I18n.t('showName', 'Show Name'), _toggle('showGreetingName', isNameVisible, async (val) => {
          localStorage.setItem('hometab_showGreetingName', val ? 'true' : 'false');
          await Storage.setSync({ showGreetingName: val });
          const styleEl = document.getElementById('bootstrap-greeting-hide-name');
          if (!val) {
            if (!styleEl) {
              const s = document.createElement('style');
              s.id = 'bootstrap-greeting-hide-name';
              s.textContent = '#greeting-comma, #greeting-name { display: none !important; }';
              document.head.appendChild(s);
            }
          } else if (styleEl) {
            styleEl.remove();
          }
          if (typeof App !== 'undefined' && App.updateGreeting) {
            App.updateGreeting();
          }
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(val ? 'Name shown' : 'Name hidden');
          }
        }), 'Show your name next to the greeting message'),
        _rowStacked(I18n.t('yourName', 'Your name'), _nameInput()),
        _rowStacked(I18n.t('customGreeting', 'Custom greeting'), _customGreetingInput()),
      ]));

      Storage.getSync(['showGreetingName']).then(data => {
        if (data && data.showGreetingName !== undefined) {
          const chk = document.getElementById('toggle-showGreetingName');
          if (chk) chk.checked = (data.showGreetingName !== false);
        }
      });

      // 5. Weather
      const weatherEl = document.getElementById('weather-widget');
      const isWeatherVisible = weatherEl ? weatherEl.style.display !== 'none' : true;

      container.appendChild(_section(I18n.t('weather', 'Weather'), [
        _row('Weather', _toggle('showWeather', isWeatherVisible, async (val) => {
          const widget = document.getElementById('weather-widget');
          if (widget) widget.style.display = val ? '' : 'none';
          const data = await Storage.getSync(['widgetVisibility']);
          const vis = data.widgetVisibility || {};
          vis['weather-widget'] = val;
          await Storage.setSync({ widgetVisibility: vis });
        }), 'Show weather in top header'),
        _row(I18n.t('temperatureUnit', 'Temperature'), _tempUnitGroup()),
        _rowStacked(I18n.t('location', 'Location'), _weatherLocationRow()),
      ]));

    } else if (tabId === 'tools') {
      const bkmBtn = document.getElementById('btn-bookmarks');
      const isBkmVisible = bkmBtn ? bkmBtn.style.display !== 'none' : true;
      const isBkmIcons = (typeof Bookmarks !== 'undefined' && typeof Bookmarks.getShowIcons === 'function')
        ? Bookmarks.getShowIcons()
        : true;

      const aiBtn = document.getElementById('btn-ai-tools');
      const isAiVisible = aiBtn ? aiBtn.style.display !== 'none' : false;

      const gAppsBtn = document.getElementById('btn-google-apps');
      const isGAppsVisible = gAppsBtn ? gAppsBtn.style.display !== 'none' : true;

      const onAiToolsSettings = () => {
        const openAiTools = () => {
          if (aiBtn) {
            aiBtn.style.display = '';
            aiBtn.click();
          }
        };
        if (typeof Panels !== 'undefined') {
          Panels.close('settings-panel', openAiTools);
        } else {
          document.getElementById('settings-panel').style.display = 'none';
          openAiTools();
        }
      };

      container.appendChild(_section('Bookmarks', [
        _row('Bookmarks Sidebar', _toggle('bookmarks', isBkmVisible, async (val) => {
          const btn = document.getElementById('btn-bookmarks');
          if (btn) btn.style.display = val ? '' : 'none';
          await Storage.setSync({ showBookmarksNav: val });
        }), 'Show bookmarks button in top navigation'),
        _row('Bookmark Icons', _toggle('bookmarkIcons', isBkmIcons, async (val) => {
          if (typeof Bookmarks !== 'undefined' && typeof Bookmarks.setShowIcons === 'function') {
            Bookmarks.setShowIcons(val);
          }
          await Storage.setSync({ showBookmarkIcons: val });
        }), 'Show website icons for bookmarks')
      ]));

      container.appendChild(_section('AI Tools', [
        _row('AI Tools Button', _toggle('aiTools', isAiVisible, async (val) => {
          const btn = document.getElementById('btn-ai-tools');
          if (btn) btn.style.display = val ? '' : 'none';
          await Storage.setSync({ showAiTools: val });
        }), 'Show shortcuts for AI tools'),
        _row('Manage AI Tools', _iconBtn(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`, onAiToolsSettings), 'Configure AI tools shortcuts', onAiToolsSettings)
      ]));

      container.appendChild(_section('Google Apps', [
        _row('Google Apps Menu', _toggle('googleApps', isGAppsVisible, async (val) => {
          const btn = document.getElementById('btn-google-apps');
          if (btn) btn.style.display = val ? '' : 'none';
          await Storage.setSync({ showGoogleApps: val });
        }), 'Show shortcuts for Google Apps'),
        _rowStacked('', _avatarControls())
      ]));

    } else if (tabId === 'system') {
      container.appendChild(_settingsHeaderButtons());

      container.appendChild(_section(I18n.t('language', 'Language'), [
        _rowStacked('', _languageSelect()),
      ]));

      container.appendChild(_section(I18n.t('data', 'Data & Backup'), [
        _rowStacked('', _dataButtons()),
        _rowStacked('', _privacyNote()),
      ]));
    }
  }

  // === UI BUILDERS ===

  function _settingsHeaderButtons() {
    const wrap = document.createElement('div');
    wrap.className = 'settings-top-actions';

    const gh = document.createElement('a');
    gh.className = 'settings-pill-btn settings-btn-github';
    gh.href = 'https://github.com/UdithaAnuhas/AuraTab';
    gh.target = '_blank';
    gh.rel = 'noopener noreferrer';
    gh.title = 'Star AuraTab on GitHub';
    gh.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      <span>GitHub</span>
    `;

    const pf = document.createElement('a');
    pf.className = 'settings-pill-btn settings-btn-portfolio';
    pf.href = 'https://uditha-anuhas.vercel.app/';
    pf.target = '_blank';
    pf.rel = 'noopener noreferrer';
    pf.title = 'Visit Developer Portfolio';
    pf.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span>Portfolio</span>
    `;

    const fb = document.createElement('a');
    fb.className = 'settings-pill-btn settings-btn-feedback';
    fb.href = 'feedback.html';
    fb.target = '_blank';
    fb.rel = 'noopener noreferrer';
    fb.title = 'Send Feedback';
    fb.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#c084fc">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6.5 9c-.83 0-1.5-.67-1.5-1.5S12.67 8 13.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5 0c-.83 0-1.5-.67-1.5-1.5S7.67 8 8.5 8 10 8.67 10 9.5 9.33 11 8.5 11z"/>
      </svg>
      <span>Feedback</span>
    `;

    wrap.appendChild(gh);
    wrap.appendChild(pf);
    wrap.appendChild(fb);
    return wrap;
  }

  function _section(title, children) {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-card-wrapper';
    
    // Accordion Header
    const header = document.createElement('div');
    header.className = 'settings-card-header';
    
    const h = document.createElement('h3');
    h.className = 'settings-card-title';
    h.textContent = title;
    
    const arrow = document.createElement('div');
    arrow.className = 'settings-card-arrow';
    arrow.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    
    header.appendChild(h);
    header.appendChild(arrow);
    
    // Body
    const body = document.createElement('div');
    body.className = 'settings-card-body';
    children.forEach(c => { if (c) body.appendChild(c); });
    
    header.addEventListener('click', () => {
      wrapper.classList.toggle('collapsed');
    });
    
    wrapper.appendChild(header);
    wrapper.appendChild(body);
    return wrapper;
  }

  function _row(label, control, subtitle = '', onClick = null) {
    const div = document.createElement('div');
    div.className = 'settings-row';
    if (onClick) {
      div.style.cursor = 'pointer';
      div.addEventListener('click', (e) => {
        if (!control || !control.contains(e.target)) onClick(e);
      });
    }
    
    const textWrap = document.createElement('div');
    textWrap.className = 'settings-row-text';
    
    const lbl = document.createElement('div');
    lbl.className = 'settings-label';
    lbl.innerHTML = label;
    textWrap.appendChild(lbl);
    
    if (subtitle) {
      const sub = document.createElement('div');
      sub.className = 'settings-sublabel';
      sub.textContent = subtitle;
      textWrap.appendChild(sub);
    }
    
    div.appendChild(textWrap);
    
    const controlWrap = document.createElement('div');
    controlWrap.className = 'settings-row-control';
    if (control) controlWrap.appendChild(control);
    div.appendChild(controlWrap);
    
    return div;
  }

  function _rowStacked(label, control) {
    const div = document.createElement('div');
    div.className = 'settings-row settings-row-stacked';
    if (label) {
      const lbl = document.createElement('span');
      lbl.className = 'settings-label';
      lbl.textContent = label;
      div.appendChild(lbl);
    }
    if (control) div.appendChild(control);
    return div;
  }

  function _toggle(id, initialValue, onChange) {
    const label = document.createElement('label');
    label.className = 'toggle-switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'toggle-' + id;
    input.checked = initialValue;
    input.addEventListener('change', () => onChange(input.checked));
    const slider = document.createElement('span');
    slider.className = 'toggle-slider';
    label.appendChild(input);
    label.appendChild(slider);
    return label;
  }

  function _themeModeGroup() {
    const group = document.createElement('div');
    group.className = 'theme-mode-group';
    ['light', 'dark', 'auto'].forEach(mode => {
      const btn = document.createElement('button');
      btn.className = 'theme-mode-btn' + (Theme.mode === mode ? ' active' : '');
      btn.textContent = I18n.t(mode, mode.charAt(0).toUpperCase() + mode.slice(1));
      btn.addEventListener('click', () => {
        Theme.setMode(mode);
        Theme.save();
        group.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      group.appendChild(btn);
    });
    return group;
  }

  function _colorPicker() {
    const wrap = document.createElement('div');
    wrap.className = 'color-picker-row';
    
    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'color-picker-input';
    input.id = 'theme-color-picker-input';
    input.value = (Theme.accent && Theme.accent.length === 7) ? Theme.accent : '#6366f1';
    input.title = I18n.t('pickCustomColor', 'Pick custom accent color');

    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'glass-input color-picker-hex';
    hexInput.id = 'theme-color-hex-input';
    hexInput.maxLength = 7;
    hexInput.value = (Theme.accent || '#6366F1').toUpperCase();
    hexInput.placeholder = '#6366F1';
    hexInput.spellcheck = false;

    const applyColor = (hex, showToast = false) => {
      if (!hex) return;
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        Theme.setCustomAccent(hex);
        Theme.save();
        input.value = hex;
        hexInput.value = hex.toUpperCase();
        document.querySelectorAll('.theme-preset-btn').forEach(b => b.classList.remove('active'));
        if (showToast && typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Accent color: ${hex.toUpperCase()}`);
        }
      }
    };

    input.addEventListener('input', () => applyColor(input.value));
    input.addEventListener('change', () => applyColor(input.value, true));

    hexInput.addEventListener('input', () => {
      let val = hexInput.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        applyColor(val);
      }
    });

    hexInput.addEventListener('change', () => {
      let val = hexInput.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        applyColor(val, true);
      } else {
        hexInput.value = (Theme.accent || '#6366F1').toUpperCase();
      }
    });

    wrap.appendChild(input);
    wrap.appendChild(hexInput);
    return wrap;
  }

  function _presetsGrid() {
    const grid = document.createElement('div');
    grid.className = 'theme-presets-grid';
    Object.entries(Theme.PRESETS).forEach(([key, preset]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-preset-chip theme-preset-btn' + (Theme.preset === key ? ' active' : '');
      btn.dataset.preset = key;
      btn.title = preset.name;

      const dot = document.createElement('span');
      dot.className = 'preset-chip-dot';
      dot.style.setProperty('--preset-color', preset.accent);

      const label = document.createElement('span');
      label.className = 'preset-chip-name';
      label.textContent = I18n.t(key, preset.name);

      const check = document.createElement('span');
      check.className = 'preset-chip-check';
      check.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

      btn.appendChild(dot);
      btn.appendChild(label);
      btn.appendChild(check);

      btn.addEventListener('click', () => {
        Theme.setPreset(key);
        Theme.save();
        grid.querySelectorAll('.theme-preset-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Update color picker & hex input
        const picker = document.querySelector('.color-picker-input');
        if (picker) picker.value = preset.accent;
        const hex = document.querySelector('.color-picker-hex');
        if (hex) hex.value = preset.accent.toUpperCase();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Preset: ${preset.name}`);
        }
      });
      grid.appendChild(btn);
    });
    return grid;
  }

  function _extractButton() {
    const btn = document.createElement('button');
    btn.className = 'settings-btn';
    btn.textContent = I18n.t('extractFromWallpaper', 'Extract from wallpaper');
    btn.addEventListener('click', async () => {
      const color = await Wallpaper.extractSeedColor();
      if (color) {
        Theme.setCustomAccent(color);
        Theme.setMaterialYou(true);
        Theme.save();
        _buildSettingsUI('style'); // Refresh
        App.showToast('Color extracted!');
      } else {
        App.showToast('No wallpaper to extract from');
      }
    });
    return btn;
  }

  function _nameInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glass-input';
    input.placeholder = I18n.t('yourName', 'Your name');
    input.id = 'settings-name-input';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');

    Storage.getSync(['userName']).then(data => {
      input.value = data.userName || '';
    });

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const val = input.value.trim();
        await Storage.setSync({ userName: val });
        localStorage.setItem('hometab_userName', val);
        App.updateGreeting();
      }, 300);
    });
    return input;
  }

  function _customGreetingInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glass-input';
    input.placeholder = I18n.t('customGreeting', 'Custom greeting (overrides time-based)');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');

    Storage.getSync(['customGreeting']).then(data => {
      input.value = data.customGreeting || '';
    });

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        await Storage.setSync({ customGreeting: input.value.trim() });
        App.updateGreeting();
      }, 300);
    });
    return input;
  }

  function _clockStyleGroup() {
    const group = document.createElement('div');
    group.className = 'clock-style-group';

    const options = [
      { id: 'digital', label: 'Numerical (3D Depth)' },
      { id: 'analog', label: 'Rounded (Glass Dial)' },
    ];

    const currentMode = (typeof Clock !== 'undefined' && Clock.mode) ? Clock.mode : 'digital';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'clock-style-btn' + (currentMode === opt.id ? ' active' : '');
      btn.setAttribute('data-mode', opt.id);
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (typeof Clock !== 'undefined' && Clock.setMode) {
          Clock.setMode(opt.id);
        }
        group.querySelectorAll('.clock-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Clock style: ${opt.label}`);
        }
      });
      group.appendChild(btn);
    });

    return group;
  }

  function _clockFontPicker() {
    const container = document.createElement('div');
    container.className = 'clock-font-grid';

    const fonts = [
      { id: 'Outfit', name: 'Outfit', sub: 'Geometric (Default)', family: "'Outfit', sans-serif" },
      { id: 'iOS Rounded', name: 'iOS Rounded', sub: 'Lock Screen (Reference)', family: "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'SF Pro Display', 'Plus Jakarta Sans', 'Inter', sans-serif" },
      { id: 'iOS', name: 'Apple iOS', sub: 'SF Pro Display', family: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'SF Pro', 'Plus Jakarta Sans', 'Inter', sans-serif" },
      { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', sub: 'iOS Minimalist', family: "'Plus Jakarta Sans', sans-serif" },
      { id: 'Inter', name: 'Inter', sub: 'Ultra-Crisp Modern', family: "'Inter', sans-serif" },
      { id: 'Space Grotesk', name: 'Space Grotesk', sub: 'Cyberpunk Tech', family: "'Space Grotesk', sans-serif" },
      { id: 'Urbanist', name: 'Urbanist', sub: 'Neo-Grotesque', family: "'Urbanist', sans-serif" },
      { id: 'Orbitron', name: 'Orbitron', sub: 'Digital HUD', family: "'Orbitron', sans-serif" },
      { id: 'System', name: 'System', sub: 'Clean Standard', family: 'system-ui, -apple-system, sans-serif' },
    ];

    const current = (typeof Clock !== 'undefined' && Clock.font) ? Clock.font : (localStorage.getItem('hometab_clock_font') || 'Outfit');

    fonts.forEach(f => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'clock-font-card' + (f.id === current ? ' active' : '');
      card.setAttribute('aria-label', `${f.name} font`);

      const preview = document.createElement('div');
      preview.className = 'clock-font-preview';
      preview.style.fontFamily = f.family;
      preview.textContent = '12:45';

      const meta = document.createElement('div');
      meta.className = 'clock-font-meta';

      const name = document.createElement('span');
      name.className = 'clock-font-name';
      name.textContent = f.name;

      const sub = document.createElement('span');
      sub.className = 'clock-font-sub';
      sub.textContent = f.sub;

      meta.appendChild(name);
      meta.appendChild(sub);
      card.appendChild(preview);
      card.appendChild(meta);

      card.addEventListener('click', () => {
        if (typeof Clock !== 'undefined' && Clock.setFont) {
          Clock.setFont(f.id);
        } else {
          localStorage.setItem('hometab_clock_font', f.id);
          document.documentElement.style.setProperty('--font-clock', f.family);
        }
        container.querySelectorAll('.clock-font-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Clock font: ${f.name}`);
        }
      });

      container.appendChild(card);
    });

    return container;
  }

  function _searchEngineSelect() {
    const select = document.createElement('select');
    select.className = 'settings-select';
    Search.ENGINES.forEach(engine => {
      const opt = document.createElement('option');
      opt.value = engine.id;
      opt.textContent = engine.name;
      opt.selected = Search.engine === engine.id;
      select.appendChild(opt);
    });
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = I18n.t('custom', 'Custom');
    customOpt.selected = Search.engine === 'custom';
    select.appendChild(customOpt);

    select.addEventListener('change', async () => {
      await Storage.setSync({ searchEngine: select.value });
      location.reload();
    });
    return select;
  }

  function _aiProviderSelect() {
    const select = document.createElement('select');
    select.className = 'settings-select';
    const providers = [
      { id: 'google_ai', name: 'Google AI Mode (Official)' },
      { id: 'gemini', name: 'Google Gemini' },
      { id: 'chatgpt', name: 'ChatGPT' },
      { id: 'perplexity', name: 'Perplexity AI' },
    ];
    const current = localStorage.getItem('hometab_ai_provider') || 'google_ai';
    providers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      opt.selected = current === p.id;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      localStorage.setItem('hometab_ai_provider', select.value);
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`AI Provider: ${select.options[select.selectedIndex].text}`);
      }
    });
    return select;
  }

  function _customSearchUrlInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glass-input';
    input.placeholder = 'https://example.com/search?q={q}';
    input.value = Search.customUrl || '';
    input.addEventListener('change', () => {
      Search.setCustomUrl(input.value.trim());
    });
    return input;
  }

  function _tempUnitGroup() {
    const group = document.createElement('div');
    group.className = 'theme-mode-group';
    ['celsius', 'fahrenheit'].forEach(u => {
      const btn = document.createElement('button');
      btn.className = 'theme-mode-btn' + (Weather.unit === u ? ' active' : '');
      btn.textContent = u === 'celsius' ? '°C' : '°F';
      btn.addEventListener('click', () => {
        Weather.setUnit(u);
        group.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      group.appendChild(btn);
    });
    return group;
  }

  function _weatherLocationRow() {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '8px';

    const searchWrap = document.createElement('div');
    searchWrap.style.position = 'relative';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glass-input';
    input.placeholder = I18n.t('searchCity', 'Search city...');
    input.value = Weather.location ? `${Weather.location.name}${Weather.location.country ? ', ' + Weather.location.country : ''}` : '';

    const results = document.createElement('ul');
    results.className = 'weather-city-results';
    results.style.listStyle = 'none';

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const cities = await Weather.searchCity(input.value.trim());
        results.innerHTML = '';
        cities.forEach(city => {
          const li = document.createElement('li');
          li.className = 'weather-city-result';
          li.textContent = `${city.name}${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}`;
          li.addEventListener('click', async () => {
            await Weather.setLocation(city);
            input.value = `${city.name}, ${city.country}`;
            results.innerHTML = '';
            App.showToast(`Weather: ${city.name}`);
          });
          results.appendChild(li);
        });
      }, 300);
    });

    searchWrap.appendChild(input);
    searchWrap.appendChild(results);
    wrap.appendChild(searchWrap);

    // Geolocation button
    const geoBtn = document.createElement('button');
    geoBtn.className = 'settings-btn';
    geoBtn.textContent = I18n.t('useGeolocation', 'Use geolocation');
    geoBtn.addEventListener('click', async () => {
      try {
        geoBtn.textContent = '...';
        const loc = await Weather.useGeolocation();
        input.value = `${loc.name}, ${loc.country}`;
        App.showToast(`Location: ${loc.name}`);
      } catch (e) {
        App.showToast('Geolocation failed: ' + e.message);
      } finally {
        geoBtn.textContent = I18n.t('useGeolocation', 'Use geolocation');
      }
    });
    wrap.appendChild(geoBtn);

    return wrap;
  }

  function _wallpaperTabs() {
    const wrap = document.createElement('div');
    wrap.className = 'wallpaper-tabs';
    const tabs = [
      { id: 'curated', label: 'Curated' },
      { id: 'daily', label: 'Daily' },
      { id: 'mesh', label: 'Gradient' },
      { id: 'upload', label: 'Upload' },
      { id: 'url', label: 'URL' },
    ];
    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'wallpaper-tab' + (Wallpaper.source === tab.id ? ' active' : '');
      btn.textContent = tab.label;
      btn.dataset.tab = tab.id;
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.wallpaper-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Wallpaper.setSource(tab.id);
        _updateWallpaperContent(tab.id);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function _wallpaperContent() {
    const wrap = document.createElement('div');
    wrap.id = 'wallpaper-content-area';
    _updateWallpaperContent(Wallpaper.source, wrap);
    return wrap;
  }

  function _updateWallpaperContent(source, container) {
    const wrap = container || document.getElementById('wallpaper-content-area');
    if (!wrap) return;
    wrap.innerHTML = '';

    switch (source) {
      case 'curated': {
        const grid = document.createElement('div');
        grid.className = 'curated-gallery-grid';

        const wallpapers = Wallpaper.curatedWallpapers || [];
        wallpapers.forEach(w => {
          const card = document.createElement('div');
          const isSelected = Wallpaper.currentCuratedId === w.id;
          card.className = 'wallpaper-thumb-card' + (isSelected ? ' active' : '');
          card.style.backgroundImage = `url("${w.thumb}")`;
          card.title = w.name;

          const title = document.createElement('span');
          title.className = 'card-title';
          title.textContent = w.name;
          card.appendChild(title);

          if (isSelected) {
            const check = document.createElement('span');
            check.className = 'card-check';
            check.textContent = '✓';
            card.appendChild(check);
          }

          card.addEventListener('click', async () => {
            grid.querySelectorAll('.wallpaper-thumb-card').forEach(c => {
              c.classList.remove('active');
              const chk = c.querySelector('.card-check');
              if (chk) chk.remove();
            });
            card.classList.add('active');
            const check = document.createElement('span');
            check.className = 'card-check';
            check.textContent = '✓';
            card.appendChild(check);

            await Wallpaper.setCuratedWallpaper(w.id);
            App.showToast(`Wallpaper: ${w.name}`);
          });

          grid.appendChild(card);
        });

        wrap.appendChild(grid);

        // Shuffle button
        const shuffleBtn = document.createElement('button');
        shuffleBtn.className = 'settings-btn';
        shuffleBtn.innerHTML = '🎲 Next Wallpaper';
        shuffleBtn.style.width = '100%';
        shuffleBtn.addEventListener('click', async () => {
          const next = await Wallpaper.cycleWallpaper();
          _updateWallpaperContent('curated', wrap);
          App.showToast(`Wallpaper: ${next.name}`);
        });
        wrap.appendChild(shuffleBtn);
        break;
      }
      case 'daily': {
        const desc = document.createElement('p');
        desc.className = 'settings-sublabel';
        desc.style.marginBottom = '12px';
        desc.textContent = 'Rotates automatically every day to a fresh scenic wallpaper.';
        wrap.appendChild(desc);

        const btn = document.createElement('button');
        btn.className = 'settings-btn';
        btn.textContent = I18n.t('newImage', 'Change Now');
        btn.addEventListener('click', async () => {
          btn.textContent = '...';
          const next = await Wallpaper.cycleWallpaper();
          btn.textContent = I18n.t('newImage', 'Change Now');
          App.showToast(`Wallpaper: ${next.name}`);
        });
        wrap.appendChild(btn);
        break;
      }
      case 'mesh': {
        const desc = document.createElement('p');
        desc.className = 'settings-sublabel';
        desc.style.marginBottom = '12px';
        desc.textContent = 'A vibrant, multi-color glowing mesh gradient without any external image.';
        wrap.appendChild(desc);
        break;
      }
      case 'upload': {
        const uploadWrap = document.createElement('div');
        uploadWrap.className = 'upload-section-wrap';

        // Check if an uploaded custom wallpaper already exists
        Wallpaper.getUploadedWallpaper().then(dataUrl => {
          if (dataUrl) {
            const previewCard = document.createElement('div');
            previewCard.className = 'upload-preview-card';
            previewCard.style.backgroundImage = `url("${dataUrl}")`;
            previewCard.innerHTML = `<span class="upload-preview-badge">✓ Active Custom Wallpaper</span>`;
            uploadWrap.insertBefore(previewCard, uploadWrap.firstChild);
          }
        });

        // Hidden native file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.id = 'hometab-wallpaper-file-input';
        fileInput.style.display = 'none';

        // Clickable label bound to the file input
        const label = document.createElement('label');
        label.className = 'upload-area';
        label.htmlFor = 'hometab-wallpaper-file-input';
        label.style.display = 'block';
        label.style.cursor = 'pointer';
        label.innerHTML = `
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 8px; display: block; opacity: 0.85;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p style="font-weight: 500; font-size: 13px; margin-bottom: 4px;">${I18n.t('uploadImage', 'Click to choose image or drag & drop')}</p>
          <span style="font-size: 11px; opacity: 0.65; display: block;">Supports JPG, PNG, WebP, GIF</span>
        `;

        async function processFile(file) {
          if (!file) return;
          try {
            App.showToast('Processing wallpaper...');
            await Wallpaper.uploadImage(file);
            _updateWallpaperContent('upload', wrap);
            App.showToast('Wallpaper applied successfully!');
          } catch (err) {
            console.error('Upload error:', err);
            App.showToast(err.message || 'Failed to upload image');
          }
        }

        fileInput.addEventListener('change', () => {
          if (fileInput.files && fileInput.files[0]) {
            processFile(fileInput.files[0]);
          }
        });

        // Drag & drop
        label.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          label.style.borderColor = 'var(--accent)';
          label.style.background = 'var(--accent-dim)';
        });
        label.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          label.style.borderColor = '';
          label.style.background = '';
        });
        label.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          label.style.borderColor = '';
          label.style.background = '';
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        });

        uploadWrap.appendChild(fileInput);
        uploadWrap.appendChild(label);

        // Remove / Reset button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'settings-btn settings-btn-danger';
        removeBtn.textContent = I18n.t('removeWallpaper', 'Reset to Default');
        removeBtn.style.marginTop = '12px';
        removeBtn.style.width = '100%';
        removeBtn.addEventListener('click', async () => {
          await Wallpaper.remove();
          _updateWallpaperContent('upload', wrap);
          App.showToast('Wallpaper reset to default');
        });
        uploadWrap.appendChild(removeBtn);

        wrap.appendChild(uploadWrap);
        break;
      }
      case 'url': {
        const input = document.createElement('input');
        input.type = 'url';
        input.className = 'glass-input';
        input.placeholder = I18n.t('enterUrl', 'Enter URL...');
        input.value = Wallpaper.settings.url || '';
        input.setAttribute('autocomplete', 'off');
        input.addEventListener('change', async () => {
          try {
            await Wallpaper.setUrl(input.value.trim());
            App.showToast('Wallpaper URL set!');
          } catch (err) {
            App.showToast(err.message);
          }
        });
        wrap.appendChild(input);
        break;
      }
    }
  }

  function _rangeSlider(id, value, min, max, onChange) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '8px';
    wrap.style.flex = '1';
    wrap.style.maxWidth = '180px';

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'settings-range';
    input.id = id;
    input.min = min;
    input.max = max;
    input.value = value;

    const val = document.createElement('span');
    val.style.fontSize = 'var(--fs-xs)';
    val.style.color = 'var(--text-secondary)';
    val.style.minWidth = '36px';
    val.style.textAlign = 'right';
    const isPercent = id === 'clockSize' || id === 'wallDim' || id === 'wallBright';
    val.textContent = value + (isPercent ? '%' : '');

    input.addEventListener('input', () => {
      val.textContent = input.value + (isPercent ? '%' : '');
      onChange(parseInt(input.value));
    });

    wrap.appendChild(input);
    wrap.appendChild(val);
    return wrap;
  }

  function _widgetToggle(widgetId, label) {
    const el = document.getElementById(widgetId);
    const isVisible = el ? el.style.display !== 'none' : true;

    return _row(label, _toggle('widget-' + widgetId, isVisible, async (val) => {
      const widget = document.getElementById(widgetId);
      if (widget) widget.style.display = val ? '' : 'none';
      // Save widget visibility
      const data = await Storage.getSync(['widgetVisibility']);
      const vis = data.widgetVisibility || {};
      vis[widgetId] = val;
      await Storage.setSync({ widgetVisibility: vis });
    }));
  }

  function _avatarControls() {
    const card = document.createElement('div');
    card.className = 'settings-avatar-card';

    // Left info (preview + text)
    const info = document.createElement('div');
    info.className = 'settings-avatar-info';

    const preview = document.createElement('img');
    preview.className = 'settings-avatar-preview';
    preview.alt = 'Account Avatar';
    const initialUrl = (window.AccountAvatar && window.AccountAvatar.getAvatarUrl) 
      ? window.AccountAvatar.getAvatarUrl() 
      : 'icons/account_avatar.png';
    const onPreviewErr = () => {
      preview.removeEventListener('error', onPreviewErr);
      preview.src = 'icons/account_avatar.png';
    };
    preview.addEventListener('error', onPreviewErr);
    preview.src = initialUrl;

    const textWrap = document.createElement('div');
    textWrap.className = 'settings-avatar-text';

    const title = document.createElement('span');
    title.className = 'settings-avatar-title';
    title.textContent = 'Account Profile Photo';

    const hint = document.createElement('span');
    hint.className = 'settings-avatar-hint';
    hint.textContent = 'Sync with active Google account or upload custom';

    textWrap.appendChild(title);
    textWrap.appendChild(hint);

    info.appendChild(preview);
    info.appendChild(textWrap);

    // Right actions
    const actions = document.createElement('div');
    actions.className = 'settings-avatar-btns';

    // 1. Sync Google Button
    const syncBtn = document.createElement('button');
    syncBtn.type = 'button';
    syncBtn.className = 'settings-avatar-btn primary';
    syncBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
      <span>Sync Google</span>
    `;
    syncBtn.title = 'Fetch photo from active Google account session';
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      const originalHtml = syncBtn.innerHTML;
      syncBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="spin">
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
        <span>Syncing...</span>
      `;
      try {
        if (window.AccountAvatar && window.AccountAvatar.syncFromGoogle) {
          await window.AccountAvatar.syncFromGoogle();
          preview.src = window.AccountAvatar.getAvatarUrl();
        }
      } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = originalHtml;
      }
    });

    // 2. Upload Button + Hidden Input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const tempImg = new Image();
        tempImg.onload = async () => {
          const canvas = document.createElement('canvas');
          const minDim = Math.min(tempImg.width, tempImg.height);
          const sx = (tempImg.width - minDim) / 2;
          const sy = (tempImg.height - minDim) / 2;
          const targetDim = Math.min(128, minDim);
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(tempImg, sx, sy, minDim, minDim, 0, 0, targetDim, targetDim);
          const dataUrl = canvas.toDataURL('image/png');
          if (window.AccountAvatar && window.AccountAvatar.setAvatar) {
            await window.AccountAvatar.setAvatar(dataUrl);
            preview.src = dataUrl;
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast('Profile photo updated!');
            }
          }
        };
        tempImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'settings-avatar-btn';
    uploadBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span>Upload</span>
    `;
    uploadBtn.title = 'Upload any custom avatar image';
    uploadBtn.addEventListener('click', () => fileInput.click());

    // 3. Reset Button
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'settings-avatar-btn';
    resetBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
      <span>Reset</span>
    `;
    resetBtn.title = 'Reset to default Google Account icon';
    resetBtn.addEventListener('click', async () => {
      if (window.AccountAvatar && window.AccountAvatar.resetAvatar) {
        await window.AccountAvatar.resetAvatar();
        preview.src = window.AccountAvatar.getAvatarUrl();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Avatar reset to default');
        }
      }
    });

    actions.appendChild(syncBtn);
    actions.appendChild(uploadBtn);
    actions.appendChild(fileInput);
    actions.appendChild(resetBtn);

    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }

  function _languageSelect() {
    const select = document.createElement('select');
    select.className = 'settings-select';
    select.style.width = '100%';
    I18n.SUPPORTED_LANGS.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = `${lang.nativeName} (${lang.name})`;
      opt.selected = I18n.currentLang === lang.code;
      select.appendChild(opt);
    });
    select.addEventListener('change', async () => {
      await I18n.load(select.value);
      _buildSettingsUI('system');
      App.updateGreeting();
    });
    return select;
  }

  function _dataButtons() {
    const wrap = document.createElement('div');
    wrap.className = 'settings-btn-row';

    // Export
    const exportBtn = document.createElement('button');
    exportBtn.className = 'settings-btn';
    exportBtn.textContent = I18n.t('exportSettings', 'Export');
    exportBtn.addEventListener('click', async () => {
      try {
        const data = await Storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hometab-settings.json';
        a.click();
        URL.revokeObjectURL(url);
        App.showToast('Settings exported!');
      } catch (e) {
        App.showToast('Export failed: ' + e.message);
      }
    });

    // Import
    const importBtn = document.createElement('button');
    importBtn.className = 'settings-btn';
    importBtn.textContent = I18n.t('importSettings', 'Import');
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', async () => {
        if (!input.files[0]) return;
        try {
          const text = await input.files[0].text();
          const data = JSON.parse(text);
          await Storage.importAll(data);
          App.showToast('Settings imported! Reloading...');
          setTimeout(() => location.reload(), 1000);
        } catch (e) {
          App.showToast('Import failed: ' + e.message);
        }
      });
      input.click();
    });

    // Reset
    const resetBtn = document.createElement('button');
    resetBtn.className = 'settings-btn settings-btn-danger';
    resetBtn.textContent = I18n.t('resetDefaults', 'Reset');
    resetBtn.addEventListener('click', async () => {
      if (confirm(I18n.t('confirmReset', 'Are you sure? This will erase all settings and data.'))) {
        await Storage.resetAll();
        localStorage.clear();
        App.showToast('Reset! Reloading...');
        setTimeout(() => location.reload(), 1000);
      }
    });

    wrap.appendChild(exportBtn);
    wrap.appendChild(importBtn);
    wrap.appendChild(resetBtn);
    return wrap;
  }

  function _iconBtn(svgHTML, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.innerHTML = svgHTML;
    btn.style.color = 'var(--text-tertiary)';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onClick) onClick(e);
    });
    return btn;
  }

  function _privacyNote() {
    const p = document.createElement('p');
    p.className = 'privacy-note';
    p.textContent = I18n.t('privacyNote', 'Privacy: All data stays on your device. Only weather data is fetched from Open-Meteo (no API key, no tracking). Wallpaper images may be loaded from picsum.photos for daily random backgrounds.');
    return p;
  }

  function _showShortcutsOrganizer() {
    const body = document.getElementById('settings-body');
    if (!body) return;
    body.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'shortcuts-organizer-container fade-in';

    // Header: Back button + Title "Saved Shortcuts" + "+" Add button
    const header = document.createElement('div');
    header.className = 'shortcuts-organizer-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'shortcuts-organizer-title-group';

    const backBtn = document.createElement('button');
    backBtn.className = 'shortcuts-organizer-back-btn';
    backBtn.type = 'button';
    backBtn.title = 'Back to Settings';
    backBtn.setAttribute('aria-label', 'Back to Settings');
    backBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
    backBtn.addEventListener('click', () => {
      _buildSettingsUI('widgets');
    });

    const title = document.createElement('h3');
    title.className = 'shortcuts-organizer-title';
    title.textContent = 'Saved Shortcuts';

    titleGroup.appendChild(backBtn);
    titleGroup.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'shortcuts-organizer-actions';

    const addTopBtn = document.createElement('button');
    addTopBtn.className = 'shortcuts-organizer-action-btn';
    addTopBtn.type = 'button';
    addTopBtn.title = 'Add new shortcut';
    addTopBtn.setAttribute('aria-label', 'Add shortcut');
    addTopBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

    actions.appendChild(addTopBtn);
    header.appendChild(titleGroup);
    header.appendChild(actions);
    container.appendChild(header);

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.className = 'shortcuts-organizer-subtitle';
    subtitle.textContent = 'Drag to reorder your shortcuts, delete ones you don\'t need, or add new ones.';
    container.appendChild(subtitle);

    // Inline Add/Edit Form Card (hidden by default)
    const formCard = document.createElement('div');
    formCard.className = 'shortcut-organizer-form-card';
    formCard.style.display = 'none';
    formCard.innerHTML = `
      <div style="font-size: var(--fs-xs); font-weight: 600; color: var(--settings-text-primary);" id="shortcut-form-label">Add Shortcut</div>
      <div>
        <input type="text" id="organizer-name-input" placeholder="Shortcut Name (e.g. Gmail)" autocomplete="off">
      </div>
      <div>
        <input type="text" id="organizer-url-input" placeholder="URL (e.g. https://mail.google.com)" autocomplete="off">
      </div>
      <div class="shortcut-organizer-form-actions">
        <button type="button" class="shortcut-organizer-btn-cancel" id="organizer-form-cancel">Cancel</button>
        <button type="button" class="shortcut-organizer-btn-save" id="organizer-form-save">Save</button>
      </div>
    `;
    container.appendChild(formCard);

    let activeEditId = null;

    const showAddForm = () => {
      activeEditId = null;
      const label = document.getElementById('shortcut-form-label');
      if (label) label.textContent = 'Add Shortcut';
      const nameInput = document.getElementById('organizer-name-input');
      const urlInput = document.getElementById('organizer-url-input');
      if (nameInput) nameInput.value = '';
      if (urlInput) urlInput.value = '';
      formCard.style.display = '';
      if (nameInput) nameInput.focus();
    };

    const showEditForm = (sc) => {
      activeEditId = sc.id;
      const label = document.getElementById('shortcut-form-label');
      if (label) label.textContent = 'Edit Shortcut';
      const nameInput = document.getElementById('organizer-name-input');
      const urlInput = document.getElementById('organizer-url-input');
      if (nameInput) nameInput.value = sc.name || '';
      if (urlInput) urlInput.value = sc.url || '';
      formCard.style.display = '';
      if (nameInput) nameInput.focus();
    };

    const hideForm = () => {
      formCard.style.display = 'none';
      activeEditId = null;
    };

    addTopBtn.addEventListener('click', () => {
      if (formCard.style.display === 'none') {
        showAddForm();
      } else {
        hideForm();
      }
    });

    const cancelBtn = formCard.querySelector('#organizer-form-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', hideForm);

    const handleFormSave = () => {
      const nameInput = document.getElementById('organizer-name-input');
      const urlInput = document.getElementById('organizer-url-input');
      const nameVal = nameInput ? nameInput.value.trim() : '';
      let urlVal = urlInput ? urlInput.value.trim() : '';
      if (!urlVal) {
        if (urlInput) urlInput.focus();
        return;
      }
      if (!urlVal.startsWith('http://') && !urlVal.startsWith('https://')) {
        urlVal = 'https://' + urlVal;
      }

      if (activeEditId && typeof Shortcuts !== 'undefined' && Shortcuts.updateShortcut) {
        Shortcuts.updateShortcut(activeEditId, nameVal, urlVal);
        if (typeof App !== 'undefined' && App.showToast) App.showToast('Shortcut updated');
      } else if (typeof Shortcuts !== 'undefined' && Shortcuts.addShortcut) {
        Shortcuts.addShortcut(nameVal, urlVal);
        if (typeof App !== 'undefined' && App.showToast) App.showToast('Shortcut added');
      }

      hideForm();
      renderList();
    };

    const saveBtn = formCard.querySelector('#organizer-form-save');
    if (saveBtn) saveBtn.addEventListener('click', handleFormSave);

    const urlInputEl = formCard.querySelector('#organizer-url-input');
    if (urlInputEl) {
      urlInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleFormSave();
      });
    }

    // List container
    const list = document.createElement('div');
    list.className = 'shortcuts-organizer-list';
    container.appendChild(list);

    // Bottom Add Button
    const addBottomBtn = document.createElement('button');
    addBottomBtn.className = 'shortcut-organizer-add-btn';
    addBottomBtn.type = 'button';
    addBottomBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Add Shortcut</span>
    `;
    addBottomBtn.addEventListener('click', showAddForm);
    container.appendChild(addBottomBtn);

    body.appendChild(container);

    let dragSrcIdx = null;

    function renderList() {
      list.innerHTML = '';
      const items = (typeof Shortcuts !== 'undefined' && Shortcuts.shortcuts) ? Shortcuts.shortcuts : [];

      if (!items || items.length === 0) {
        const empty = document.createElement('div');
        empty.style.textAlign = 'center';
        empty.style.padding = '24px 0';
        empty.style.color = 'var(--settings-text-secondary)';
        empty.style.fontSize = 'var(--fs-sm)';
        empty.textContent = 'No shortcuts saved yet.';
        list.appendChild(empty);
        return;
      }

      items.forEach((sc, idx) => {
        const card = document.createElement('div');
        card.className = 'shortcut-organizer-card';
        card.setAttribute('draggable', 'true');
        card.dataset.index = idx;

        // Drag handle
        const handle = document.createElement('div');
        handle.className = 'shortcut-organizer-drag-handle';
        handle.title = 'Drag to reorder';
        handle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/><circle cx="9" cy="12" r="1.8"/><circle cx="15" cy="12" r="1.8"/><circle cx="9" cy="18" r="1.8"/><circle cx="15" cy="18" r="1.8"/></svg>`;

        // Info (Name & URL)
        const info = document.createElement('div');
        info.className = 'shortcut-organizer-info';
        info.title = 'Click to edit';

        const nameEl = document.createElement('span');
        nameEl.className = 'shortcut-organizer-name';
        nameEl.textContent = sc.name || 'Untitled';

        const urlEl = document.createElement('span');
        urlEl.className = 'shortcut-organizer-url';
        urlEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
        const urlText = document.createTextNode(' ' + (sc.url || ''));
        urlEl.appendChild(urlText);

        info.appendChild(nameEl);
        info.appendChild(urlEl);

        info.addEventListener('click', () => {
          showEditForm(sc);
        });

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'shortcut-organizer-btn-delete';
        delBtn.type = 'button';
        delBtn.title = 'Delete shortcut';
        delBtn.setAttribute('aria-label', `Delete ${sc.name}`);
        delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof Shortcuts !== 'undefined' && Shortcuts.deleteShortcut) {
            const removed = Shortcuts.deleteShortcut(sc.id);
            renderList();
            if (typeof App !== 'undefined' && App.showToast && removed) {
              App.showToast(`Deleted ${sc.name}`, 4000, 'Undo', () => {
                Shortcuts.insertShortcut(removed.item, removed.index);
                renderList();
              });
            }
          }
        });

        card.appendChild(handle);
        card.appendChild(info);
        card.appendChild(delBtn);

        // Drag & drop handlers
        card.addEventListener('dragstart', (e) => {
          dragSrcIdx = idx;
          card.classList.add('is-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', idx.toString());
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('is-dragging');
          document.querySelectorAll('.shortcut-organizer-card').forEach(c => {
            c.classList.remove('drop-above', 'drop-below', 'is-dragging');
          });
          dragSrcIdx = null;
        });

        card.addEventListener('dragover', (e) => {
          if (dragSrcIdx === null || dragSrcIdx === idx) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const rect = card.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          card.classList.toggle('drop-above', e.clientY < midY);
          card.classList.toggle('drop-below', e.clientY >= midY);
        });

        card.addEventListener('dragleave', (e) => {
          if (!card.contains(e.relatedTarget)) {
            card.classList.remove('drop-above', 'drop-below');
          }
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          const isAbove = card.classList.contains('drop-above');
          card.classList.remove('drop-above', 'drop-below');
          if (dragSrcIdx === null || dragSrcIdx === idx) return;

          let targetIdx = idx;
          if (!isAbove && dragSrcIdx < idx) targetIdx = idx;
          else if (isAbove && dragSrcIdx > idx) targetIdx = idx;
          else if (!isAbove && dragSrcIdx > idx) targetIdx = idx + 1;
          else if (isAbove && dragSrcIdx < idx) targetIdx = Math.max(0, idx - 1);

          if (typeof Shortcuts !== 'undefined' && Shortcuts.reorderShortcuts) {
            Shortcuts.reorderShortcuts(dragSrcIdx, targetIdx);
            renderList();
          }
        });

        list.appendChild(card);
      });
    }

    renderList();
  }

  function _setupListeners() {
    const btn = document.getElementById('btn-settings');
    const panel = document.getElementById('settings-panel');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      _closeAllPopovers();
      if (typeof Panels !== 'undefined') {
        Panels.toggle(panel, () => {
          _buildSettingsUI();
        });
      } else {
        document.querySelectorAll('.side-panel').forEach(p => p.style.display = 'none');
        const isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : '';
        if (!isOpen) _buildSettingsUI();
      }
    });

    panel.querySelector('[data-close]').addEventListener('click', () => {
      if (typeof Panels !== 'undefined') {
        Panels.close(panel);
      } else {
        panel.style.display = 'none';
      }
    });

    // Close panels on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const bkmModal = document.getElementById('bookmark-edit-modal');
        const bkmCtx = document.getElementById('bookmark-context-menu');
        const scModal = document.getElementById('shortcut-modal');

        // If a modal or context menu is open, only close that modal/menu, not the side panel
        if (bkmModal && bkmModal.style.display !== 'none') {
          bkmModal.style.display = 'none';
          return;
        }
        if (bkmCtx && bkmCtx.style.display !== 'none') {
          bkmCtx.style.display = 'none';
          return;
        }
        if (scModal && scModal.style.display !== 'none') {
          scModal.style.display = 'none';
          return;
        }

        document.querySelectorAll('.popover').forEach(p => {
          p.style.display = 'none';
        });

        if (typeof Panels !== 'undefined') {
          Panels.closeAll();
        } else {
          document.querySelectorAll('.side-panel, .settings-panel').forEach(p => {
            p.style.display = 'none';
          });
        }
      }
    });

    // Close panels on click outside
    document.addEventListener('click', (e) => {
      const panels = document.querySelectorAll('.side-panel, .settings-panel');
      panels.forEach(panel => {
        const isPanelOpen = (typeof Panels !== 'undefined') ? Panels.isOpen(panel) : (panel.style.display !== 'none');
        if (isPanelOpen && !panel.contains(e.target)) {
          // Keep bookmarks panel open during bookmark interactions (context menu, edit modal, toasts, add menu)
          if (panel.id === 'bookmarks-panel') {
            if (e.target.closest('#bookmark-context-menu') ||
                e.target.closest('#bookmark-edit-modal') ||
                e.target.closest('#bookmark-add-menu') ||
                e.target.closest('#toast-container') ||
                e.target.closest('.toast')) {
              return;
            }
          }

          // Keep settings panel open during toast interactions (e.g. undoing deleted shortcuts)
          if (panel.id === 'settings-panel') {
            if (e.target.closest('#toast-container') || e.target.closest('.toast')) {
              return;
            }
          }

          // Check if the click target is a button that opens this panel
          const openers = ['btn-settings', 'btn-todo', 'btn-bookmarks'];
          const isOpener = openers.some(id => {
            const el = document.getElementById(id);
            return el && (el === e.target || el.contains(e.target));
          });
          if (!isOpener) {
            if (typeof Panels !== 'undefined') {
              Panels.close(panel);
            } else {
              panel.style.display = 'none';
            }
          }
        }
      });
    });
  }

  return { init };
})();
