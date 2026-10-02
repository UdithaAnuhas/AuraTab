/**
 * Shortcuts module
 * Modern glass speed-dial with official brand SVGs, high-res favicon loading,
 * drag-and-drop reordering, and clean editing
 */
'use strict';

const Shortcuts = (() => {
  const DEFAULT_SHORTCUTS = [
    { id: '1', name: 'GitHub', url: 'https://github.com' },
    { id: '2', name: 'Gmail', url: 'https://mail.google.com' },
    { id: '3', name: 'Drive', url: 'https://drive.google.com' },
    { id: '4', name: 'Figma', url: 'https://figma.com' },
    { id: '5', name: 'YouTube', url: 'https://youtube.com' },
  ];

  // Official authentic SVG brand logos
  const BRAND_SVGS = {
    'drive.google.com': `<svg viewBox="0 0 87.3 78" width="30" height="30"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>`,
    'figma.com': `<svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/><path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/></svg>`,
    'youtube.com': `<svg viewBox="0 0 24 24" width="32" height="32"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/><path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/></svg>`,
    'mail.google.com': `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.5l8.073-6.007C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/><path d="M0 5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.5V16.64L0 7.636V5.457z" fill="#C5221F"/><path d="M24 5.457c0-2.023-2.309-3.178-3.927-1.964L12 9.5V16.64l12-9.004V5.457z" fill="#4285F4"/><path d="M0 7.636v11.73c0 .904.732 1.636 1.636 1.636h3.819V11.73L0 7.636z" fill="#FBBC04"/><path d="M24 7.636v11.73c0 .904-.732 1.636-1.636 1.636h-3.819V11.73l5.455-4.094z" fill="#34A853"/></svg>`,
    'google.com': `<svg viewBox="0 0 24 24" width="28" height="28"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>`,
    'github.com': `<svg viewBox="0 0 24 24" width="30" height="30" fill="#FFFFFF"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    'x.com': `<svg viewBox="0 0 24 24" width="26" height="26" fill="#FFFFFF"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    'twitter.com': `<svg viewBox="0 0 24 24" width="26" height="26" fill="#FFFFFF"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    'reddit.com': `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="11" fill="#FF4500"/><path fill="#FFF" d="M16.67 13.138c.1.258.156.536.156.828 0 1.91-2.16 3.46-4.826 3.46s-4.826-1.55-4.826-3.46c0-.292.056-.57.156-.828-.484-.28-.806-.806-.806-1.408 0-.9.73-1.63 1.63-1.63.46 0 .874.192 1.17.5 1.002-.698 2.37-1.144 3.896-1.196l.82-3.864 2.684.57c.05.6.55 1.07 1.16 1.07.65 0 1.17-.52 1.17-1.17s-.52-1.17-1.17-1.17c-.45 0-.84.25-1.04.62l-2.98-.63-.98 4.6c1.55.05 2.94.5 3.96 1.21.3-.31.71-.5 1.17-.5.9 0 1.63.73 1.63 1.63 0 .6-.32 1.13-.8 1.41zM10.15 13.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3.7 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3.6 3.1c.42.42 1.08.63 1.75.63s1.33-.21 1.75-.63.26-.52-.05-.63c-.31-.1-.63.15-.9.36-.23.18-.5.27-.8.27s-.57-.09-.8-.27c-.27-.21-.59-.46-.9-.36-.31.11-.47.21-.05.63z"/></svg>`,
    'linkedin.com': `<svg viewBox="0 0 24 24" width="28" height="28" fill="#0A66C2"><rect width="24" height="24" rx="5" fill="#0A66C2"/><path fill="#FFF" d="M19 19h-2.8v-4.4c0-1.05-.02-2.4-1.46-2.4-1.46 0-1.69 1.14-1.69 2.32V19H10.2v-9h2.7v1.23h.04c.38-.71 1.3-1.46 2.66-1.46 2.84 0 3.4 1.87 3.4 4.3V19zM7.12 8.76a1.57 1.57 0 1 1 0-3.14 1.57 1.57 0 0 1 0 3.14zM5.72 19h2.8v-9h-2.8v9z"/></svg>`,
    'chatgpt.com': `<svg viewBox="0 0 24 24" width="28" height="28" fill="#10A37F"><path d="M22.28 9.37a5.98 5.98 0 0 0-.52-4.95 6.07 6.07 0 0 0-6.52-2.87 6.05 6.05 0 0 0-4.66-2.12c-3.07 0-5.63 2.3-5.96 5.33a6.05 6.05 0 0 0-3.9 2.83 6.06 6.06 0 0 0 .73 7.1 6.02 6.02 0 0 0 .52 4.95 6.07 6.07 0 0 0 6.52 2.87 6.03 6.03 0 0 0 4.66 2.12c3.07 0 5.63-2.3 5.96-5.33a6.05 6.05 0 0 0 3.9-2.83 6.06 6.06 0 0 0-.73-7.1zm-8.87 11.83a4.57 4.57 0 0 1-2.91-1.04l.15-.08 4.84-2.79a.77.77 0 0 0 .39-.67v-6.84l2.06 1.19c.03.02.04.05.04.08v5.57a4.58 4.58 0 0 1-4.57 4.58zm-7.66-3.83a4.55 4.55 0 0 1-.58-3.04l.15.09 4.84 2.8a.77.77 0 0 0 .78 0l5.92-3.42v2.38c0 .03-.02.06-.05.08l-4.82 2.78a4.58 4.58 0 0 1-6.24-1.67zm-1.84-8.8a4.55 4.55 0 0 1 2.33-2.03v5.75c0 .28.15.54.39.67l5.92 3.42-2.06 1.19a.08.08 0 0 1-.08 0l-4.83-2.79a4.58 4.58 0 0 1-1.67-6.21zm14.18 2.45l-5.92-3.42 2.06-1.19a.08.08 0 0 1 .08 0l4.83 2.79a4.58 4.58 0 0 1 .59 8.24v-5.75a.77.77 0 0 0-.39-.67h-.01zm2.34-3.84a4.55 4.55 0 0 1 .58 3.04l-.15-.09-4.84-2.8a.77.77 0 0 0-.78 0l-5.92 3.42V7.15c0-.03.02-.06.05-.08l4.82-2.78a4.58 4.58 0 0 1 6.24 1.67zM8.03 13.06l2.4-1.39 2.4 1.39v2.77l-2.4 1.39-2.4-1.39v-2.77z"/></svg>`,
    'spotify.com': `<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="11" fill="#1ED760"/><path fill="#000" d="M16.5 15.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-1-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 4-.9 7.5-.5 10.4 1.2.3.2.4.6.2.9zm1.2-2.7c-.3.4-.8.5-1.2.3-2.9-1.8-7.3-2.3-10.7-1.3-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.9-1.2 8.8-.6 12.1 1.4.4.2.5.8.2 1.2zm.1-2.8c-3.4-2-9.1-2.2-12.4-1.2-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.8-1.2 10.1-.9 14.1 1.4.5.3.6.9.3 1.4-.3.5-.9.6-1.4.2z"/></svg>`,
    'netflix.com': `<svg viewBox="0 0 24 24" width="26" height="26" fill="#E50914"><path d="M5.398 0v24c1.196-.27 2.404-.508 3.633-.717V0H5.398zm9.57 0v16.147l3.634.618V0h-3.634zM5.398 0l9.57 20.898V24L5.398 3.102V0z"/></svg>`,
    'amazon.com': `<svg viewBox="0 0 24 24" width="28" height="28" fill="#FF9900"><path d="M13.9 14.4c-2.3 1.7-5.7 2.6-8.5 2.6-4 0-7.6-1.5-10.3-4-.2-.2-.2-.5 0-.7.3-.2.5-.2.7 0 2.5 2.3 5.8 3.7 9.6 3.7 2.5 0 5.6-.8 7.7-2.3.4-.3.9.1.5.7zm1.3-.8c-.3-.4-1.9-.2-2.6-.1-.2 0-.3-.2-.1-.3 1-.7 2.7-.5 3-.1.3.4.1 2.1-.9 3-.1.1-.3.1-.3 0 0-.2.5-1.8.9-2.5z"/><path fill="#FFF" d="M14.6 11.2c-.3 0-.6 0-.8.1-.3-.4-.5-1-.5-1.7 0-1.6.8-2.6 2.3-2.6.7 0 1.2.2 1.6.5v1.4c-.4-.4-.9-.6-1.5-.6-.9 0-1.3.6-1.3 1.5 0 .7.3 1.2.9 1.2.5 0 .9-.2 1.3-.5v1.2c-.4.3-1 .5-2 .5zm5.5 1.8v-7h-1.6v1.1c-.5-.8-1.4-1.3-2.5-1.3-2.2 0-3.6 1.7-3.6 3.8 0 2.3 1.5 3.9 3.7 3.9 1.1 0 1.9-.5 2.4-1.2v1.7h1.6zm-12.7 0v-4.4c0-1.1-.3-1.6-1.1-1.6-.7 0-1.2.4-1.5.9v5.1H3.2v-7h1.5v1.1c.5-.7 1.4-1.3 2.5-1.3 1.5 0 2.4.9 2.4 2.6v4.6H7.4z"/></svg>`,
    'discord.com': `<svg viewBox="0 0 24 24" width="28" height="28" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  };

  let shortcuts = [];
  let showMostVisited = false;
  let adaptiveIcons = false;
  let editingId = null;
  let dragSrcIndex = null;

  async function init() {
    const data = await Storage.getSync(['shortcuts', 'showMostVisited', 'adaptiveIcons']);
    const saved = data.shortcuts;
    const isOldDefaults = saved && saved.length === 6 &&
      saved[0]?.name === 'YouTube' && saved[1]?.name === 'Gmail' && saved[2]?.name === 'GitHub' &&
      saved[3]?.name === 'Twitter / X';

    if (!saved || isOldDefaults) {
      shortcuts = [...DEFAULT_SHORTCUTS];
      await Storage.setSync({ shortcuts });
    } else {
      shortcuts = saved;
    }
    showMostVisited = data.showMostVisited || false;
    adaptiveIcons = data.adaptiveIcons || false;

    render();
    _setupListeners();
  }

  function render() {
    const grid = document.getElementById('shortcuts-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.className = 'shortcuts-grid' + (adaptiveIcons ? ' adaptive-icons' : '');

    shortcuts.forEach((sc, index) => {
      const item = document.createElement('a');
      item.className = 'shortcut-item fade-in';
      item.href = _sanitizeUrl(sc.url);
      item.setAttribute('draggable', 'true');
      item.setAttribute('data-index', index);
      item.title = sc.name;

      // Squircle tile
      const tile = document.createElement('div');
      tile.className = 'shortcut-tile';

      const domain = _getDomain(sc.url);
      const brandSvg = BRAND_SVGS[domain] || BRAND_SVGS[domain.replace(/^m\./, '')];

      if (brandSvg) {
        tile.innerHTML = brandSvg;
      } else {
        // High-res Google favicon with fallback to elegant gradient letter
        const img = document.createElement('img');
        img.alt = sc.name;
        img.loading = 'lazy';
        img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
        
        let loaded = false;
        img.onload = () => {
          // If returned 16x16 default globe or valid favicon
          if (img.naturalWidth > 0) {
            loaded = true;
          }
        };
        img.onerror = () => {
          if (!loaded) {
            tile.innerHTML = '';
            const letterSpan = document.createElement('span');
            letterSpan.className = 'shortcut-fallback-letter';
            const initial = ((sc.name || domain || 'A').trim()[0] || 'A').toUpperCase();
            letterSpan.textContent = initial;
            tile.appendChild(letterSpan);
            tile.style.background = _getGradientForDomain(domain);
          }
        };

        tile.appendChild(img);
      }

      // Title label
      const label = document.createElement('span');
      label.className = 'shortcut-label';
      label.textContent = sc.name || domain;

      item.appendChild(tile);
      item.appendChild(label);

      // Drag handlers
      item.addEventListener('dragstart', (e) => _onDragStart(e, index));
      item.addEventListener('dragover', (e) => _onDragOver(e));
      item.addEventListener('dragenter', (e) => _onDragEnter(e));
      item.addEventListener('dragleave', (e) => _onDragLeave(e));
      item.addEventListener('drop', (e) => _onDrop(e, index));
      item.addEventListener('dragend', _onDragEnd);

      grid.appendChild(item);
    });

    // (Removed inline "+" add button per user request, moved to settings)

    // Show most visited if enabled
    if (showMostVisited) {
      _loadMostVisited(grid);
    }
  }

  async function _loadMostVisited(grid) {
    if (typeof chrome === 'undefined' || !chrome.topSites) return;
    try {
      chrome.topSites.get((sites) => {
        if (chrome.runtime.lastError || !sites) return;
        const existing = new Set(shortcuts.map(s => _getDomain(s.url)));
        sites.slice(0, 6).forEach(site => {
          const domain = _getDomain(site.url);
          if (existing.has(domain)) return;

          const item = document.createElement('a');
          item.className = 'shortcut-item fade-in';
          item.href = _sanitizeUrl(site.url);
          item.title = site.title || domain;
          item.style.opacity = '0.85';

          const tile = document.createElement('div');
          tile.className = 'shortcut-tile';

          const brandSvg = BRAND_SVGS[domain];
          if (brandSvg) {
            tile.innerHTML = brandSvg;
          } else {
            const img = document.createElement('img');
            img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
            img.onerror = () => {
              tile.innerHTML = '';
              const letterSpan = document.createElement('span');
              letterSpan.className = 'shortcut-fallback-letter';
              const initial = ((site.title || domain || 'A').trim()[0] || 'A').toUpperCase();
              letterSpan.textContent = initial;
              tile.appendChild(letterSpan);
              tile.style.background = _getGradientForDomain(domain);
            };
            tile.appendChild(img);
          }

          const label = document.createElement('span');
          label.className = 'shortcut-label';
          label.textContent = site.title || domain;

          item.appendChild(tile);
          item.appendChild(label);
          grid.appendChild(item);
        });
      });
    } catch (e) {
      console.warn('topSites error:', e);
    }
  }

  function _setupListeners() {
    const addBtn = document.getElementById('btn-add-shortcut');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        _openEditModal(null);
      });
    }

    const closeBtn = document.querySelector('[data-close="shortcut-modal"]');
    if (closeBtn) closeBtn.addEventListener('click', _closeModal);

    const saveBtn = document.getElementById('shortcut-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', _saveModal);

    const deleteBtn = document.getElementById('shortcut-delete-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', _deleteFromModal);

    const modal = document.getElementById('shortcut-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) _closeModal();
      });
    }

    const urlInput = document.getElementById('shortcut-url-input');
    if (urlInput) {
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') _saveModal();
      });
    }
  }

  function _openEditModal(id) {
    editingId = id;
    const modal = document.getElementById('shortcut-modal');
    const title = document.getElementById('shortcut-modal-title');
    const nameInput = document.getElementById('shortcut-name-input');
    const urlInput = document.getElementById('shortcut-url-input');
    const deleteBtn = document.getElementById('shortcut-delete-btn');
    if (!modal) return;

    if (id) {
      const sc = shortcuts.find(s => s.id === id);
      if (!sc) return;
      title.textContent = I18n.t('editShortcut', 'Edit Shortcut');
      nameInput.value = sc.name;
      urlInput.value = sc.url;
      deleteBtn.style.display = '';
    } else {
      title.textContent = I18n.t('addShortcut', 'Add Shortcut');
      nameInput.value = '';
      urlInput.value = '';
      deleteBtn.style.display = 'none';
    }

    modal.style.display = '';
    nameInput.focus();
  }

  function _closeModal() {
    const modal = document.getElementById('shortcut-modal');
    if (modal) modal.style.display = 'none';
    editingId = null;
  }

  function _saveModal() {
    const nameInput = document.getElementById('shortcut-name-input');
    const urlInput = document.getElementById('shortcut-url-input');
    let url = urlInput.value.trim();
    const name = nameInput.value.trim();

    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    if (!_isValidUrl(url)) return;

    if (editingId) {
      const sc = shortcuts.find(s => s.id === editingId);
      if (sc) {
        sc.name = name || _getDomain(url);
        sc.url = url;
      }
    } else {
      shortcuts.push({
        id: Date.now().toString(),
        name: name || _getDomain(url),
        url: url,
      });
    }

    _closeModal();
    render();
    _save();
  }

  function _deleteFromModal() {
    if (!editingId) return;
    shortcuts = shortcuts.filter(s => s.id !== editingId);
    _closeModal();
    render();
    _save();
  }

  // Drag and drop handlers
  function _onDragStart(e, index) {
    dragSrcIndex = index;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }

  function _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function _onDragEnter(e) {
    e.preventDefault();
    const item = e.target.closest('.shortcut-item');
    if (item) item.classList.add('drag-over');
  }

  function _onDragLeave(e) {
    const item = e.target.closest('.shortcut-item');
    if (item) item.classList.remove('drag-over');
  }

  function _onDrop(e, index) {
    e.preventDefault();
    const item = e.target.closest('.shortcut-item');
    if (item) item.classList.remove('drag-over');

    if (dragSrcIndex === null || dragSrcIndex === index) return;

    const moved = shortcuts.splice(dragSrcIndex, 1)[0];
    shortcuts.splice(index, 0, moved);

    render();
    _save();
  }

  function _onDragEnd() {
    document.querySelectorAll('.shortcut-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
    dragSrcIndex = null;
  }

  // Helpers
  function _getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  function _getGradientForDomain(domain) {
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 45) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 80%, 40%))`;
  }

  function _sanitizeUrl(url) {
    try {
      const u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') return url;
    } catch { /* invalid */ }
    return '#';
  }

  function _isValidUrl(str) {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function _save() {
    await Storage.setSync({ shortcuts, showMostVisited });
  }

  function setShowMostVisited(val) {
    showMostVisited = val;
    render();
    _save();
  }

  function setAdaptiveIcons(val) {
    adaptiveIcons = !!val;
    const grid = document.getElementById('shortcuts-grid');
    if (grid) {
      grid.classList.toggle('adaptive-icons', adaptiveIcons);
    }
    Storage.setSync({ adaptiveIcons });
  }

  function addShortcut(name, url) {
    if (!url) return null;
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const cleanName = name ? name.trim() : _getDomain(cleanUrl);
    const newSc = {
      id: Date.now().toString(),
      name: cleanName || _getDomain(cleanUrl),
      url: cleanUrl
    };
    shortcuts.push(newSc);
    render();
    _save();
    return newSc;
  }

  function deleteShortcut(id) {
    const idx = shortcuts.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const removed = shortcuts.splice(idx, 1)[0];
    render();
    _save();
    return { item: removed, index: idx };
  }

  function insertShortcut(item, index) {
    if (!item) return;
    const insertIdx = (typeof index === 'number' && index >= 0 && index <= shortcuts.length) ? index : shortcuts.length;
    shortcuts.splice(insertIdx, 0, item);
    render();
    _save();
  }

  function updateShortcut(id, name, url) {
    const sc = shortcuts.find(s => s.id === id);
    if (!sc) return;
    if (name !== undefined && name !== null) {
      sc.name = name.trim() || _getDomain(sc.url);
    }
    if (url !== undefined && url !== null) {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      sc.url = cleanUrl;
    }
    render();
    _save();
  }

  function reorderShortcuts(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= shortcuts.length || toIndex < 0 || toIndex >= shortcuts.length) return;
    if (fromIndex === toIndex) return;
    const [moved] = shortcuts.splice(fromIndex, 1);
    shortcuts.splice(toIndex, 0, moved);
    render();
    _save();
  }

  function resetDefaults() {
    shortcuts = [...DEFAULT_SHORTCUTS];
    render();
    _save();
  }

  return {
    init, render, setShowMostVisited, setAdaptiveIcons,
    openEditModal: _openEditModal,
    addShortcut, deleteShortcut, insertShortcut, updateShortcut, reorderShortcuts, resetDefaults,
    get shortcuts() { return [...shortcuts]; },
    get showMostVisited() { return showMostVisited; },
    get adaptiveIcons() { return adaptiveIcons; },
  };
})();
