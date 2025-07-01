const apiKey = "439546df6a5b22a75d89daee552b39c0";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");

const cityElem = document.querySelector(".city");
const tempElem = document.querySelector(".temp");
const humidityElem = document.querySelector(".humidity");
const windElem = document.querySelector(".wind");
const weatherIcon = document.querySelector(".weather-icon");
const datetimeElem = document.querySelector(".datetime");
const forecastButtonsContainer = document.getElementById("forecastButtons");

let forecastList = [];
let forecastChart;

async function getForecast(city) {
  try {
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const currentData = await currentRes.json();

    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const forecastData = await forecastRes.json();

    const now = new Date();
    const hour = now.getHours();

    cityElem.textContent = currentData.name;
    tempElem.textContent = `${Math.round(currentData.main.temp)}°C`;
    humidityElem.textContent = `${currentData.main.humidity}%`;
    windElem.textContent = `${currentData.wind.speed} km/h`;
    datetimeElem.textContent = now.toLocaleString();

    setIcon(currentData.weather[0].main, hour);

    forecastList = forecastData.list;
    displayForecastButtons(forecastList);
  } catch (err) {
    alert("City not found or API error.");
  }
}

function displayForecastButtons(list) {
  const daysMap = {};
  forecastButtonsContainer.innerHTML = "";

  list.forEach(entry => {
    const date = entry.dt_txt.split(" ")[0];
    if (!daysMap[date]) {
      daysMap[date] = [];
    }
    daysMap[date].push(entry);
  });

  const dayEntries = Object.entries(daysMap).slice(0, 7);

  dayEntries.forEach(([date, entries], index) => {
    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const btn = document.createElement("button");
    btn.textContent = dayName;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".forecast-buttons button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showChart(entries);
    });
    forecastButtonsContainer.appendChild(btn);

    // Auto click first button
    if (index === 0) {
      btn.click();
    }
  });
}

function showChart(entries) {
  const labels = entries.map(e => {
    const time = e.dt_txt.split(" ")[1].slice(0, 5);
    const hour = parseInt(time.split(":")[0]);
    const icon = getIconForCondition(e.weather[0].main, hour);
    return `${time} ${icon}`;
  });

  const temps = entries.map(e => e.main.temp.toFixed(1));
  const hums = entries.map(e => e.main.humidity.toFixed(1));

  if (forecastChart) forecastChart.destroy();

  const ctx = document.getElementById("forecastChart").getContext("2d");
  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temp (°C)",
          data: temps,
          borderColor: "orange",
          backgroundColor: "rgba(255,165,0,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Humidity (%)",
          data: hums,
          borderColor: "cyan",
          backgroundColor: "rgba(0,255,255,0.2)",
          fill: true,
          tension: 0.4,
        }
      ]
    },
    options: {
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });
}

function setIcon(condition, hour) {
  const isNight = (hour >= 18 || hour < 4);

  if (isNight) {
    switch (condition) {
      case "Clear":
        weatherIcon.src = "https://png.pngtree.com/png-vector/20220607/ourmid/pngtree-clear-night-moon-weather-vector-png-image_4812481.png"; // Full moon
        break;
      case "Clouds":
        weatherIcon.src = "https://cdn3.iconfinder.com/data/icons/meteocons/512/moon-cloud-512.png"; // Cloudy moon
        break;
      case "Rain":
      case "Drizzle":
        weatherIcon.src = "https://cdn1.iconfinder.com/data/icons/weather-forecast-meteorology-color-1/128/weather-night-moon-rain-1024.png"; // Rainy moon
        break;
      case "Mist":
        weatherIcon.src = "https://cdn2.iconfinder.com/data/icons/weather-color-2/500/weather-16-512.png"; // Foggy night
        break;
      default:
        weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/5802/5802695.png"; // Default moon
    }
    return;
  }

  // Daytime icons
  switch (condition) {
    case "Clear":
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // Sun
      break;
    case "Clouds":
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/414/414825.png";
      break;
    case "Rain":
    case "Drizzle":
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3075/3075858.png";
      break;
    case "Mist":
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
      break;
    default:
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
  }
}

function getIconForCondition(condition, hour) {
  const isNight = (hour >= 18 || hour < 4);

  if (isNight) {
    switch (condition) {
      case "Clear": return "🌕";
      case "Clouds": return "🌥️";
      case "Rain":
      case "Drizzle": return "🌧️";
      case "Mist": return "🌫️";
      default: return "🌙";
    }
  }

  // Daytime
  switch (condition) {
    case "Clear": return "☀️";
    case "Clouds": return "☁️";
    case "Rain":
    case "Drizzle": return "🌧️";
    case "Mist": return "🌫️";
    default: return "⛅";
  }
}

searchBtn.addEventListener("click", () => {
  const city = searchBox.value.trim();
  if (city) getForecast(city);
});

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = searchBox.value.trim();
    if (city) getForecast(city);
  }
});

window.onload = () => {
  getForecast("Delhi");
};
