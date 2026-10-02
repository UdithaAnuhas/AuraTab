/**
 * Search module
 * Multi-engine search with live Google suggestions, AI Mode, and history dropdown
 */
'use strict';

const Search = (() => {
  const ENGINES = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={q}', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>' },
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={q}', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="#DE5833"/><path d="M8 8a2 2 0 1 1 4 0v2a2 2 0 1 1-4 0V8zm5 6c0 2-1.5 4-3 4s-3-2-3-4h6z" fill="white"/></svg>' },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={q}', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l3.5 1.25v12.5L14 13.5l4.5 2.25-5 3.5L5 21V3z" fill="#008373"/></svg>' },
    { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q={q}', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.5L18.5 8 12 11.5 5.5 8 12 4.5z" fill="#FB542B"/></svg>' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query={q}', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.3-1.9.5-3.9.5-5.8a31.4 31.4 0 0 0-.5-5.8z" fill="#FF0000"/><polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="white"/></svg>' },
  ];

  const DEFAULT_HISTORY = [
    { query: 'tiktok', sub: 'Google Search', isAi: false },
    { query: 'usdt to lkr', sub: '', isAi: false },
    { query: 'muditha methsara', sub: '', isAi: true },
    { query: 'mynt extension', sub: '', isAi: false },
    { query: 'custom home tab reddit', sub: '', isAi: false },
    { query: 'translate', sub: '', isAi: false },
    { query: 'home tab glass look design', sub: '', isAi: false },
    { query: 'anime wallpapers 4k', sub: '', isAi: false },
  ];

  const ICON_HISTORY = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`;
  const ICON_SEARCH = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  const ICON_AI_SPARKLE = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;

  let currentEngine = 'google';
  let customUrl = '';
  let engineDropdownOpen = false;
  let menuOpen = false;
  let isAiMode = false;
  let searchHistory = [];
  let currentSuggestions = [];
  let selectedIndex = -1;
  let debounceTimeout = null;
  let originalUserTyped = '';

  async function init() {
    const data = await Storage.getSync(['searchEngine', 'customSearchUrl']);
    currentEngine = data.searchEngine || 'google';
    customUrl = data.customSearchUrl || '';

    // Always start in normal mode on new tabs until user turns on AI mode
    isAiMode = false;
    try {
      localStorage.removeItem('hometab_search_ai_mode');
    } catch (_) {}

    // Load search history
    _loadHistory();

    _updateIcon();
    _updateAiModeUI();
    _buildEngineDropdown();
    _setupListeners();
  }

  function _loadHistory() {
    try {
      const saved = localStorage.getItem('hometab_search_history');
      if (saved) {
        searchHistory = JSON.parse(saved);
      } else {
        searchHistory = [...DEFAULT_HISTORY];
        _saveHistory();
      }
    } catch (_) {
      searchHistory = [...DEFAULT_HISTORY];
    }
  }

  function _saveHistory() {
    try {
      localStorage.setItem('hometab_search_history', JSON.stringify(searchHistory.slice(0, 30)));
    } catch (_) {}
  }

  function _addHistory(query, isAi) {
    if (!query) return;
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    // Remove existing
    searchHistory = searchHistory.filter(h => h.query.toLowerCase() !== cleanQuery.toLowerCase());
    // Prepend new
    searchHistory.unshift({
      query: cleanQuery,
      sub: isAi ? '' : (currentEngine === 'google' ? 'Google Search' : ''),
      isAi: !!isAi,
      timestamp: Date.now()
    });
    _saveHistory();
  }

  function _removeHistory(query) {
    searchHistory = searchHistory.filter(h => h.query.toLowerCase() !== query.toLowerCase());
    _saveHistory();
    const input = document.getElementById('search-input');
    _renderSuggestions(input ? input.value : '');
  }

  function _clearHistory() {
    searchHistory = [];
    _saveHistory();
    const input = document.getElementById('search-input');
    _renderSuggestions(input ? input.value : '');
  }

  function _updateIcon() {
    const iconEl = document.getElementById('search-engine-icon');
    if (!iconEl) return;
    const engine = ENGINES.find(e => e.id === currentEngine);
    if (engine) {
      iconEl.innerHTML = engine.icon;
    } else {
      iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    }
  }

  function _updateAiModeUI() {
    const btn = document.getElementById('btn-ai-mode');
    const closeBtn = document.getElementById('btn-ai-mode-close');
    const wrap = document.getElementById('search-box-wrap');
    const input = document.getElementById('search-input');
    const stdFooter = document.getElementById('search-dropdown-footer-standard');
    const aiFooter = document.getElementById('search-dropdown-footer-ai');

    // 1. Soft glowing accent-color running line indicator around search box
    if (wrap) {
      wrap.classList.toggle('is-ai-mode', isAiMode);
    }

    // 2. Instead of AI mode button, close button appears in AI mode
    if (btn) {
      btn.style.display = isAiMode ? 'none' : 'inline-flex';
    }
    if (closeBtn) {
      closeBtn.style.display = isAiMode ? 'inline-flex' : 'none';
    }

    // 3. Dropdown footer toggle
    if (stdFooter && aiFooter) {
      stdFooter.style.display = isAiMode ? 'none' : '';
      aiFooter.style.display = isAiMode ? '' : 'none';
    }

    // 4. Input placeholder
    if (input) {
      input.placeholder = isAiMode ? 'Ask AI Mode anything or type a prompt...' : 'Search Google or type a URL';
    }

    // 5. Always ensure dropdown is closed on mode change so it never automatically pops up
    _closeMenu();
  }

  function _toggleAiMode() {
    isAiMode = !isAiMode;
    _updateAiModeUI();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(isAiMode ? 'AI Search Mode enabled' : 'Standard Search Mode');
    }
  }

  function _buildEngineDropdown() {
    const dd = document.getElementById('search-engine-dropdown');
    if (!dd) return;
    dd.innerHTML = '';

    ENGINES.forEach(engine => {
      const btn = document.createElement('button');
      btn.className = 'search-engine-option';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', engine.id === currentEngine ? 'true' : 'false');
      btn.innerHTML = `<span class="engine-icon">${engine.icon}</span><span>${engine.name}</span>`;
      btn.addEventListener('click', () => _selectEngine(engine.id));
      dd.appendChild(btn);
    });

    const customBtn = document.createElement('button');
    customBtn.className = 'search-engine-option';
    customBtn.setAttribute('role', 'option');
    customBtn.setAttribute('aria-selected', currentEngine === 'custom' ? 'true' : 'false');
    customBtn.innerHTML = `<span class="engine-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><span>${I18n.t('custom', 'Custom')}</span>`;
    customBtn.addEventListener('click', () => _selectEngine('custom'));
    dd.appendChild(customBtn);
  }

  function _selectEngine(id) {
    currentEngine = id;
    _updateIcon();
    _closeEngineDropdown();
    _save();

    document.querySelectorAll('.search-engine-option').forEach(opt => {
      opt.setAttribute('aria-selected', 'false');
    });
  }

  function _openEngineDropdown() {
    const dd = document.getElementById('search-engine-dropdown');
    if (!dd) return;
    _closeMenu();
    dd.style.display = '';
    engineDropdownOpen = true;
  }

  function _closeEngineDropdown() {
    const dd = document.getElementById('search-engine-dropdown');
    if (!dd) return;
    dd.style.display = 'none';
    engineDropdownOpen = false;
  }

  function _openMenu() {
    const input = document.getElementById('search-input');
    const query = (input ? input.value : '').trim();

    // When in AI mode and search box is empty, never open history menu
    if (isAiMode && !query) {
      _closeMenu();
      return;
    }

    _closeEngineDropdown();
    const menu = document.getElementById('search-dropdown-menu');
    const box = document.getElementById('search-box');
    const wrap = document.getElementById('search-box-wrap');
    if (menu) menu.style.display = 'block';
    if (box) box.classList.add('has-dropdown-open');
    if (wrap) wrap.classList.add('has-dropdown-open');
    document.body.classList.add('search-dropdown-active');
    menuOpen = true;
    _adjustDropdownMaxHeight();
    _renderSuggestions(input ? input.value : '');
  }

  function _closeMenu() {
    const menu = document.getElementById('search-dropdown-menu');
    const box = document.getElementById('search-box');
    const wrap = document.getElementById('search-box-wrap');
    if (menu) {
      menu.style.display = 'none';
      menu.style.maxHeight = '';
    }
    const listEl = document.getElementById('search-suggestions-list');
    if (listEl) {
      listEl.style.maxHeight = '';
    }
    if (box) box.classList.remove('has-dropdown-open');
    if (wrap) wrap.classList.remove('has-dropdown-open');
    document.body.classList.remove('search-dropdown-active');
    menuOpen = false;
    selectedIndex = -1;
  }

  function _adjustDropdownMaxHeight() {
    const wrap = document.getElementById('search-box-wrap');
    const menu = document.getElementById('search-dropdown-menu');
    const listEl = document.getElementById('search-suggestions-list');
    if (!wrap || !menu || !listEl) return;

    const rect = wrap.getBoundingClientRect();
    // Keep at least 36px breathing space so suggestions box never touches the bottom of the screen
    const bottomGap = 36;
    const availableHeight = Math.max(160, Math.floor(window.innerHeight - rect.bottom - bottomGap));

    // Footer height (Clear history or AI view history)
    const footer = menu.querySelector('.search-dropdown-footer:not([style*="display: none"]):not([style*="display:none"])');
    const footerHeight = footer ? (footer.offsetHeight || 42) : 42;
    const maxListHeight = Math.max(100, availableHeight - footerHeight);

    menu.style.maxHeight = `${availableHeight}px`;
    listEl.style.maxHeight = `${maxListHeight}px`;
  }

  async function _fetchGoogleSuggestions(query) {
    if (!query || !query.trim()) return [];
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query.trim())}`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 10);
      }
    } catch (_) {
      // Fallback
    }
    return [];
  }

  async function _renderSuggestions(rawQuery) {
    const listEl = document.getElementById('search-suggestions-list');
    if (!listEl) return;

    const query = (rawQuery || '').trim().toLowerCase();
    let items = [];

    if (isAiMode) {
      // In AI Mode: absolutely NO normal browsing history!
      if (!query) {
        _closeMenu();
        return;
      }

      // Fetch live completions for the AI prompt
      let googleSuggestions = [];
      try {
        googleSuggestions = await _fetchGoogleSuggestions(query);
      } catch (_) {}

      const topCompletion = googleSuggestions.find(s => s.toLowerCase().startsWith(query)) || rawQuery.trim();

      const topItem = {
        query: topCompletion,
        sub: 'Search with AI Mode',
        isAi: true,
        type: 'ai-prompt',
        isTopQuery: true
      };

      const otherItems = googleSuggestions
        .filter(s => s.toLowerCase() !== topCompletion.toLowerCase())
        .map(s => ({
          query: s,
          sub: 'AI Mode',
          isAi: true,
          type: 'ai-prompt'
        }));

      items = [topItem, ...otherItems].slice(0, 8);
      selectedIndex = -1;
    } else {
      // Standard search mode: Show history and Google suggestions
      if (!query) {
        items = searchHistory.slice(0, 8).map(h => ({
          query: h.query,
          sub: h.isAi ? 'AI Mode' : (h.sub || (currentEngine === 'google' ? 'Google Search' : '')),
          isAi: h.isAi,
          type: 'history'
        }));
        selectedIndex = -1;
      } else {
        let googleSuggestions = [];
        try {
          googleSuggestions = await _fetchGoogleSuggestions(query);
        } catch (_) {}

        const historyMatches = searchHistory
          .filter(h => h.query.toLowerCase().includes(query) && h.query.toLowerCase() !== query)
          .slice(0, 2)
          .map(h => ({
            query: h.query,
            sub: h.isAi ? 'AI Mode' : (h.sub || (currentEngine === 'google' ? 'Google Search' : '')),
            isAi: h.isAi,
            type: 'history'
          }));

        const topCompletion = googleSuggestions.find(s => s.toLowerCase().startsWith(query)) ||
                              historyMatches.find(h => h.query.toLowerCase().startsWith(query))?.query ||
                              rawQuery.trim();

        const topItem = {
          query: topCompletion,
          sub: currentEngine === 'google' ? 'Google Search' : currentEngine.toUpperCase() + ' Search',
          isAi: false,
          type: 'search',
          isTopQuery: true
        };

        const otherGoogleItems = googleSuggestions
          .filter(s => s.toLowerCase() !== topCompletion.toLowerCase() && !historyMatches.some(h => h.query.toLowerCase() === s.toLowerCase()))
          .map(s => ({
            query: s,
            sub: '',
            isAi: false,
            type: 'suggest'
          }));

        items = [topItem, ...historyMatches, ...otherGoogleItems].slice(0, 10);
        selectedIndex = -1;
      }
    }

    currentSuggestions = items;

    listEl.innerHTML = '';

    if (items.length === 0) {
      _closeMenu();
      return;
    }

    items.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-suggestion-item';
      if (item.isTopQuery) {
        btn.classList.add('is-top-query');
      }
      if (index === selectedIndex) {
        btn.classList.add('selected');
      }
      btn.setAttribute('role', 'option');
      btn.dataset.index = index;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'suggestion-icon';
      if (item.type === 'ai-prompt' || (isAiMode && item.isAi)) {
        iconSpan.innerHTML = ICON_AI_SPARKLE;
        iconSpan.classList.add('is-ai-icon');
      } else if (item.type === 'history') {
        iconSpan.innerHTML = ICON_HISTORY;
      } else {
        iconSpan.innerHTML = ICON_SEARCH;
      }

      const contentSpan = document.createElement('span');
      contentSpan.className = 'suggestion-content';

      const mainText = document.createElement('span');
      mainText.className = 'suggestion-main';

      // Bold the completion part (non-matching rest) like Chrome omnibox
      const typedQuery = query; // lowercase version of what user typed
      const suggestionLower = item.query.toLowerCase();
      if (typedQuery && suggestionLower.startsWith(typedQuery)) {
        // Typed prefix = normal weight, rest = bold
        const matchedPart = item.query.substring(0, typedQuery.length);
        const restPart = item.query.substring(typedQuery.length);
        const matchSpan = document.createElement('span');
        matchSpan.className = 'suggestion-match';
        matchSpan.textContent = matchedPart;
        mainText.appendChild(matchSpan);
        if (restPart) {
          const boldSpan = document.createElement('span');
          boldSpan.className = 'suggestion-bold';
          boldSpan.textContent = restPart;
          mainText.appendChild(boldSpan);
        }
      } else {
        mainText.textContent = item.query;
      }
      contentSpan.appendChild(mainText);

      if (item.sub) {
        const subText = document.createElement('span');
        subText.className = 'suggestion-sub';
        subText.textContent = ' - ' + item.sub;
        contentSpan.appendChild(subText);
      } else if (item.isAi) {
        const aiSub = document.createElement('span');
        aiSub.className = 'suggestion-sub';
        aiSub.textContent = ' - AI Mode';
        contentSpan.appendChild(aiSub);
      }

      btn.appendChild(iconSpan);
      btn.appendChild(contentSpan);

      // Arrow button to move query to search box (Chrome Omnibox style: ↖)
      const arrowBtn = document.createElement('button');
      arrowBtn.type = 'button';
      arrowBtn.className = 'suggestion-arrow-btn';
      arrowBtn.title = 'Insert into search box';
      arrowBtn.setAttribute('aria-label', `Insert ${item.query} into search box`);
      arrowBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>`;
      arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const inputEl = document.getElementById('search-input');
        if (inputEl) {
          inputEl.value = item.query;
          originalUserTyped = item.query;
          inputEl.focus();
          inputEl.setSelectionRange(item.query.length, item.query.length);
          _renderSuggestions(item.query);
        }
      });
      btn.appendChild(arrowBtn);

      // Delete button for history items
      if (item.type === 'history') {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'suggestion-delete-btn';
        delBtn.innerHTML = '×';
        delBtn.title = 'Remove from history';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          _removeHistory(item.query);
        });
        btn.appendChild(delBtn);
      }

      btn.addEventListener('click', (e) => {
        if (e.target.closest('.suggestion-delete-btn') || e.target.closest('.suggestion-arrow-btn')) return;
        const inputEl = document.getElementById('search-input');
        if (inputEl) inputEl.value = item.query;
        _executeSearch(item.query, item.isAi);
      });

      listEl.appendChild(btn);
    });

    _adjustDropdownMaxHeight();
  }

  function _executeSearch(query, itemIsAi) {
    if (!query) return;
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    // Direct URL navigation if typed a valid URL or web domain
    if (!cleanQuery.includes(' ') && /^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,}(\/.*)?$)/i.test(cleanQuery)) {
      const destUrl = /^https?:\/\//i.test(cleanQuery) ? cleanQuery : 'https://' + cleanQuery;
      window.location.href = destUrl;
      return;
    }

    const useAi = typeof itemIsAi === 'boolean' ? itemIsAi : isAiMode;
    _addHistory(cleanQuery, useAi);

    const url = _buildSearchUrl(cleanQuery, useAi);
    window.location.href = url;
  }

  function _buildSearchUrl(query, aiActive) {
    const encoded = encodeURIComponent(query);

    // AI Mode search
    if (aiActive) {
      const aiProvider = localStorage.getItem('hometab_ai_provider') || 'google_ai';
      switch (aiProvider) {
        case 'gemini':
          return `https://gemini.google.com/app?q=${encoded}`;
        case 'chatgpt':
          return `https://chatgpt.com/?q=${encoded}`;
        case 'perplexity':
          return `https://www.perplexity.ai/search?q=${encoded}`;
        case 'google_ai':
        default:
          return `https://www.google.com/search?q=${encoded}&udm=50`;
      }
    }

    // Custom engine
    if (currentEngine === 'custom' && customUrl) {
      let finalUrl = customUrl.replace('{q}', encoded);
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      return finalUrl;
    }

    const engine = ENGINES.find(e => e.id === currentEngine);
    if (engine) {
      return engine.url.replace('{q}', encoded);
    }
    return `https://www.google.com/search?q=${encoded}`;
  }

  // Voice Search setup
  let recognition = null;
  let isListening = false;

  function _setupVoiceSearch() {
    const voiceBtn = document.getElementById('btn-voice-search');
    const input = document.getElementById('search-input');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.title = 'Voice search is not supported in this browser';
      voiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Voice search requires Google Chrome or Chromium');
        }
      });
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        if (input) input.placeholder = 'Listening...';
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (input && transcript) {
          input.value = transcript;
          _renderSuggestions(transcript);
        }
      };

      recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        _updateAiModeUI();
        if (input && input.value.trim()) {
          _executeSearch(input.value.trim(), isAiMode);
        }
      };

      recognition.onerror = (event) => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        _updateAiModeUI();
        if (event.error !== 'no-speech' && typeof App !== 'undefined' && App.showToast) {
          App.showToast('Voice search: ' + event.error);
        }
      };

      voiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isListening) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (_) {
            recognition.stop();
          }
        }
      });
    } catch (_) {}
  }

  // Google Lens modal and Image Search setup
  function _setupImageSearch() {
    const lensBtn = document.getElementById('btn-image-search');
    const lensModal = document.getElementById('search-lens-modal');
    const lensCloseBtn = document.getElementById('btn-lens-close');
    const lensBrowseBtn = document.getElementById('btn-lens-browse');
    const lensFileInput = document.getElementById('lens-file-input');
    const lensDropzone = document.getElementById('lens-dropzone');
    const lensUrlInput = document.getElementById('lens-url-input');
    const lensUrlBtn = document.getElementById('btn-lens-search-url');

    function openLens() {
      _closeMenu();
      _closeEngineDropdown();
      if (lensModal) {
        lensModal.style.display = 'block';
        const searchInput = document.getElementById('search-input');
        if (searchInput && lensUrlInput) {
          const val = (searchInput.value || '').trim();
          if (/^https?:\/\//i.test(val)) {
            lensUrlInput.value = val;
          }
        }
        if (lensUrlInput) setTimeout(() => lensUrlInput.focus(), 60);
      }
    }

    function closeLens() {
      if (lensModal) lensModal.style.display = 'none';
    }

    function triggerLensWithUrl(rawUrl) {
      const url = (rawUrl || '').trim();
      if (!url) return;
      closeLens();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Searching with Google Lens...');
      }
      window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(url)}`, '_blank');
    }

    function triggerLensUpload(fileName) {
      closeLens();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(fileName ? `Opening Google Lens for ${fileName}...` : 'Opening Google Lens...');
      }
      window.open('https://images.google.com/', '_blank');
    }

    if (lensBtn) {
      lensBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (lensModal && lensModal.style.display !== 'none') {
          closeLens();
        } else {
          openLens();
        }
      });
    }

    if (lensCloseBtn) {
      lensCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLens();
      });
    }

    if (lensBrowseBtn && lensFileInput) {
      lensBrowseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        lensFileInput.click();
      });
    }

    if (lensFileInput) {
      lensFileInput.addEventListener('change', () => {
        if (lensFileInput.files && lensFileInput.files[0]) {
          triggerLensUpload(lensFileInput.files[0].name);
        }
      });
    }

    if (lensDropzone) {
      lensDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        lensDropzone.classList.add('drag-over');
      });
      lensDropzone.addEventListener('dragleave', () => {
        lensDropzone.classList.remove('drag-over');
      });
      lensDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        lensDropzone.classList.remove('drag-over');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        triggerLensUpload(file ? file.name : '');
      });
      lensDropzone.addEventListener('click', (e) => {
        if (e.target !== lensBrowseBtn && lensFileInput) {
          lensFileInput.click();
        }
      });
    }

    if (lensUrlBtn && lensUrlInput) {
      const handleUrlSearch = () => {
        triggerLensWithUrl(lensUrlInput.value);
      };
      lensUrlBtn.addEventListener('click', handleUrlSearch);
      lensUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleUrlSearch();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (lensModal && lensModal.style.display !== 'none') {
        const wrap = document.getElementById('search-box-wrap');
        if (wrap && !wrap.contains(e.target)) {
          closeLens();
        }
      }
    });
  }

  // Left Plus (+) Tools menu setup
  function _setupAddMenu() {
    const addBtn = document.getElementById('btn-search-add');
    const addMenu = document.getElementById('search-add-menu');
    const optAddImages = document.getElementById('menu-opt-add-images');
    const optAddFiles = document.getElementById('menu-opt-add-files');
    const optCreateImages = document.getElementById('menu-opt-create-images');
    const imageInput = document.getElementById('search-image-input');
    const fileInput = document.getElementById('search-file-input');
    const searchInput = document.getElementById('search-input');

    function toggleAddMenu() {
      if (!addMenu) return;
      const isOpen = addMenu.style.display !== 'none';
      addMenu.style.display = isOpen ? 'none' : 'block';
    }

    function closeAddMenu() {
      if (addMenu) addMenu.style.display = 'none';
    }

    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAddMenu();
      });
    }

    if (optAddImages && imageInput) {
      optAddImages.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAddMenu();
        imageInput.click();
      });
    }

    if (imageInput) {
      imageInput.addEventListener('change', () => {
        if (imageInput.files && imageInput.files[0]) {
          const fileName = imageInput.files[0].name;
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`Opening Google Lens for ${fileName}...`);
          }
          window.open('https://images.google.com/', '_blank');
        }
      });
    }

    if (optAddFiles && fileInput) {
      optAddFiles.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAddMenu();
        fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`File attached: ${fileInput.files[0].name}`);
          }
        }
      });
    }

    if (optCreateImages) {
      optCreateImages.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAddMenu();
        const prompt = searchInput ? searchInput.value.trim() : '';
        const createUrl = prompt
          ? `https://www.bing.com/images/create?q=${encodeURIComponent(prompt)}`
          : `https://www.bing.com/images/create`;
        window.open(createUrl, '_blank');
      });
    }

    // Voice search from menu
    const optVoiceSearch = document.getElementById('menu-opt-voice-search');
    if (optVoiceSearch) {
      optVoiceSearch.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAddMenu();
        // Trigger voice search button
        const voiceBtn = document.getElementById('btn-voice-search');
        if (voiceBtn) voiceBtn.click();
      });
    }

    // Lens search from menu
    const optLensSearch = document.getElementById('menu-opt-lens-search');
    if (optLensSearch) {
      optLensSearch.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAddMenu();
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        if (query && /^https?:\/\//i.test(query)) {
          window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(query)}`, '_blank');
        } else {
          window.open('https://images.google.com/', '_blank');
        }
      });
    }

    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('search-add-wrap');
      if (wrap && !wrap.contains(e.target)) {
        closeAddMenu();
      }
    });
  }

  function _setupListeners() {
    const input = document.getElementById('search-input');
    const engineBtn = document.getElementById('search-engine-btn');
    const aiBtn = document.getElementById('btn-ai-mode');
    const addBtn = document.getElementById('btn-dropdown-add');
    const clearHistoryBtn = document.getElementById('btn-clear-history');
    const searchWrap = document.getElementById('search-box-wrap');

    if (!input) return;

    // Search submit arrow button
    const submitBtn = document.getElementById('search-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _executeSearch(input.value, isAiMode);
      });
    }

    // Container click delegation for smooth click anywhere on the bar
    const searchBoxEl = document.getElementById('search-box');
    if (searchBoxEl) {
      searchBoxEl.addEventListener('mousedown', (e) => {
        if (!e.target.closest('button') && !e.target.closest('.search-add-menu')) {
          if (input && document.activeElement !== input) {
            // Prevent default to avoid stealing focus if we just want to focus it manually
            // Wait, if we prevent default, the input won't get focused natively. Let's just focus it.
            // Actually, we don't need prevent default.
            input.focus();
          }
          if (!menuOpen) _openMenu();
        }
      });
    }

    // Focus / Click on input opens Google dropdown
    input.addEventListener('focus', () => {
      _openMenu();
    });

    input.addEventListener('mousedown', () => {
      if (!menuOpen) _openMenu();
    });

    // Input debounce for Google autocomplete (does NOT modify input.value while typing)
    input.addEventListener('input', () => {
      originalUserTyped = input.value;

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        _renderSuggestions(originalUserTyped);
        if (!menuOpen) _openMenu();
      }, 100);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      // Tab accepts top suggestion (or currently arrowed suggestion) into the search box
      if (e.key === 'Tab') {
        if (currentSuggestions.length > 0) {
          e.preventDefault();
          const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
          const targetQuery = currentSuggestions[targetIndex].query;
          input.value = targetQuery;
          originalUserTyped = targetQuery;
          input.setSelectionRange(targetQuery.length, targetQuery.length);
          _renderSuggestions(targetQuery);
          return;
        }
      }

      // ArrowRight or End at the end of input also accepts top suggestion
      if ((e.key === 'ArrowRight' || e.key === 'End') && 
          input.selectionStart === input.value.length && 
          currentSuggestions.length > 0 &&
          currentSuggestions[0].query.toLowerCase().startsWith(input.value.toLowerCase().trim())) {
        e.preventDefault();
        const targetQuery = currentSuggestions[0].query;
        input.value = targetQuery;
        originalUserTyped = targetQuery;
        input.setSelectionRange(targetQuery.length, targetQuery.length);
        _renderSuggestions(targetQuery);
        return;
      }

      const items = document.querySelectorAll('.search-suggestion-item');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!menuOpen) {
          _openMenu();
          return;
        }
        if (currentSuggestions.length > 0) {
          if (selectedIndex < currentSuggestions.length - 1) {
            selectedIndex++;
          } else {
            selectedIndex = -1;
          }
          _updateSelection(items, input);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!menuOpen) {
          _openMenu();
          return;
        }
        if (currentSuggestions.length > 0) {
          if (selectedIndex > -1) {
            selectedIndex--;
          } else {
            selectedIndex = currentSuggestions.length - 1;
          }
          _updateSelection(items, input);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // The query ALWAYS goes from what is in the search box
        _executeSearch(input.value, isAiMode);
      } else if (e.key === 'Escape') {
        input.blur();
        _closeMenu();
        _closeEngineDropdown();
      }
    });

    // "/" key to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input && !_isInputFocused()) {
        e.preventDefault();
        input.focus();
        _openMenu();
      }
    });

    // Close / Exit AI Mode button
    const aiCloseBtn = document.getElementById('btn-ai-mode-close');
    if (aiCloseBtn) {
      const handleCloseAi = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAiMode) {
          _toggleAiMode();
          _closeMenu();
        }
      };
      aiCloseBtn.addEventListener('click', handleCloseAi);
      aiCloseBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCloseAi(e);
        }
      });
    }

    // AI Mode button click (enters AI mode)
    if (aiBtn) {
      aiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _toggleAiMode();
        _closeMenu();
      });
    }

    // Engine selector button
    if (engineBtn) {
      engineBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (engineDropdownOpen) {
          _closeEngineDropdown();
        } else {
          _openEngineDropdown();
        }
      });
    }

    // Add Shortcut button inside dropdown footer
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _closeMenu();
        const mainAddBtn = document.getElementById('btn-add-shortcut');
        if (mainAddBtn) {
          mainAddBtn.click();
        }
      });
    }

    // Clear history button
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _clearHistory();
      });
    }

    // Initialize sub-modules
    _setupVoiceSearch();
    _setupImageSearch();
    _setupAddMenu();

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (searchWrap && !searchWrap.contains(e.target)) {
        _closeMenu();
        _closeEngineDropdown();
      }
    });

    // Auto-adjust dropdown height on window resize
    window.addEventListener('resize', () => {
      if (menuOpen) {
        _adjustDropdownMaxHeight();
      }
    });
  }

  function _updateSelection(items, input) {
    if (selectedIndex === -1) {
      items.forEach(item => item.classList.remove('selected'));
      if (input && typeof originalUserTyped === 'string') {
        input.value = originalUserTyped;
        input.setSelectionRange(input.value.length, input.value.length);
      }
      return;
    }

    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
        if (currentSuggestions[selectedIndex]) {
          input.value = currentSuggestions[selectedIndex].query;
          input.setSelectionRange(input.value.length, input.value.length);
        }
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function _isInputFocused() {
    const tag = document.activeElement?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.contentEditable === 'true';
  }

  async function _save() {
    await Storage.setSync({
      searchEngine: currentEngine,
      customSearchUrl: customUrl,
    });
  }

  function setCustomUrl(url) {
    customUrl = url;
    _save();
  }

  return {
    init, setCustomUrl, ENGINES,
    get engine() { return currentEngine; },
    get customUrl() { return customUrl; },
    get isAiMode() { return isAiMode; },
    toggleAiMode: _toggleAiMode,
  };
})();
