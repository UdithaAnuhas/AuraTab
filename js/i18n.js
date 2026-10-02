/**
 * Internationalization (i18n) module
 * Lightweight JSON-based translations with RTL support
 */
'use strict';

const I18n = (() => {
  let currentLang = 'en';
  let strings = {};
  let loaded = false;

  const RTL_LANGS = ['ar', 'ur', 'fa', 'he', 'yi', 'ps', 'sd'];

  const SUPPORTED_LANGS = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  ];

  /** Detect browser language */
  function detectLanguage() {
    const saved = localStorage.getItem('hometab_lang');
    if (saved) return saved;
    const nav = navigator.language || navigator.languages?.[0] || 'en';
    // Try exact match first, then base language
    const exact = SUPPORTED_LANGS.find(l => l.code === nav);
    if (exact) return exact.code;
    const base = nav.split('-')[0];
    const partial = SUPPORTED_LANGS.find(l => l.code === base || l.code.startsWith(base));
    return partial ? partial.code : 'en';
  }

  /** Load language file */
  async function load(lang) {
    lang = lang || detectLanguage();
    try {
      const resp = await fetch(`i18n/${lang}.json`);
      if (!resp.ok) {
        // Fallback to English
        if (lang !== 'en') {
          console.warn(`Language ${lang} not found, falling back to English`);
          return load('en');
        }
        throw new Error('Could not load English strings');
      }
      strings = await resp.json();
      currentLang = lang;
      loaded = true;
      localStorage.setItem('hometab_lang', lang);

      // Set direction
      const isRtl = RTL_LANGS.includes(lang.split('-')[0]);
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);

      // Apply translations to DOM
      applyToDOM();
    } catch (e) {
      console.warn('i18n load error:', e);
      // Use inline English fallback
      strings = getEnglishFallback();
      currentLang = 'en';
      loaded = true;
    }
  }

  /** Get a translated string */
  function t(key, fallback) {
    return strings[key] || fallback || key;
  }

  /** Apply translations to all [data-i18n] elements */
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key]) {
        el.textContent = strings[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (strings[key]) {
        el.placeholder = strings[key];
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (strings[key]) {
        el.title = strings[key];
      }
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (strings[key]) {
        el.setAttribute('aria-label', strings[key]);
      }
    });
  }

  /** Get time-aware greeting */
  function getGreeting(name) {
    const hour = new Date().getHours();
    let key;
    if (hour >= 5 && hour < 12) key = 'goodMorning';
    else if (hour >= 12 && hour < 17) key = 'goodAfternoon';
    else if (hour >= 17 && hour < 22) key = 'goodEvening';
    else key = 'goodNight';

    const greeting = t(key, key === 'goodMorning' ? 'Good morning' :
      key === 'goodAfternoon' ? 'Good afternoon' :
      key === 'goodEvening' ? 'Good evening' : 'Good night');
    return greeting;
  }

  /** Inline English fallback */
  function getEnglishFallback() {
    return {
      goodMorning: 'Good morning',
      goodAfternoon: 'Good afternoon',
      goodEvening: 'Good evening',
      goodNight: 'Good night',
      settings: 'Settings',
      appearance: 'Appearance',
      wallpaper: 'Wallpaper',
      widgets: 'Widgets',
      clock: 'Clock',
      weather: 'Weather',
      search: 'Search',
      shortcuts: 'Shortcuts',
      language: 'Language',
      data: 'Data',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      accentColor: 'Accent Color',
      materialYou: 'Material You',
      presets: 'Presets',
      name: 'Name',
      url: 'URL',
      save: 'Save',
      delete: 'Delete',
      cancel: 'Cancel',
      addShortcut: 'Add Shortcut',
      editShortcut: 'Edit Shortcut',
      addTask: 'Add a task...',
      clearCompleted: 'Clear completed',
      todoList: 'To-Do List',
      bookmarks: 'Bookmarks',
      searchBookmarks: 'Search bookmarks...',
      aiTools: 'AI Tools',
      googleApps: 'Apps',
      searchWeb: 'Search the web...',
      analogClock: 'Analog Clock',
      digitalClock: 'Digital Clock',
      show24h: '24-hour',
      showSeconds: 'Show seconds',
      temperatureUnit: 'Temperature',
      celsius: 'Celsius',
      fahrenheit: 'Fahrenheit',
      location: 'Location',
      searchCity: 'Search city...',
      useGeolocation: 'Use geolocation',
      greeting: 'Greeting',
      customGreeting: 'Custom greeting',
      yourName: 'Your name',
      uploadImage: 'Upload Image',
      imageUrl: 'Image URL',
      dailyRandom: 'Daily Random',
      solidGradient: 'Solid/Gradient',
      blur: 'Blur',
      dim: 'Dim',
      brightness: 'Brightness',
      removeWallpaper: 'Remove',
      newImage: 'New Image',
      exportSettings: 'Export Settings',
      importSettings: 'Import Settings',
      resetDefaults: 'Reset to Defaults',
      confirmReset: 'Are you sure? This will erase all settings and data.',
      showWidget: 'Show',
      hideWidget: 'Hide',
      searchEngine: 'Search Engine',
      custom: 'Custom',
      customUrl: 'Custom URL template',
      privacyNote: 'Privacy: All data stays on your device. Only weather data is fetched from Open-Meteo (no API key, no tracking).',
      mostVisited: 'Most Visited',
      showMostVisited: 'Show most visited sites',
      offline: 'Offline',
      lastUpdated: 'Last updated',
      enterUrl: 'Enter URL...',
      dragToReorder: 'Drag to reorder',
      noBookmarks: 'No bookmarks found',
      noTodos: 'No tasks yet',
      midnight: 'Midnight',
      aurora: 'Aurora',
      sunset: 'Sunset',
      forest: 'Forest',
      rose: 'Rose',
      mono: 'Mono',
      ocean: 'Ocean',
      lavender: 'Lavender',
      cherry: 'Cherry',
      gold: 'Gold',
      teal: 'Teal',
      ember: 'Ember',
      humidity: 'Humidity',
      wind: 'Wind',
      feelsLike: 'Feels like',
      extractFromWallpaper: 'Extract from wallpaper',
      seedColor: 'Seed color',
    };
  }

  function isRtl() {
    return RTL_LANGS.includes(currentLang.split('-')[0]);
  }

  return {
    load,
    t,
    applyToDOM,
    getGreeting,
    detectLanguage,
    isRtl,
    SUPPORTED_LANGS,
    get currentLang() { return currentLang; },
    get loaded() { return loaded; }
  };
})();
