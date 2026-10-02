/**
 * Storage abstraction layer
 * Wraps chrome.storage.sync, chrome.storage.local, and IndexedDB
 * with graceful fallbacks to localStorage.
 */
'use strict';

const Storage = (() => {
  const DB_NAME = 'hometab_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'blobs';

  // Detect if chrome.storage is available
  const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage;

  /** chrome.storage.sync wrapper (small settings) */
  async function getSync(keys) {
    if (!hasChromeStorage) {
      return _localGet(keys);
    }
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('storage.sync.get error:', chrome.runtime.lastError);
          resolve(_localGet(keys));
          return;
        }
        resolve(result);
      });
    });
  }

  async function setSync(data) {
    if (!hasChromeStorage) {
      _localSet(data);
      return;
    }
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          console.warn('storage.sync.set error:', chrome.runtime.lastError);
          _localSet(data);
        }
        resolve();
      });
    });
  }

  /** chrome.storage.local wrapper (larger data like todos, weather cache) */
  async function getLocal(keys) {
    if (!hasChromeStorage) {
      return _localGet(keys);
    }
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('storage.local.get error:', chrome.runtime.lastError);
          resolve(_localGet(keys));
          return;
        }
        resolve(result);
      });
    });
  }

  async function setLocal(data) {
    if (!hasChromeStorage) {
      _localSet(data);
      return;
    }
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.warn('storage.local.set error:', chrome.runtime.lastError);
          _localSet(data);
        }
        resolve();
      });
    });
  }

  async function removeLocal(keys) {
    if (!hasChromeStorage) {
      const arr = Array.isArray(keys) ? keys : [keys];
      arr.forEach(k => localStorage.removeItem('hometab_' + k));
      return;
    }
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => resolve());
    });
  }

  /** IndexedDB wrapper for wallpaper blobs */
  function _openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function putBlob(key, blob) {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(blob, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB putBlob error:', e);
    }
  }

  async function getBlob(key) {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB getBlob error:', e);
      return null;
    }
  }

  async function deleteBlob(key) {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB deleteBlob error:', e);
    }
  }

  async function clearAllBlobs() {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB clear error:', e);
    }
  }

  /** localStorage fallback helpers */
  function _localGet(keys) {
    const result = {};
    const arr = Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : Object.keys(keys));
    arr.forEach(k => {
      const val = localStorage.getItem('hometab_' + k);
      if (val !== null) {
        try { result[k] = JSON.parse(val); } catch { result[k] = val; }
      }
    });
    return result;
  }

  function _localSet(data) {
    Object.keys(data).forEach(k => {
      localStorage.setItem('hometab_' + k, JSON.stringify(data[k]));
    });
  }

  /** Export all settings as JSON */
  async function exportAll() {
    const sync = await getSync([
      'theme', 'preset', 'accentColor', 'clockMode', 'clock24h', 'showSeconds', 'clockFont', 'clockSize',
      'searchEngine', 'customSearchUrl', 'userName', 'customGreeting',
      'weatherUnit', 'weatherLocation', 'language', 'wallpaperSource',
      'wallpaperUrl', 'wallpaperBlur', 'wallpaperDim', 'wallpaperBrightness',
      'shortcuts', 'aiTools', 'widgetVisibility', 'materialYou'
    ]);
    const local = await getLocal(['todos', 'weatherCache']);
    return { ...sync, ...local, _exportDate: new Date().toISOString() };
  }

  /** Import settings from JSON */
  async function importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid data');
    const { todos, weatherCache, _exportDate, ...syncData } = data;
    if (Object.keys(syncData).length > 0) {
      await setSync(syncData);
    }
    if (todos) await setLocal({ todos });
    if (weatherCache) await setLocal({ weatherCache });
  }

  /** Reset everything */
  async function resetAll() {
    if (hasChromeStorage) {
      await new Promise(r => chrome.storage.sync.clear(r));
      await new Promise(r => chrome.storage.local.clear(r));
    }
    // Clear localStorage hometab keys
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('hometab_')) localStorage.removeItem(k);
    });
    await clearAllBlobs();
  }

  return {
    getSync, setSync,
    getLocal, setLocal, removeLocal,
    putBlob, getBlob, deleteBlob, clearAllBlobs,
    exportAll, importAll, resetAll
  };
})();
