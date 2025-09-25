//Configuración para el API
const API_KEY = '415e4dd68078b4feb3bf48ed59599131'; // 🔑 Usa tu clave gratuita de OpenWeatherMap
const loader = document.getElementById('loader');
const weatherCard = document.getElementById('weatherCard');
const errorDiv = document.getElementById('error');
const citySearch = document.getElementById('citySearch');
//Obtener ubicación al entrar a la página
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    showError("Geolocalización no soportada.");
    showCitySearch();
  }
};

function success(position) {
  const { latitude, longitude } = position.coords;
  getWeatherByCoords(latitude, longitude);
}

function error(err) {
  showError("No se pudo obtener tu ubicación.");
  showCitySearch();
}
//Obtención del tiempo por ubicación obtenida
function getWeatherByCoords(lat, lon) {
  showLoader();
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => showWeather(data))
    .catch(() => showError("Error al obtener el clima."));
}
//Obtención del tiempo por ciudad elegida
function getWeatherByCity() {
  const city = document.getElementById('cityInput').value;
  if (!city) return;
  showLoader();
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) {
        showWeather(data);
      } else {
        showError("Ciudad no encontrada.");
      }
    })
    .catch(() => showError("Error al buscar ciudad."));
}
//Mostrar la información obtenida
function showWeather(data) {
  hideLoader();
  weatherCard.classList.remove('hidden');

  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('temp').textContent = Math.round(data.main.temp);
  document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('wind').textContent = Math.round(data.wind.speed * 3.6); // m/s a km/h

  setBackground(data.weather[0].main.toLowerCase());

  // Iconos por descripción
  const iconMap = {
    clear: "☀️",
    clouds: "☁️",
    rain: "🌧️",
    drizzle: "🌦️",
    thunderstorm: "⛈️",
    snow: "❄️",
    mist: "🌫️",
    smoke: "🌫️"
  };
  const icon = iconMap[data.weather[0].main.toLowerCase()] || "🌈";
  document.getElementById('icon').textContent = icon;
}
//fondo según el tiempo
function setBackground(weather) {
  document.body.className = ''; // reset

  if (weather.includes("clear")) {
    document.body.classList.add("sunny");
  } else if (weather.includes("rain") || weather.includes("drizzle") || weather.includes("thunderstorm")) {
    document.body.classList.add("rainy");
  } else if (weather.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (weather.includes("snow")) {
    document.body.classList.add("snowy");
  } else {
    document.body.style.backgroundColor = "#eeeeee";
  }
}
//miscelaneos
function showLoader() {
  loader.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorDiv.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(msg) {
  hideLoader();
  errorDiv.textContent = msg;
  errorDiv.classList.remove("hidden");
}

function showCitySearch() {
  citySearch.classList.remove("hidden");
}
