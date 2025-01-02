// Background script for handling extension lifecycle and notifications

let refreshInterval;


chrome.runtime.onInstalled.addListener(() => {
  
  chrome.storage.sync.get('weatherSettings', (data) => {
    if (!data.weatherSettings) {
      const defaultSettings = {
        theme: 'light',
        locationMode: 'auto',
        units: 'celsius',
        refreshInterval: 30,
        manualLocation: ''
      };
      chrome.storage.sync.set({ weatherSettings: defaultSettings });
    }
  });
});


chrome.storage.onChanged.addListener((changes) => {
  if (changes.weatherSettings) {
    const newSettings = changes.weatherSettings.newValue;
    updateRefreshInterval(newSettings.refreshInterval);
  }
});

function updateRefreshInterval(minutes) {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  refreshInterval = setInterval(() => {
    chrome.runtime.sendMessage({ type: 'REFRESH_WEATHER' });
  }, minutes * 60 * 1000);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get('weatherSettings', (data) => {
      sendResponse(data.weatherSettings);
    });
    return true;
  }
});