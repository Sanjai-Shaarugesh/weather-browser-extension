document.addEventListener('DOMContentLoaded', loadSettings);

const themeToggle = document.getElementById('themeToggle');
const unitToggle = document.getElementById('unitToggle');
const locationMode = document.getElementById('locationMode');
const manualLocation = document.getElementById('manualLocation');
const updateInterval = document.getElementById('updateInterval');
const saveButton = document.getElementById('saveSettings');

async function loadSettings() {
  const settings = await chrome.storage.sync.get({
    theme: 'light',
    useFahrenheit: false,
    locationMode: 'auto',
    manualLocation: '',
    updateInterval: 30
  });

  themeToggle.checked = settings.theme === 'dark';
  unitToggle.checked = settings.useFahrenheit;
  locationMode.value = settings.locationMode;
  manualLocation.value = settings.manualLocation;
  manualLocation.disabled = settings.locationMode === 'auto';
  updateInterval.value = settings.updateInterval;

  updateLabels();
}

function updateLabels() {
  document.getElementById('themeLabel').textContent = 
    themeToggle.checked ? 'Dark Mode' : 'Light Mode';
  document.getElementById('unitLabel').textContent = 
    unitToggle.checked ? 'Fahrenheit (°F)' : 'Celsius (°C)';
}

themeToggle.addEventListener('change', updateLabels);
unitToggle.addEventListener('change', updateLabels);

locationMode.addEventListener('change', (e) => {
  manualLocation.disabled = e.target.value === 'auto';
});

saveButton.addEventListener('click', async () => {
  const settings = {
    theme: themeToggle.checked ? 'dark' : 'light',
    useFahrenheit: unitToggle.checked,
    locationMode: locationMode.value,
    manualLocation: manualLocation.value,
    updateInterval: parseInt(updateInterval.value)
  };

  await chrome.storage.sync.set(settings);
  
  const status = document.getElementById('saveStatus');
  status.textContent = 'Settings saved!';
  setTimeout(() => {
    status.textContent = '';
  }, 2000);

  
  chrome.runtime.sendMessage({ action: 'updateWeather' });
});
