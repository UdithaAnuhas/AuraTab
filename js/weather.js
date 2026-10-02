/**
 * Weather module
 * Uses Open-Meteo (free, no key) for weather + geocoding
 * 30-min cache, offline fallback, °C/°F toggle
 */
'use strict';

const Weather = (() => {
  const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  let unit = 'celsius';
  let location = null; // { name, lat, lon, country }
  let lastData = null;
  let popoverEl = null;

  // WMO weather codes to descriptions and icon names
  const WMO_CODES = {
    0: { desc: 'Clear sky', icon: 'sun' },
    1: { desc: 'Mainly clear', icon: 'sun' },
    2: { desc: 'Partly cloudy', icon: 'cloud-sun' },
    3: { desc: 'Overcast', icon: 'cloud' },
    45: { desc: 'Foggy', icon: 'fog' },
    48: { desc: 'Rime fog', icon: 'fog' },
    51: { desc: 'Light drizzle', icon: 'drizzle' },
    53: { desc: 'Moderate drizzle', icon: 'drizzle' },
    55: { desc: 'Dense drizzle', icon: 'drizzle' },
    61: { desc: 'Slight rain', icon: 'rain' },
    63: { desc: 'Moderate rain', icon: 'rain' },
    65: { desc: 'Heavy rain', icon: 'rain' },
    71: { desc: 'Slight snow', icon: 'snow' },
    73: { desc: 'Moderate snow', icon: 'snow' },
    75: { desc: 'Heavy snow', icon: 'snow' },
    80: { desc: 'Slight showers', icon: 'rain' },
    81: { desc: 'Moderate showers', icon: 'rain' },
    82: { desc: 'Violent showers', icon: 'rain' },
    85: { desc: 'Snow showers', icon: 'snow' },
    86: { desc: 'Heavy snow showers', icon: 'snow' },
    95: { desc: 'Thunderstorm', icon: 'storm' },
    96: { desc: 'Thunderstorm with hail', icon: 'storm' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'storm' },
  };

  const WEATHER_ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    'cloud-sun': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 17.66l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M17.07 4.93l1.41-1.41"/><circle cx="12" cy="9" r="4"/><path d="M8 16a5 5 0 0 1 8 0"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 15h18M3 19h18M5 11h14a4 4 0 0 0 0-8H9a4 4 0 0 0-4 4"/></svg>',
    drizzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="8" y1="21" x2="8" y2="23"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="16" y1="21" x2="16" y2="23"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 13V7a4 4 0 0 0-8 0v6"/><path d="M8 13a5 5 0 0 0 8 0"/><line x1="8" y1="17" x2="7" y2="21"/><line x1="12" y1="17" x2="11" y2="21"/><line x1="16" y1="17" x2="15" y2="21"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="8" y1="22" x2="8" y2="22.01"/><line x1="12" y1="22" x2="12" y2="22.01"/><line x1="16" y1="22" x2="16" y2="22.01"/></svg>',
    storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>',
  };

  async function init() {
    const data = await Storage.getSync(['weatherUnit', 'weatherLocation']);
    unit = data.weatherUnit || 'celsius';
    location = data.weatherLocation || null;

    const widget = document.getElementById('weather-widget');
    if (widget && !widget.hasAttribute('data-bound')) {
      widget.setAttribute('data-bound', 'true');
      widget.addEventListener('click', () => {
        refresh();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Refreshing weather...');
        }
      });
    }

    if (location) {
      await _fetchAndDisplay();
    } else {
      _showPlaceholder();
    }
  }

  function _showPlaceholder() {
    const iconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');
    if (iconEl) iconEl.innerHTML = WEATHER_ICONS['cloud-sun'] || WEATHER_ICONS.sun;
    if (tempEl) tempEl.textContent = '24°C';
    if (condEl) condEl.textContent = 'Singapore';
  }

  async function _fetchAndDisplay() {
    // Check cache
    const cached = await Storage.getLocal(['weatherCache']);
    if (cached.weatherCache) {
      const cache = cached.weatherCache;
      const age = Date.now() - (cache.timestamp || 0);
      if (age < CACHE_DURATION && cache.data) {
        lastData = cache.data;
        _display(cache.data);
        return;
      }
    }

    // Fetch fresh
    try {
      const params = new URLSearchParams({
        latitude: location.lat,
        longitude: location.lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
        wind_speed_unit: 'kmh',
        timezone: 'auto',
      });

      const resp = await fetch(`${WEATHER_URL}?${params}`);
      if (!resp.ok) throw new Error('Weather fetch failed');
      const result = await resp.json();

      const data = {
        temp: Math.round(result.current.temperature_2m),
        feelsLike: Math.round(result.current.apparent_temperature),
        humidity: result.current.relative_humidity_2m,
        windSpeed: Math.round(result.current.wind_speed_10m),
        weatherCode: result.current.weather_code,
        unit: unit,
        location: location.name,
      };

      lastData = data;
      _display(data);

      // Cache it
      await Storage.setLocal({
        weatherCache: { data, timestamp: Date.now() }
      });
    } catch (e) {
      console.warn('Weather fetch error:', e);
      // Show cached data if available
      if (lastData) {
        _display(lastData);
      } else {
        const tempEl = document.getElementById('weather-temp');
        const condEl = document.getElementById('weather-condition');
        tempEl.textContent = '--°';
        condEl.textContent = I18n.t('offline', 'Offline');
      }
    }
  }

  function _display(data) {
    const iconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');

    const wmo = WMO_CODES[data.weatherCode] || WMO_CODES[0];
    const unitSymbol = data.unit === 'fahrenheit' ? '°F' : '°C';

    if (iconEl) iconEl.innerHTML = WEATHER_ICONS[wmo.icon] || WEATHER_ICONS['cloud-sun'] || WEATHER_ICONS.sun;
    if (tempEl) tempEl.textContent = `${data.temp}${unitSymbol}`;
    if (condEl) {
      condEl.textContent = data.location || (location ? location.name : wmo.desc) || 'Singapore';
    }
  }

  /** Search cities via geocoding API */
  async function searchCity(query) {
    if (!query || query.length < 2) return [];
    try {
      const params = new URLSearchParams({
        name: query,
        count: 8,
        language: I18n.currentLang || 'en',
      });
      const resp = await fetch(`${GEOCODING_URL}?${params}`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.results || []).map(r => ({
        name: r.name,
        country: r.country || '',
        admin1: r.admin1 || '',
        lat: r.latitude,
        lon: r.longitude,
      }));
    } catch (e) {
      console.warn('Geocoding error:', e);
      return [];
    }
  }

  /** Set location and fetch weather */
  async function setLocation(loc) {
    location = loc;
    await Storage.setSync({ weatherLocation: loc });
    await _fetchAndDisplay();
  }

  /** Set unit */
  async function setUnit(u) {
    unit = u;
    await Storage.setSync({ weatherUnit: u });
    // Clear cache to refetch with new unit
    await Storage.removeLocal(['weatherCache']);
    if (location) await _fetchAndDisplay();
  }

  /** Use browser geolocation */
  async function useGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = {
            name: 'Current Location',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            country: '',
          };
          // Try reverse geocoding to get city name
          try {
            const results = await searchCity(`${pos.coords.latitude},${pos.coords.longitude}`);
            if (results.length > 0) {
              loc.name = results[0].name;
              loc.country = results[0].country;
            }
          } catch { /* keep 'Current Location' */ }
          await setLocation(loc);
          resolve(loc);
        },
        (err) => reject(err),
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  /** Refresh weather data */
  async function refresh() {
    await Storage.removeLocal(['weatherCache']);
    if (location) await _fetchAndDisplay();
  }

  return {
    init, searchCity, setLocation, setUnit, useGeolocation, refresh,
    WMO_CODES, WEATHER_ICONS,
    get unit() { return unit; },
    get location() { return location; },
    get lastData() { return lastData; },
  };
})();
