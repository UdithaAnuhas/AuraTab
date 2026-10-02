/**
 * Theme Engine
 * Handles light/dark/auto modes, accent colors, presets, and Material You palette generation
 * Uses OKLCH-inspired tonal ramps via HSL for dependency-free color math
 */
'use strict';

const Theme = (() => {
  const PRESETS = {
    midnight: { accent: '#6366f1', name: 'Midnight' },
    aurora: { accent: '#06b6d4', name: 'Aurora' },
    sunset: { accent: '#f97316', name: 'Sunset' },
    forest: { accent: '#22c55e', name: 'Forest' },
    rose: { accent: '#f43f5e', name: 'Rose' },
    mono: { accent: '#71717a', name: 'Mono' },
    ocean: { accent: '#3b82f6', name: 'Ocean' },
    lavender: { accent: '#a78bfa', name: 'Lavender' },
    cherry: { accent: '#e11d48', name: 'Cherry' },
    gold: { accent: '#eab308', name: 'Gold' },
    teal: { accent: '#14b8a6', name: 'Teal' },
    ember: { accent: '#dc2626', name: 'Ember' },
  };

  let currentMode = 'auto';
  let currentPreset = 'midnight';
  let currentAccent = '#6366f1';
  let materialYouEnabled = false;

  /** Parse hex to RGB */
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  /** RGB to HSL */
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /** HSL to hex */
  function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  /**
   * Generate Material You tonal palette from seed color
   * Creates 11 tonal steps (0-100) using HSL lightness ramps
   * with slight desaturation at extremes (mimics OKLCH behavior)
   */
  function generateTonalPalette(seedHex) {
    const rgb = hexToRgb(seedHex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const tones = {};
    const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
    const lightness = [0, 8, 16, 25, 35, 45, 55, 65, 76, 87, 93, 97, 100];
    // Desaturate at extremes for a more natural palette
    const satMult = [0, 0.4, 0.6, 0.75, 0.85, 0.95, 1.0, 0.95, 0.85, 0.7, 0.5, 0.3, 0];

    steps.forEach((step, i) => {
      const sat = Math.min(100, hsl.s * satMult[i]);
      tones['tone-' + step] = hslToHex(hsl.h, sat, lightness[i]);
    });

    return tones;
  }

  /** Derive accent hover and dim colors */
  function deriveAccentVariants(hex) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hover = hslToHex(hsl.h, Math.min(100, hsl.s * 1.05), Math.min(85, hsl.l + 12));
    const dim = hex + '26'; // ~15% alpha
    return { hover, dim };
  }

  /** Apply accent color to CSS */
  function applyAccent(hex) {
    if (!hex || typeof hex !== 'string') return;
    if (!hex.startsWith('#')) hex = '#' + hex;
    const rgb = hexToRgb(hex);
    if (!rgb || isNaN(rgb.r)) return;
    const { hover, dim } = deriveAccentVariants(hex);
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-hover', hover);
    root.style.setProperty('--accent-dim', dim);
    root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    currentAccent = hex;
  }

  /** Apply tonal palette to CSS */
  function applyTonalPalette(palette) {
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, val]) => {
      root.style.setProperty('--' + key, val);
    });
  }

  /** Set theme mode */
  function setMode(mode) {
    currentMode = mode;
    document.documentElement.setAttribute('data-theme', mode);
    _saveToCache();
  }

  /** Set preset */
  function setPreset(preset) {
    if (!PRESETS[preset]) return;
    currentPreset = preset;
    document.documentElement.setAttribute('data-preset', preset);
    applyAccent(PRESETS[preset].accent);

    if (materialYouEnabled) {
      const palette = generateTonalPalette(PRESETS[preset].accent);
      applyTonalPalette(palette);
    }
    _saveToCache();
  }

  /** Set custom accent */
  function setCustomAccent(hex) {
    if (!hex || typeof hex !== 'string') return;
    if (!hex.startsWith('#')) hex = '#' + hex;
    currentPreset = '';
    document.documentElement.removeAttribute('data-preset');
    applyAccent(hex);

    if (materialYouEnabled) {
      const palette = generateTonalPalette(hex);
      applyTonalPalette(palette);
    }
    _saveToCache();
  }

  /** Toggle Material You */
  function setMaterialYou(enabled) {
    materialYouEnabled = enabled;
    if (enabled) {
      const palette = generateTonalPalette(currentAccent);
      applyTonalPalette(palette);
    }
    _saveToCache();
  }

  /** Extract dominant color from image element using canvas sampling */
  function extractColorFromImage(imgElement) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 64; // Sample at low res for speed
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(imgElement, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Simple vibrant color extraction: find most saturated pixel cluster
      let bestSat = 0;
      let bestColor = { r: 100, g: 100, b: 200 };
      const buckets = {};

      for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
        const r = data[i], g = data[i+1], b = data[i+2];
        const hsl = rgbToHsl(r, g, b);
        // Skip very dark/light pixels
        if (hsl.l < 15 || hsl.l > 85) continue;
        // Bucket by hue (every 10 degrees)
        const bucket = Math.round(hsl.h / 10) * 10;
        if (!buckets[bucket]) buckets[bucket] = { total: 0, r: 0, g: 0, b: 0, sat: 0 };
        buckets[bucket].total++;
        buckets[bucket].r += r;
        buckets[bucket].g += g;
        buckets[bucket].b += b;
        buckets[bucket].sat += hsl.s;
      }

      // Find bucket with highest combined score (count * saturation)
      let bestScore = 0;
      Object.values(buckets).forEach(b => {
        const score = b.total * (b.sat / b.total);
        if (score > bestScore) {
          bestScore = score;
          bestColor = {
            r: Math.round(b.r / b.total),
            g: Math.round(b.g / b.total),
            b: Math.round(b.b / b.total)
          };
        }
      });

      const toHex = x => { const h = x.toString(16); return h.length === 1 ? '0'+h : h; };
      return '#' + toHex(bestColor.r) + toHex(bestColor.g) + toHex(bestColor.b);
    } catch (e) {
      console.warn('Color extraction failed:', e);
      return '#6366f1';
    }
  }

  /** Measure wallpaper luminance to decide text color */
  function measureLuminance(imgElement) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 32;
      canvas.height = 32;
      ctx.drawImage(imgElement, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 32).data;
      let totalLum = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255, g = data[i+1] / 255, b = data[i+2] / 255;
        totalLum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        count++;
      }
      return totalLum / count;
    } catch (e) {
      return 0.3; // Assume dark
    }
  }

  /** Cache theme to localStorage for bootstrap */
  function _saveToCache() {
    const rgb = hexToRgb(currentAccent);
    const cache = {
      mode: currentMode,
      preset: currentPreset,
      accent: currentAccent,
      accentRgb: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '99, 102, 241',
      accentHover: document.documentElement.style.getPropertyValue('--accent-hover'),
      accentDim: document.documentElement.style.getPropertyValue('--accent-dim'),
      materialYou: materialYouEnabled,
    };
    if (materialYouEnabled) {
      cache.tonalPalette = {};
      const root = document.documentElement;
      [0,10,20,30,40,50,60,70,80,90,95,99,100].forEach(n => {
        const val = root.style.getPropertyValue('--tone-' + n);
        if (val) cache.tonalPalette['tone-' + n] = val;
      });
    }
    localStorage.setItem('hometab_theme', JSON.stringify(cache));
  }

  /** Save to storage */
  async function save() {
    await Storage.setSync({
      theme: currentMode,
      preset: currentPreset,
      accentColor: currentAccent,
      materialYou: materialYouEnabled,
    });
    _saveToCache();
  }

  /** Load from storage */
  async function load() {
    const data = await Storage.getSync(['theme', 'preset', 'accentColor', 'materialYou']);
    if (data.theme) setMode(data.theme);
    if (data.materialYou !== undefined) {
      materialYouEnabled = data.materialYou;
    }
    if (data.preset && PRESETS[data.preset]) {
      setPreset(data.preset);
    } else if (data.accentColor) {
      currentPreset = '';
      document.documentElement.removeAttribute('data-preset');
      applyAccent(data.accentColor);
      if (materialYouEnabled) {
        const palette = generateTonalPalette(data.accentColor);
        applyTonalPalette(palette);
      }
    } else {
      setPreset('midnight');
    }
  }

  return {
    PRESETS,
    load, save,
    setMode, setPreset, setCustomAccent, setMaterialYou,
    applyAccent, generateTonalPalette, applyTonalPalette,
    extractColorFromImage, measureLuminance,
    hexToRgb, rgbToHsl, hslToHex, deriveAccentVariants,
    get mode() { return currentMode; },
    get preset() { return currentPreset; },
    get accent() { return currentAccent; },
    get materialYou() { return materialYouEnabled; },
  };
})();
