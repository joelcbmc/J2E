const API_KEY = '4ed985fb9ddb1fd14d3b447f05d85d6b';

const statusEl = document.getElementById('status');
const weatherInfoEl = document.getElementById('weatherInfo');
const locationNameEl = document.getElementById('locationName');
const localTimeEl = document.getElementById('localTime');
const weatherSummaryEl = document.getElementById('weatherSummary');
const refreshBtn = document.getElementById('refreshBtn');
const centerBtn = document.getElementById('centerBtn');

let globe;
let userLat = 0;
let userLng = 0;

function init() {
    const container = document.getElementById('map');
    globe = Globe()(container)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .width(container.clientWidth > 0 ? container.clientWidth : 650)
        .height(container.clientWidth > 0 ? container.clientWidth : 650)
        .pointAltitude(0.1)
        .pointColor(() => 'red');

    refreshBtn.addEventListener('click', () => {
        statusEl.innerText = 'Actualitzant...';
        weatherInfoEl.style.display = 'none';
        requestLocation();
    });

    centerBtn.addEventListener('click', () => {
        if (globe) {
            globe.pointOfView({ lat: userLat, lng: userLng, altitude: 0.4 }, 1000);
        }
    });

    requestLocation();
}

function requestLocation() {
    if (!navigator.geolocation) {
        statusEl.innerText = 'El teu navegador no admet la geolocalització.';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            userLat = latitude;
            userLng = longitude;
            statusEl.innerText = 'Ubicació trobada!';
            if (globe) {
                globe.pointsData([{ lat: latitude, lng: longitude, size: 0.5 }]);
                globe.pointOfView({ lat: latitude, lng: longitude, altitude: 0.4 }, 1000);
            }
            await loadWeather(latitude, longitude);
        },
        (error) => {
            console.error('Geolocation error:', error);
            statusEl.innerText = `No s’ha pogut obtenir la ubicació.`;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

async function loadWeather(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ca`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        const city = data.name || 'Ubicació desconeguda';
        const country = data.sys?.country ? `, ${data.sys.country}` : '';
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
        const temp = Math.round(data.main.temp);

        locationNameEl.innerText = `${city}${country}`;
        localTimeEl.innerText = `Hora local: ${new Date().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}`;
        weatherSummaryEl.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" style="width: 50px; height: 50px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));">
                <span style="font-size: 1.1rem;"><strong>${description.charAt(0).toUpperCase() + description.slice(1)}</strong> | ${temp}°C</span>
            </div>
        `;

        weatherInfoEl.style.display = 'flex';
        statusEl.innerText = 'Ubicació geolocalitzada correctament.';

        updateBackground(data.weather[0].id, icon);
    } catch (error) {
        console.error('Weather error:', error);
        statusEl.innerText = 'Error carregant el clima.';
    }
}

init();

function updateBackground(weatherId, iconCode) {
    const bgContainer = document.getElementById('weather-bg');
    const body = document.body;
    bgContainer.innerHTML = '';
    body.className = 'map';

    const isNight = iconCode.includes('n');
    if (isNight) body.classList.add('night');

    let type = '';
    if (weatherId >= 200 && weatherId < 300) {
        type = 'thunderstorm';
        createParticles(bgContainer, 'rain-drop', 150);
    } else if (weatherId >= 300 && weatherId < 600) {
        type = 'rain';
        createParticles(bgContainer, 'rain-drop', 120);
    } else if (weatherId >= 600 && weatherId < 700) {
        type = 'snow';
        createParticles(bgContainer, 'snow-flake', 80);
    } else if (weatherId >= 700 && weatherId < 800) {
        type = 'clouds';
        createParticles(bgContainer, 'cloud-particle', 30);
    } else if (weatherId === 800) {
        type = 'clear';
    } else if (weatherId > 800) {
        type = 'clouds';
        createParticles(bgContainer, 'cloud-particle', 25);
    }

    if (type) body.classList.add(type);
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

// Neteja quan es fa clic al logo per tornar a l'inici
document.querySelector('.header-logo').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Netejar localStorage
    localStorage.removeItem('lastCity');
    
    // Navegar a la pàgina de inici
    window.location.href = '../index.html';
});
