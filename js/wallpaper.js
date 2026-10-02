/**
 * Wallpaper module
 * Handles curated gallery, daily rotation, upload, URL, and dynamic mesh gradients
 * with blur/dim/brightness adjustments and luminance-based text adaptation
 */
'use strict';

const Wallpaper = (() => {
  const MAX_SIZE = 2560;
  const IDB_KEY = 'user_wallpaper';
  const STORAGE_LOCAL_UPLOAD_KEY = 'user_wallpaper_data';

  // Curated, ultra-high-definition wallpapers with fast CDN delivery
  const CURATED_WALLPAPERS = [
    {
      id: 'patagonia',
      name: 'Patagonia Peaks',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'aurora',
      name: 'Cosmic Aurora',
      category: 'Night',
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'alps',
      name: 'Alpine Dawn',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'cyberpunk',
      name: 'Tokyo Neon',
      category: 'City',
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'ocean',
      name: 'Pacific Sunset',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'forest',
      name: 'Misty Forest',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'nebula',
      name: 'Deep Nebula',
      category: 'Space',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'desert',
      name: 'Golden Dunes',
      category: 'Minimal',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'fuji',
      name: 'Mount Fuji',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'fjord',
      name: 'Nordic Fjord',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'abstract',
      name: 'Liquid Glass',
      category: 'Abstract',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=360&q=70',
    },
    {
      id: 'minimal',
      name: 'Minimal Architecture',
      category: 'Architecture',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=80',
      thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=360&q=70',
    },
  ];

  let currentSource = 'curated'; // 'curated', 'daily', 'upload', 'url', 'mesh'
  let currentCuratedId = 'patagonia';
  let settings = {
    blur: 0,
    dim: 20,
    brightness: 100,
    url: '',
  };

  /** Initialize */
  async function init() {
    const syncData = await Storage.getSync([
      'wallpaperSource', 'wallpaperCuratedId', 'wallpaperUrl',
      'wallpaperBlur', 'wallpaperDim', 'wallpaperBrightness'
    ]);
    const localData = await Storage.getLocal(['wallpaperSource', 'wallpaperCuratedId']);
    const lsSource = localStorage.getItem('hometab_wallpaperSource');
    const lsCuratedId = localStorage.getItem('hometab_wallpaperCuratedId');

    currentSource = lsSource || localData.wallpaperSource || syncData.wallpaperSource || 'curated';
    currentCuratedId = lsCuratedId || localData.wallpaperCuratedId || syncData.wallpaperCuratedId || 'patagonia';
    settings.url = syncData.wallpaperUrl || '';
    settings.blur = syncData.wallpaperBlur ?? 0;
    settings.dim = syncData.wallpaperDim ?? 20;
    settings.brightness = syncData.wallpaperBrightness ?? 100;

    await applyWallpaper();
  }

  /** Apply current wallpaper */
  async function applyWallpaper() {
    const imgEl = document.getElementById('wallpaper-img');
    const overlay = document.getElementById('wallpaper-overlay');
    if (!imgEl || !overlay) return;

    if (currentSource === 'mesh') {
      imgEl.style.backgroundImage = '';
      _applyMeshGradient();
      return;
    }

    let imageUrl = '';

    switch (currentSource) {
      case 'curated': {
        const found = CURATED_WALLPAPERS.find(w => w.id === currentCuratedId) || CURATED_WALLPAPERS[0];
        imageUrl = found.url;
        break;
      }
      case 'daily': {
        imageUrl = await _getDailyImage();
        break;
      }
      case 'upload': {
        // First check chrome.storage.local
        const local = await Storage.getLocal([STORAGE_LOCAL_UPLOAD_KEY]);
        let dataUrl = local ? local[STORAGE_LOCAL_UPLOAD_KEY] : null;
        
        // Secondary fallback to localStorage
        if (!dataUrl) {
          try {
            dataUrl = localStorage.getItem('hometab_' + STORAGE_LOCAL_UPLOAD_KEY);
          } catch (e) {}
        }

        // Third fallback to IndexedDB
        if (!dataUrl) {
          try {
            const idbData = await Storage.getBlob(IDB_KEY);
            if (idbData) {
              dataUrl = typeof idbData === 'string' ? idbData : URL.createObjectURL(idbData);
            }
          } catch (e) {
            console.warn('IDB read note:', e);
          }
        }

        if (dataUrl) {
          imageUrl = dataUrl;
        } else {
          // If no custom upload exists yet, keep Patagonia as friendly placeholder without resetting source
          const defaultCurated = CURATED_WALLPAPERS.find(w => w.id === currentCuratedId) || CURATED_WALLPAPERS[0];
          imageUrl = defaultCurated.url;
        }
        break;
      }
      case 'url': {
        if (settings.url && _isValidUrl(settings.url)) {
          imageUrl = settings.url;
        }
        break;
      }
    }

    if (!imageUrl) {
      _applyMeshGradient();
      return;
    }

    // Clear solid/gradient FIRST so it doesn't wipe our image
    imgEl.style.background = '';
    
    // Apply image with !important priority
    imgEl.style.setProperty('background-image', `url("${imageUrl}")`, 'important');
    imgEl.style.setProperty('background-size', 'cover', 'important');
    imgEl.style.setProperty('background-position', 'center', 'important');
    imgEl.style.setProperty('background-repeat', 'no-repeat', 'important');
    document.documentElement.setAttribute('data-wallpaper-active', 'true');

    // Apply adjustments
    _applyAdjustments();

    // Measure luminance for text contrast
    _measureAndAdapt(imageUrl);
  }

  /** Apply a vibrant mesh gradient wallpaper */
  function _applyMeshGradient() {
    const imgEl = document.getElementById('wallpaper-img');
    const overlay = document.getElementById('wallpaper-overlay');
    if (!imgEl || !overlay) return;

    imgEl.style.backgroundImage = 'none';
    imgEl.style.background = 'radial-gradient(at 10% 15%, #4f46e5 0px, transparent 50%), radial-gradient(at 90% 10%, #7c3aed 0px, transparent 50%), radial-gradient(at 50% 90%, #06b6d4 0px, transparent 50%), radial-gradient(at 95% 85%, #ec4899 0px, transparent 50%), linear-gradient(135deg, #090919 0%, #1e1b4b 50%, #0f172a 100%)';
    imgEl.style.filter = 'none';
    imgEl.style.transform = '';
    overlay.style.background = 'rgba(0, 0, 0, 0.15)';
    document.documentElement.setAttribute('data-wallpaper-active', 'true');
    document.documentElement.setAttribute('data-wallpaper-light', 'false');
  }

  /** Apply blur, dim, brightness */
  function _applyAdjustments() {
    const imgEl = document.getElementById('wallpaper-img');
    const overlay = document.getElementById('wallpaper-overlay');
    if (!imgEl || !overlay) return;

    imgEl.style.filter = `blur(${settings.blur}px) brightness(${settings.brightness}%)`;
    if (settings.blur > 0) {
      imgEl.style.transform = `scale(${1 + settings.blur * 0.015})`;
    } else {
      imgEl.style.transform = '';
    }

    overlay.style.background = `rgba(0, 0, 0, ${settings.dim / 100})`;
  }

  /** Measure image luminance and set text color attribute */
  function _measureAndAdapt(url) {
    const img = new Image();
    if (!url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        const luminance = Theme.measureLuminance(img);
        const isLight = luminance > 0.6;
        document.documentElement.setAttribute('data-wallpaper-light', isLight ? 'true' : 'false');
      } catch (e) {
        document.documentElement.setAttribute('data-wallpaper-light', 'false');
      }
    };
    img.onerror = () => {
      document.documentElement.setAttribute('data-wallpaper-light', 'false');
    };
    img.src = url;
  }

  /** Get daily random image */
  async function _getDailyImage() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const dailyIndex = dayOfYear % CURATED_WALLPAPERS.length;
    return CURATED_WALLPAPERS[dailyIndex].url;
  }

  /** Select a curated wallpaper */
  async function setCuratedWallpaper(id) {
    const found = CURATED_WALLPAPERS.find(w => w.id === id);
    if (!found) return;
    currentCuratedId = id;
    currentSource = 'curated';
    await save();
    await applyWallpaper();
  }

  /** Cycle to next wallpaper */
  async function cycleWallpaper() {
    const currentIndex = CURATED_WALLPAPERS.findIndex(w => w.id === currentCuratedId);
    const nextIndex = (currentIndex + 1) % CURATED_WALLPAPERS.length;
    const nextWallpaper = CURATED_WALLPAPERS[nextIndex];
    await setCuratedWallpaper(nextWallpaper.id);
    return nextWallpaper;
  }

  /** Upload image with validation, downscaling to crisp Data URL, and persistent storage */
  async function uploadImage(file) {
    if (!file) throw new Error('No file selected');

    // Flexible format check: accept any image MIME type or valid extension
    const isImage = (file.type && file.type.startsWith('image/')) ||
                    /\.(jpe?g|png|webp|gif|bmp|jfif|avif|svg)$/i.test(file.name || '');
    if (!isImage) {
      throw new Error('Please select an image file (JPEG, PNG, WebP, GIF, BMP).');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target.result;
        const img = new Image();
        img.onload = async () => {
          try {
            // Downscale to max 2560x1440 JPEG Data URL
            const dataUrl = _downscaleImageToDataUrl(img);

            // Save in chrome.storage.local (unlimitedStorage permission)
            await Storage.setLocal({ [STORAGE_LOCAL_UPLOAD_KEY]: dataUrl });

            // Also save in IndexedDB as secondary backup
            try {
              await Storage.putBlob(IDB_KEY, dataUrl);
            } catch (idbErr) {
              console.warn('IDB backup note:', idbErr);
            }

            currentSource = 'upload';
            await save();
            await applyWallpaper();
            resolve(true);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to process image file. Please try another image.'));
        img.src = rawDataUrl;
      };
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsDataURL(file);
    });
  }

  /** Downscale image to max dimension and return sharp base64 Data URL */
  function _downscaleImageToDataUrl(img) {
    let { width, height } = img;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // 0.88 quality JPEG provides crisp visuals while keeping size compact
    return canvas.toDataURL('image/jpeg', 0.88);
  }

  /** Check if a custom uploaded wallpaper exists */
  async function getUploadedWallpaper() {
    const local = await Storage.getLocal([STORAGE_LOCAL_UPLOAD_KEY]);
    if (local && local[STORAGE_LOCAL_UPLOAD_KEY]) {
      return local[STORAGE_LOCAL_UPLOAD_KEY];
    }
    try {
      const idb = await Storage.getBlob(IDB_KEY);
      if (idb) return typeof idb === 'string' ? idb : URL.createObjectURL(idb);
    } catch (e) {}
    return null;
  }

  /** Set URL wallpaper */
  async function setUrl(url) {
    if (!_isValidUrl(url)) throw new Error('Invalid URL. Use http:// or https://');
    settings.url = url;
    currentSource = 'url';
    await save();
    await applyWallpaper();
  }

  /** Set source */
  async function setSource(source) {
    currentSource = source;
    await save();
    await applyWallpaper();
  }

  /** Reset / Remove custom wallpaper */
  async function remove() {
    await Storage.removeLocal([STORAGE_LOCAL_UPLOAD_KEY]);
    try {
      localStorage.removeItem('hometab_' + STORAGE_LOCAL_UPLOAD_KEY);
      await Storage.deleteBlob(IDB_KEY);
    } catch (e) {}
    currentSource = 'curated';
    currentCuratedId = 'patagonia';
    await save();
    await applyWallpaper();
  }

  /** Update adjustment */
  async function setAdjustment(key, value) {
    settings[key] = value;
    _applyAdjustments();
    await save();
  }

  /** Validate URL */
  function _isValidUrl(str) {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /** Save settings */
  async function save() {
    await Storage.setSync({
      wallpaperSource: currentSource,
      wallpaperCuratedId: currentCuratedId,
      wallpaperUrl: settings.url,
      wallpaperBlur: settings.blur,
      wallpaperDim: settings.dim,
      wallpaperBrightness: settings.brightness,
    });
    await Storage.setLocal({
      wallpaperSource: currentSource,
      wallpaperCuratedId: currentCuratedId,
    });
    try {
      localStorage.setItem('hometab_wallpaperSource', currentSource);
      localStorage.setItem('hometab_wallpaperCuratedId', currentCuratedId);
    } catch (e) {}
  }

  /** Extract color from current wallpaper for Material You */
  async function extractSeedColor() {
    return new Promise((resolve) => {
      const imgEl = document.getElementById('wallpaper-img');
      const bgImage = imgEl ? imgEl.style.backgroundImage : null;
      if (!bgImage || bgImage === 'none') {
        resolve(null);
        return;
      }
      const urlMatch = bgImage.match(/url\("?(.+?)"?\)/);
      if (!urlMatch) { resolve(null); return; }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const color = Theme.extractColorFromImage(img);
        resolve(color);
      };
      img.onerror = () => resolve(null);
      img.src = urlMatch[1];
    });
  }

  return {
    init, applyWallpaper, uploadImage, setUrl, setSource,
    remove, setCuratedWallpaper, cycleWallpaper, setAdjustment, save, extractSeedColor,
    getUploadedWallpaper,
    get source() { return currentSource; },
    get currentCuratedId() { return currentCuratedId; },
    get curatedWallpapers() { return CURATED_WALLPAPERS; },
    get settings() { return { ...settings }; },
  };
})();
