const WEATHER_CONDITIONS = {
  0: {
    name: "Clear Sky",
    icon: "weather-clear-symbolic",
    description: "Completely clear, sunny day",
  },
  1: {
    name: "Mainly Clear",
    icon: "weather-few-clouds-symbolic",
    description: "Mostly clear with some clouds",
  },
  2: {
    name: "Partly Cloudy",
    icon: "weather-overcast-symbolic",
    description: "Partial cloud cover",
  },
  3: {
    name: "Overcast",
    icon: "weather-overcast-symbolic",
    description: "Fully covered by clouds",
  },
  45: {
    name: "Foggy",
    icon: "weather-fog-symbolic",
    description: "Foggy conditions",
  },
  48: {
    name: "Depositing Rime Fog",
    icon: "weather-fog-symbolic",
    description: "Freezing fog",
  },
  51: {
    name: "Light Drizzle",
    icon: "weather-showers-scattered-symbolic",
    description: "Slight drizzle",
  },
  53: {
    name: "Moderate Drizzle",
    icon: "weather-showers-symbolic",
    description: "Moderate drizzle",
  },
  55: {
    name: "Dense Drizzle",
    icon: "weather-showers-symbolic",
    description: "Heavy drizzle",
  },
  61: {
    name: "Slight Rain",
    icon: "weather-showers-scattered-symbolic",
    description: "Light rain",
  },
  63: {
    name: "Moderate Rain",
    icon: "weather-showers-symbolic",
    description: "Moderate rain",
  },
  65: {
    name: "Heavy Rain",
    icon: "weather-storm-symbolic",
    description: "Heavy rainfall",
  },
  71: {
    name: "Slight Snow",
    icon: "weather-snow-symbolic",
    description: "Light snowfall",
  },
  73: {
    name: "Moderate Snow",
    icon: "weather-snow-symbolic",
    description: "Moderate snow",
  },
  75: {
    name: "Heavy Snow",
    icon: "weather-snow-symbolic",
    description: "Heavy snowfall",
  },
  77: {
    name: "Snow Grains",
    icon: "weather-snow-symbolic",
    description: "Snow grains",
  },
  80: {
    name: "Slight Rain Showers",
    icon: "weather-showers-scattered-symbolic",
    description: "Light rain showers",
  },
  81: {
    name: "Moderate Rain Showers",
    icon: "weather-showers-symbolic",
    description: "Moderate rain showers",
  },
  82: {
    name: "Violent Rain Showers",
    icon: "weather-storm-symbolic",
    description: "Intense rain showers",
  },
  85: {
    name: "Slight Snow Showers",
    icon: "weather-snow-symbolic",
    description: "Light snow showers",
  },
  86: {
    name: "Heavy Snow Showers",
    icon: "weather-snow-symbolic",
    description: "Heavy snow showers",
  },
  95: {
    name: "Thunderstorm",
    icon: "weather-storm-symbolic",
    description: "Thunderstorm",
  },
  96: {
    name: "Thunderstorm with Light Hail",
    icon: "weather-storm-symbolic",
    description: "Thunderstorm with light hail",
  },
  99: {
    name: "Thunderstorm with Heavy Hail",
    icon: "weather-storm-symbolic",
    description: "Thunderstorm with heavy hail",
  },
};


function analyzeTempTrend(hourlyData) {
  const temps = hourlyData.map(h => parseFloat(h.temperature));
  let increasing = 0;
  let decreasing = 0;

  for (let i = 1; i < temps.length; i++) {
    if (temps[i] > temps[i-1]) increasing++;
    else if (temps[i] < temps[i-1]) decreasing++;
  }

  if (increasing > decreasing * 1.5) return "Rising temperatures 🔥";
  if (decreasing > increasing * 1.5) return "Falling temperatures 🧊";
  return "Stable temperatures ⚖️";
}

function calculatePrecipChance(hourlyData) {
  const precipCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 85, 86];
  const precipHours = hourlyData.filter(h => precipCodes.includes(h.weathercode));
  return Math.round((precipHours.length / hourlyData.length) * 100);
}

function checkExtremeWeather(hourlyData) {
  const extremeCodes = {
    95: "Thunderstorm warning",
    96: "Hail warning",
    99: "Severe storm warning"
  };

  for (const hour of hourlyData) {
    if (extremeCodes[hour.weathercode]) {
      return extremeCodes[hour.weathercode];
    }
  }
  return null;
}
