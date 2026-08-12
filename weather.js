const cityInput = document.getElementById("cityInput");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const weather = document.getElementById("weather");


function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            description: "Clear Sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly Cloudy",
            icon: "⛅"
        },

        3: {
            description: "Overcast",
            icon: "☁️"
        },

        45: {
            description: "Fog",
            icon: "🌫️"
        },

        48: {
            description: "Fog",
            icon: "🌫️"
        },

        51: {
            description: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Heavy Drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Light Rain",
            icon: "🌦️"
        },

        63: {
            description: "Rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy Rain",
            icon: "🌧️"
        },

        71: {
            description: "Light Snow",
            icon: "🌨️"
        },

        73: {
            description: "Snow",
            icon: "❄️"
        },

        75: {
            description: "Heavy Snow",
            icon: "❄️"
        },

        80: {
            description: "Rain Showers",
            icon: "🌦️"
        },

        81: {
            description: "Rain Showers",
            icon: "🌧️"
        },

        82: {
            description: "Heavy Rain Showers",
            icon: "⛈️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            description: "Heavy Thunderstorm",
            icon: "⛈️"
        }

    };

    return weatherCodes[code] || {
        description: "Unknown",
        icon: "🌤️"
    };
}


async function getWeather() {

    const city = cityInput.value.trim();

   
    if (city === "") {

        showError("Please enter a city name.");

        return;
    }


    // Show loading
    loading.style.display = "block";

    error.textContent = "";

    weather.style.display = "none";


    try {


        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find location.");
        }

        const geoData = await geoResponse.json();


        // Check location
        if (!geoData.results || geoData.results.length === 0) {

            throw new Error(
                "City not found. Please enter a valid city name."
            );
        }


        const location = geoData.results[0];


        const latitude = location.latitude;

        const longitude = location.longitude;

        const cityName = location.name;

        const countryName = location.country;


        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
            `&timezone=auto&forecast_days=7`;


        const weatherResponse = await fetch(weatherURL);


        if (!weatherResponse.ok) {
            throw new Error("Weather data unavailable.");
        }


        const data = await weatherResponse.json();


        console.log("Weather JSON Data:", data);


        const current = data.current;


        const weatherInfo =
            getWeatherInfo(current.weather_code);


        document.getElementById("cityName").textContent =
            cityName;


        document.getElementById("countryName").textContent =
            countryName;


        document.getElementById("temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;


        document.getElementById("description").textContent =
            weatherInfo.description;


        document.getElementById("weatherIcon").textContent =
            weatherInfo.icon;


        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;


        document.getElementById("wind").textContent =
            `${current.wind_speed_10m} km/h`;


        document.getElementById("feels").textContent =
            `${Math.round(current.apparent_temperature)}°C`;


        document.getElementById("cloud").textContent =
            `${current.cloud_cover}%`;


        const updateDate =
            new Date(current.time);


        document.getElementById("updatedTime").textContent =
            updateDate.toLocaleString();


        displayForecast(data.daily);

        weather.style.display = "block";


    } catch (err) {

        console.error(err);

        showError(err.message);

    } finally {

        loading.style.display = "none";

    }
}

function displayForecast(daily) {

    const forecastContainer =
        document.getElementById("forecast");


    forecastContainer.innerHTML = "";


    for (let i = 0; i < daily.time.length; i++) {


        const date =
            new Date(daily.time[i]);


        const day =
            date.toLocaleDateString("en-US", {
                weekday: "short"
            });


        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const maxTemp =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const minTemp =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const rain =
            daily.precipitation_probability_max[i];


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <h3>${day}</h3>

            <div class="icon">
                ${weatherInfo.icon}
            </div>

            <p>${weatherInfo.description}</p>

            <p class="temp">
                ${maxTemp}° / ${minTemp}°
            </p>

            <p class="rain">
                🌧️ ${rain}% rain
            </p>

        `;


        forecastContainer.appendChild(card);
    }
}



function showError(message) {

    error.textContent = message;

    weather.style.display = "none";
}


cityInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {

            getWeather();

        }

    }
);

window.addEventListener(
    "load",
    function() {

        cityInput.value = "Salem";

        getWeather();

    }
);