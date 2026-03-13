const API_KEY = '4ed985fb9ddb1fd14d3b447f05d85d6b';

let forecastData = {}; // Store forecast data for modal

document.getElementById('searchBtn').addEventListener('click', () => getWeather());

document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Cargar la última ciudad buscada al cargar la página
window.addEventListener('load', () => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
        getWeather(savedCity);
    }
});

async function getWeather(savedCity = null) {
    const inputField = document.getElementById('cityInput');
    const city = savedCity || inputField.value;
    const resultDiv = document.getElementById('weatherResult');
    const errorP = document.getElementById('errorMessage');

    if (!city) return;

    if (savedCity) inputField.value = savedCity;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('cityName').innerText = `${data.name}, ${data.sys.country}`;
            document.getElementById('description').innerText = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
            
            document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            document.getElementById('temperature').innerText = `${Math.round(data.main.temp)}°`;
            document.getElementById('feelsLike').innerText = `${Math.round(data.main.feels_like)}°`;
            document.getElementById('humidity').innerText = `${data.main.humidity}%`;
            
            const windKmh = Math.round(data.wind.speed * 3.6);
            document.getElementById('wind').innerText = `${windKmh} km/h`;

            const visKm = (data.visibility / 1000).toFixed(0);
            document.getElementById('visibility').innerText = `${visKm} km`;

            updateBackground(data.weather[0].id, data.weather[0].icon);

            // Guardar en caché
            localStorage.setItem('lastCity', data.name);

            resultDiv.style.display = 'block';
            errorP.style.display = 'none';

            getForecast(city);
        } else {
            resultDiv.style.display = 'none';
            document.getElementById('forecastContainer').style.display = 'none';
            errorP.style.display = 'block';
            errorP.innerText = "Ciudad no encontrada. Prueba de nuevo.";
        }
    } catch (error) {
        console.error("Error connectant amb el servidor:", error);
        errorP.style.display = 'block';
        document.getElementById('forecastContainer').style.display = 'none';
        errorP.innerText = "Error de conexión a internet.";
    }
}

function updateBackground(weatherId, iconCode) {
    const bgContainer = document.getElementById('weather-bg');
    const body = document.body;
    bgContainer.innerHTML = '';
    body.className = '';

    const isNight = iconCode.includes('n');
    if (isNight) body.classList.add('night');

    let type = '';
    // Thunderstorm
    if (weatherId >= 200 && weatherId < 300) {
        type = 'thunderstorm';
        createParticles(bgContainer, 'rain-drop', 150);
    } 
    // Drizzle / Rain
    else if (weatherId >= 300 && weatherId < 600) {
        type = 'rain';
        createParticles(bgContainer, 'rain-drop', 120);
    } 
    // Snow
    else if (weatherId >= 600 && weatherId < 700) {
        type = 'snow';
        createParticles(bgContainer, 'snow-flake', 80);
    } 
    // Atmosphere (Mist, Smoke, etc.)
    else if (weatherId >= 700 && weatherId < 800) {
        type = 'clouds';
        createParticles(bgContainer, 'cloud-particle', 30);
    } 
    // Clear
    else if (weatherId === 800) {
        type = 'clear';
    } 
    // Clouds
    else if (weatherId > 800) {
        type = 'clouds';
        createParticles(bgContainer, 'cloud-particle', 25);
    }

    body.classList.add(type);
}

function createParticles(container, className, count) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = className;
        
        const left = Math.random() * 110 - 5; 
        const delay = Math.random() * 5;
        let duration;

        if (className === 'rain-drop') {
            duration = Math.random() * 0.5 + 0.4;
            particle.style.width = '1px';
            particle.style.opacity = Math.random() * 0.4 + 0.3;
        } else if (className === 'snow-flake') {
            duration = Math.random() * 3 + 4;
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = Math.random() * 0.5 + 0.2;
        } else if (className === 'cloud-particle') {
            duration = Math.random() * 20 + 20;
            const size = Math.random() * 300 + 200;
            const top = Math.random() * 100;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.top = `${top}%`;
            particle.style.opacity = Math.random() * 0.2 + 0.05;
        }
        
        particle.style.left = `${left}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `-${delay}s`;

        fragment.appendChild(particle);
    }
    container.appendChild(fragment);
}

async function getForecast(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            forecastData = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000).toDateString();
                if (!forecastData[date]) {
                    forecastData[date] = [];
                }
                forecastData[date].push(item);
            });

            const forecastGrid = document.getElementById('forecastGrid');
            forecastGrid.innerHTML = '';

            // Get next 5 days
            const dates = Object.keys(forecastData).slice(0, 5);

            dates.forEach(date => {
                const dayData = forecastData[date];
                const temps = dayData.map(d => d.main.temp);
                const minTemp = Math.min(...temps);
                const maxTemp = Math.max(...temps);

                // Most common weather
                const weatherCounts = {};
                dayData.forEach(d => {
                    const desc = d.weather[0].description;
                    weatherCounts[desc] = (weatherCounts[desc] || 0) + 1;
                });
                const mostCommonDesc = Object.keys(weatherCounts).reduce((a, b) => weatherCounts[a] > weatherCounts[b] ? a : b);
                const icon = dayData.find(d => d.weather[0].description === mostCommonDesc).weather[0].icon;

                const card = document.createElement('div');
                card.className = 'forecast-card';
                
                // Ensure icon is a day version for the summary
                const dayIcon = icon.replace('n', 'd');
                
                card.innerHTML = `
                    <div class="forecast-date">${new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</div>
                    <img class="forecast-icon" src="https://openweathermap.org/img/wn/${dayIcon}@2x.png" alt="${mostCommonDesc}">
                    <div class="forecast-temp">${Math.round(minTemp)}° / ${Math.round(maxTemp)}°</div>
                    <div class="forecast-desc">${mostCommonDesc.charAt(0).toUpperCase() + mostCommonDesc.slice(1)}</div>
                `;
                card.addEventListener('click', () => showForecastDetails(date));
                forecastGrid.appendChild(card);
            });

            document.getElementById('forecastContainer').style.display = 'block';
        }
    } catch (error) {
        console.error("Error obtenint la predicció:", error);
    }
}

function showForecastDetails(date) {
    const modal = document.getElementById('forecastModal');
    const modalDate = document.getElementById('modalDate');
    const modalDetails = document.getElementById('modalDetails');

    modalDate.innerText = new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    modalDetails.innerHTML = '';

    forecastData[date].forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description.charAt(0).toUpperCase() + item.weather[0].description.slice(1);
        const icon = item.weather[0].icon;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'hourly-item';
        itemDiv.innerHTML = `
            <div class="hourly-time">${time}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" style="width: 40px; height: 40px;">
            <div class="hourly-desc">${desc}</div>
            <div class="hourly-temp">${temp}°</div>
        `;
        modalDetails.appendChild(itemDiv);
    });

    modal.style.display = 'block';
}

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('forecastModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('forecastModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
