const WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_ICONS = {
  0: 'sun',
  1: 'cloud-sun',
  2: 'cloud',
  3: 'cloud',
  45: 'smog',
  48: 'smog',
  51: 'cloud-rain',
  53: 'cloud-rain',
  55: 'cloud-showers-heavy',
  61: 'cloud-rain',
  63: 'cloud-rain',
  65: 'cloud-showers-heavy',
  71: 'snowflake',
  73: 'snowflake',
  75: 'snowflake',
  77: 'snowflake',
  80: 'cloud-rain',
  81: 'cloud-showers-heavy',
  82: 'cloud-showers-heavy',
  85: 'snowflake',
  86: 'snowflake',
  95: 'cloud-bolt',
  96: 'cloud-bolt',
  99: 'cloud-bolt'
};

let currentSettings = {
  theme: 'light',
  locationMode: 'auto',
  units: 'celsius',
  refreshInterval: 30,
  manualLocation: ''
};


document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  refreshWeather();
});


async function loadSettings() {
  const savedSettings = await chrome.storage.sync.get('weatherSettings');
  if (savedSettings.weatherSettings) {
    currentSettings = { ...currentSettings, ...savedSettings.weatherSettings };
  }
  
  applyTheme();
  updateUIFromSettings();
}


async function saveSettings() {
  await chrome.storage.sync.set({ weatherSettings: currentSettings });
}


function setupEventListeners() {
 
  document.getElementById('theme-switch').addEventListener('change', (e) => {
    currentSettings.theme = e.target.checked ? 'dark' : 'light';
    applyTheme();
    saveSettings();
  });

  
  document.getElementById('location-mode').addEventListener('click', () => {
    toggleLocationMode();
  });

  
  document.getElementById('units').addEventListener('change', (e) => {
    currentSettings.units = e.target.value;
    saveSettings();
    refreshWeather();
  });

  document.getElementById('refresh-interval').addEventListener('change', (e) => {
    currentSettings.refreshInterval = parseInt(e.target.value);
    saveSettings();
  });

  document.getElementById('manual-location').addEventListener('change', (e) => {
    currentSettings.manualLocation = e.target.value;
    saveSettings();
    if (currentSettings.locationMode === 'manual') {
      refreshWeather();
    }
  });
}


function applyTheme() {
  document.body.setAttribute('data-theme', currentSettings.theme);
  document.getElementById('theme-switch').checked = currentSettings.theme === 'dark';
}


function updateUIFromSettings() {
  document.getElementById('units').value = currentSettings.units;
  document.getElementById('refresh-interval').value = currentSettings.refreshInterval.toString();
  document.getElementById('manual-location').value = currentSettings.manualLocation;
  document.getElementById('location-mode-text').textContent = currentSettings.locationMode.toUpperCase();
}


function toggleLocationMode() {
  currentSettings.locationMode = currentSettings.locationMode === 'auto' ? 'manual' : 'auto';
  document.getElementById('location-mode-text').textContent = currentSettings.locationMode.toUpperCase();
  saveSettings();
  refreshWeather();
}


function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (currentSettings.locationMode === 'manual' && currentSettings.manualLocation) {
      const [lat, lon] = currentSettings.manualLocation.split(',').map(coord => parseFloat(coord.trim()));
      if (lat && lon) {
        resolve({ latitude: lat, longitude: lon });
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      error => reject(error)
    );
  });
}


async function fetchWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current_weather: true,
    hourly: 'temperature_2m,weathercode,relativehumidity_2m,windspeed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode',
    timezone: 'auto'
  });

  const response = await fetch(`${WEATHER_API_BASE_URL}?${params}`);
  if (!response.ok) throw new Error('Weather data fetch failed');
  return await response.json();
}


function convertTemperature(celsius) {
  return currentSettings.units === 'fahrenheit' 
    ? (celsius * 9/5 + 32).toFixed(1) 
    : celsius.toFixed(1);
}


function updateWeatherDisplay(data) {
  
  const current = data.current_weather;
  const weatherIcon = WEATHER_ICONS[current.weathercode] || 'question';
  
  document.getElementById('weather-icon').className = `fas fa-${weatherIcon}`;
  document.getElementById('temperature').textContent = 
    `${convertTemperature(current.temperature)}°${currentSettings.units === 'celsius' ? 'C' : 'F'}`;
  document.getElementById('wind-speed').textContent = `${current.windspeed.toFixed(1)} km/h`;
  
 
  const hourlyContainer = document.getElementById('hourly-forecast');
  hourlyContainer.innerHTML = '';
  
  for (let i = 0; i < 24; i += 3) {
    const hourData = {
      time: new Date(data.hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: convertTemperature(data.hourly.temperature_2m[i]),
      code: data.hourly.weathercode[i]
    };

    const hourElement = document.createElement('div');
    hourElement.className = 'forecast-item';
    hourElement.innerHTML = `
      <div class="time">${hourData.time}</div>
      <i class="fas fa-${WEATHER_ICONS[hourData.code] || 'question'}"></i>
      <div class="temp">${hourData.temp}°</div>
    `;
    hourlyContainer.appendChild(hourElement);
  }

  
  const dailyContainer = document.getElementById('daily-forecast');
  dailyContainer.innerHTML = '';
  
  for (let i = 0; i < data.daily.time.length; i++) {
    const dayData = {
      day: new Date(data.daily.time[i]).toLocaleDateString([], { weekday: 'short' }),
      high: convertTemperature(data.daily.temperature_2m_max[i]),
      low: convertTemperature(data.daily.temperature_2m_min[i]),
      code: data.daily.weathercode[i]
    };

    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-item';
    dayElement.innerHTML = `
      <div class="day">${dayData.day}</div>
      <i class="fas fa-${WEATHER_ICONS[dayData.code] || 'question'}"></i>
      <div class="temp">${dayData.high}° / ${dayData.low}°</div>
    `;
    dailyContainer.appendChild(dayElement);
  }

  
  document.getElementById('temp-high').textContent = 
    `${convertTemperature(data.daily.temperature_2m_max[0])}°`;
  document.getElementById('temp-low').textContent = 
    `${convertTemperature(data.daily.temperature_2m_min[0])}°`;
  
  
  document.getElementById('humidity').textContent = 
    `${data.hourly.relativehumidity_2m[0]}%`;
}


async function refreshWeather() {
  try {
    const location = await getCurrentLocation();
    const weatherData = await fetchWeatherData(location.latitude, location.longitude);
    updateWeatherDisplay(weatherData);
    
   
    const locationName = await getLocationName(location.latitude, location.longitude);
    document.getElementById('location').textContent = locationName;
    
  } catch (error) {
    console.error('Weather refresh failed:', error);
    document.getElementById('condition').textContent = 'Weather data unavailable';
  }
}


async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return `${data.city || data.locality || 'Unknown'}, ${data.countryName || ''}`;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return 'Unknown Location';
  }
}


setInterval(refreshWeather, currentSettings.refreshInterval * 60 * 1000);