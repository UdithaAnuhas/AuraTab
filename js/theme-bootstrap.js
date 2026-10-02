/**
 * Theme Bootstrap - runs synchronously before first paint.
 * Reads cached theme from localStorage and applies it to prevent FOUC.
 */
(function() {
  'use strict';
  try {
    const cached = localStorage.getItem('hometab_theme');
    if (cached) {
      const t = JSON.parse(cached);
      if (t.mode) {
        document.documentElement.setAttribute('data-theme', t.mode);
      }
      if (t.preset) {
        document.documentElement.setAttribute('data-preset', t.preset);
      }
      // Apply custom accent if set
      if (t.accent) {
        document.documentElement.style.setProperty('--accent', t.accent);
        document.documentElement.style.setProperty('--accent-hover', t.accentHover || t.accent);
        document.documentElement.style.setProperty('--accent-dim', t.accentDim || (t.accent + '26'));
        if (t.accentRgb) {
          document.documentElement.style.setProperty('--accent-rgb', t.accentRgb);
        } else {
          try {
            var rawHex = t.accent.replace('#', '');
            if (rawHex.length === 3) rawHex = rawHex.split('').map(function(c) { return c + c; }).join('');
            var parsedNum = parseInt(rawHex, 16);
            var parsedR = (parsedNum >> 16) & 255, parsedG = (parsedNum >> 8) & 255, parsedB = parsedNum & 255;
            if (!isNaN(parsedR)) {
              document.documentElement.style.setProperty('--accent-rgb', parsedR + ', ' + parsedG + ', ' + parsedB);
            }
          } catch (_) {}
        }
      }
      // Apply tonal palette if available
      if (t.tonalPalette) {
        const tp = t.tonalPalette;
        Object.keys(tp).forEach(function(key) {
          document.documentElement.style.setProperty('--' + key, tp[key]);
        });
      }
    } else {
      // Default to auto (follows system)
      document.documentElement.setAttribute('data-theme', 'auto');
    }

    // Apply language direction
    const lang = localStorage.getItem('hometab_lang');
    if (lang) {
      const rtlLangs = ['ar', 'ur', 'fa', 'he', 'yi', 'ps', 'sd'];
      const dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang);
    }

    // Set wallpaper active by default to ensure white text contrast
    document.documentElement.setAttribute('data-wallpaper-active', 'true');

    // Apply cached clock font
    const clockFont = localStorage.getItem('hometab_clock_font') || 'Outfit';
    const fontMap = {
      'Outfit': "'Outfit', system-ui, -apple-system, sans-serif",
      'iOS': "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'SF Pro', 'Plus Jakarta Sans', 'Inter', sans-serif",
      'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      'Inter': "'Inter', system-ui, -apple-system, sans-serif",
      'Space Grotesk': "'Space Grotesk', system-ui, -apple-system, sans-serif",
      'Urbanist': "'Urbanist', system-ui, -apple-system, sans-serif",
      'Orbitron': "'Orbitron', monospace, sans-serif",
      'System': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
    document.documentElement.style.setProperty('--font-clock', fontMap[clockFont] || fontMap['Outfit']);
    const cachedClockSize = parseInt(localStorage.getItem('hometab_clock_size')) || 100;
    const pxSize = Math.round(15 * (cachedClockSize / 100));
    document.documentElement.style.setProperty('--header-clock-size', pxSize + 'px');
    document.documentElement.style.setProperty('--header-clock-scale', (cachedClockSize / 100).toFixed(2));

    // Preload custom uploaded wallpaper if present in localStorage
    const wallSource = localStorage.getItem('hometab_wallpaperSource');
    const wallData = localStorage.getItem('hometab_user_wallpaper_data');
    if (wallSource === 'upload' && wallData) {
      const style = document.createElement('style');
      style.id = 'bootstrap-wallpaper-style';
      style.textContent = `.wallpaper-img { background-image: url("${wallData}") !important; }`;
      document.head.appendChild(style);
    }

    // Hide greeting name before first paint if disabled
    if (localStorage.getItem('hometab_showGreetingName') === 'false') {
      const gStyle = document.createElement('style');
      gStyle.id = 'bootstrap-greeting-hide-name';
      gStyle.textContent = '#greeting-comma, #greeting-name { display: none !important; }';
      document.head.appendChild(gStyle);
    }
    // Fast initial clock and greeting on DOM load without inline scripts (MV3 CSP compliant)
    document.addEventListener('DOMContentLoaded', () => {
      try {
        const now = new Date();
        const h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        const tt = document.getElementById('top-time');
        if (tt) tt.textContent = `${String(h).padStart(2, '0')}:${m}`;
        const td = document.getElementById('top-date');
        if (td) {
          const sw = now.toLocaleDateString('en-US', { weekday: 'short' });
          const sm = now.toLocaleDateString('en-US', { month: 'short' });
          td.textContent = `${sw}, ${sm} ${now.getDate()}, ${now.getFullYear()}`;
        }
        const gt = document.getElementById('greeting-text');
        if (gt) {
          const g = (h >= 5 && h < 12) ? 'Good morning' :
            (h >= 12 && h < 17) ? 'Good afternoon' :
            (h >= 17 && h < 22) ? 'Good evening' : 'Good night';
          gt.textContent = g;
        }
        const gd = document.getElementById('greeting-date');
        if (gd) {
          const monthStr = now.toLocaleDateString('en-US', { month: 'long' });
          const weekdayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
          gd.textContent = `${monthStr} ${now.getDate()}, ${now.getFullYear()} · ${weekdayStr}`;
        }
        const cachedName = localStorage.getItem('hometab_userName');
        if (cachedName) {
          const gn = document.getElementById('greeting-name');
          if (gn && localStorage.getItem('hometab_showGreetingName') !== 'false') {
            gn.textContent = cachedName;
          }
        }
      } catch (_) {}
    });
  } catch (e) {
    // Silently fail - theme will apply normally after load
    document.documentElement.setAttribute('data-theme', 'auto');
  }
})();
