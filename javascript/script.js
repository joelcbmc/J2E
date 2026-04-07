const API_KEY = '4ed985fb9ddb1fd14d3b447f05d85d6b';

let forecastData = {}; // Store forecast data for modal
let homeGlobe = null; // Globo per a l'home
let homeUserLat = 0;
let homeUserLng = 0;

document.getElementById('searchBtn').addEventListener('click', () => getWeather());

document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Carregar l'última ciutat cercada en carregar la pàgina
window.addEventListener('load', () => {
    // Inicialitzar el mapa del món
    initHomeGlobe();
    
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
        getWeather(savedCity);
    }
});

function initHomeGlobe() {
    const container = document.getElementById('homeMap');
    if (!container) return;
    
    homeGlobe = Globe()(container)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .width(container.clientWidth > 0 ? container.clientWidth : 650)
        .height(container.clientWidth > 0 ? container.clientWidth : 650)
        .pointAltitude(0.1)
        .pointColor(() => 'red');
    
    // Mostrar el mapa per defecte
    document.getElementById('homeMapContainer').style.display = 'block';
    
    // Configurar botons del mapa
    document.getElementById('homeRefreshBtn').addEventListener('click', () => {
        document.getElementById('homeStatus').innerText = 'Actualitzant...';
        document.getElementById('homeWeatherInfo').style.display = 'none';
        requestHomeLocation();
    });

    document.getElementById('homeCenterBtn').addEventListener('click', () => {
        if (homeGlobe) {
            homeGlobe.pointOfView({ lat: homeUserLat, lng: homeUserLng, altitude: 0.4 }, 1000);
        }
    });
    
    // Solicitar ubicació inicial
    requestHomeLocation();
}

function requestHomeLocation() {
    if (!navigator.geolocation) {
        document.getElementById('homeStatus').innerText = 'El teu navegador no admet la geolocalització.';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            homeUserLat = latitude;
            homeUserLng = longitude;
            document.getElementById('homeStatus').innerText = 'Ubicació trobada!';
            if (homeGlobe) {
                homeGlobe.pointsData([{ lat: latitude, lng: longitude, size: 0.5 }]);
                homeGlobe.pointOfView({ lat: latitude, lng: longitude, altitude: 0.4 }, 1000);
            }
            await loadHomeWeather(latitude, longitude);
        },
        (error) => {
            console.error('Geolocation error:', error);
            document.getElementById('homeStatus').innerText = `No s'ha pogut obtenir la ubicació.`;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

async function loadHomeWeather(lat, lon) {
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

        document.getElementById('homeLocationName').innerText = `${city}${country}`;
        document.getElementById('homeLocalTime').innerText = `Hora local: ${new Date().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}`;
        document.getElementById('homeWeatherSummary').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" style="width: 50px; height: 50px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));">
                <span style="font-size: 1.1rem;"><strong>${description.charAt(0).toUpperCase() + description.slice(1)}</strong> | ${temp}°C</span>
            </div>
        `;

        document.getElementById('homeWeatherInfo').style.display = 'flex';
        document.getElementById('homeStatus').innerText = 'Ubicació geolocalitzada correctament.';

        updateBackground(data.weather[0].id, icon);
    } catch (error) {
        console.error('Weather error:', error);
        document.getElementById('homeStatus').innerText = 'Error carregant el clima.';
    }
}

async function getWeather(savedCity = null) {
    const inputField = document.getElementById('cityInput');
    const city = savedCity || inputField.value;
    const resultDiv = document.getElementById('weatherResult');
    const errorP = document.getElementById('errorMessage');

    if (!city) return;

    if (savedCity) inputField.value = savedCity;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ca`;

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

            // Desar a la memòria cau
            localStorage.setItem('lastCity', data.name);

            resultDiv.style.display = 'block';
            errorP.style.display = 'none';
            
            // Ocultar el mapa del món cuando se muestren resultats
            document.getElementById('homeMapContainer').style.display = 'none';

            getForecast(city);
        } else {
            resultDiv.style.display = 'none';
            document.getElementById('forecastContainer').style.display = 'none';
            errorP.style.display = 'block';
            errorP.innerText = "No s'ha trobat la ciutat. Torna-ho a provar.";
        }
    } catch (error) {
        console.error("Error connectant amb el servidor:", error);
        errorP.style.display = 'block';
        document.getElementById('forecastContainer').style.display = 'none';
        errorP.innerText = "Error de connexió a internet.";
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
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ca`;
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
                    <div class="forecast-date">${new Date(date).toLocaleDateString('ca-ES', { weekday: 'short', day: 'numeric' })}</div>
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

    modalDate.innerText = new Date(date).toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    modalDetails.innerHTML = '';

    forecastData[date].forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
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

// Neteja els resultats de cerca quan es fa clic al logo
document.querySelector('.header-logo').addEventListener('click', (e) => {
    // Només netejar si es fa clic directament al logo (no deixar que el navegador ho faci automàticament)
    e.preventDefault();
    
    // Netejar localStorage
    localStorage.removeItem('lastCity');
    
    // Netejar el camp d'entrada
    document.getElementById('cityInput').value = '';
    
    // Ocultar els resultats
    document.getElementById('weatherResult').style.display = 'none';
    document.getElementById('forecastContainer').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    // Mostrar el mapa del món
    document.getElementById('homeMapContainer').style.display = 'block';
    
    // Restablir el fons a la pàgina d'inici
    document.body.className = '';
    document.getElementById('weather-bg').innerHTML = '';
    
    // Navegar a la pàgina de inici
    window.location.href = 'index.html';
});

// ============================================
// AUTH SYSTEM - Supabase Integration
// ============================================

// Wait for supabase to be ready before initializing auth
async function initAuthSystem() {
    // Wait for supabase client
    if (window.supabaseReady) {
        await window.supabaseReady;
    }
    
    // Now initialize auth
    await initAuth();
}

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authModal = document.getElementById('authModal');
const authClose = document.querySelector('.auth-close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');
const authMessage = document.getElementById('authMessage');
const userMenu = document.getElementById('userMenu');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Modal Functions
function openModal() {
    authModal.classList.add('active');
}

function closeModal() {
    authModal.classList.remove('active');
    clearForm();
}

function clearForm() {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const registerUsername = document.getElementById('registerUsername');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    if (registerUsername) registerUsername.value = '';
    if (registerEmail) registerEmail.value = '';
    if (registerPassword) registerPassword.value = '';
    if (authMessage) {
        authMessage.style.display = 'none';
        authMessage.className = 'auth-message';
    }
}

function showMessage(message, type = 'info') {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
}

// Switch Forms
if (showRegister) {
    showRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        clearForm();
    });
}

if (showLogin) {
    showLogin.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        clearForm();
    });
}

// Open Modal Events
if (loginBtn) loginBtn.addEventListener('click', openModal);
if (registerBtn) registerBtn.addEventListener('click', openModal);
if (authClose) authClose.addEventListener('click', closeModal);

if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });
}

// Login Handler
if (loginSubmit) {
    loginSubmit.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showMessage('Si us plau, completa tots els camps', 'error');
            return;
        }

        loginSubmit.disabled = true;
        loginSubmit.textContent = 'Iniciant sessió...';

        const result = await window.signIn(email, password);

        if (result.success) {
            showMessage('Sessió iniciada correctament!', 'success');
            setTimeout(() => {
                closeModal();
                updateAuthUI(result.user);
            }, 1000);
        } else {
            showMessage(result.error || 'Error en iniciar sessió', 'error');
        }

        loginSubmit.disabled = false;
        loginSubmit.textContent = 'Iniciar sessió';
    });
}

// Register Handler
if (registerSubmit) {
    registerSubmit.addEventListener('click', async () => {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!username || !email || !password) {
            showMessage('Si us plau, completa tots els camps', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('La contrasenya ha de tenir almenys 6 caràcters', 'error');
            return;
        }

        registerSubmit.disabled = true;
        registerSubmit.textContent = 'Creant compte...';

        const result = await window.signUp(email, password, username);

        if (result.success) {
            showMessage('Compte creat! Si has activat el correu de confirmació, revisa la teva safata d\'entrada.', 'success');
            setTimeout(() => {
                closeModal();
                updateAuthUI(result.user);
            }, 2000);
        } else {
            showMessage(result.error || 'Error en registrar', 'error');
        }

        registerSubmit.disabled = false;
        registerSubmit.textContent = 'Crear compte';
    });
}

// User Menu Toggle
if (userBtn) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
}

document.addEventListener('click', (e) => {
    if (userMenu && !userMenu.contains(e.target)) {
        userDropdown.classList.remove('active');
    }
});

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await window.signOut();
        userDropdown.classList.remove('active');
        updateAuthUI(null);
    });
}

// Update UI based on auth state
function updateAuthUI(user) {
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        const displayName = user.user_metadata?.username || user.email?.split('@')[0];
        if (userName) userName.textContent = displayName;
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Initialize auth state
async function initAuth() {
    if (typeof window.getCurrentUser === 'function') {
        const result = await window.getCurrentUser();
        updateAuthUI(result.success ? result.user : null);
    }
}

// Listen for auth changes
if (typeof window.onAuthStateChanged === 'function') {
    window.onAuthStateChanged((session) => {
        if (session) {
            updateAuthUI(session.user);
        } else {
            updateAuthUI(null);
        }
    });
}

// Initialize on page load - wait for supabase first
initAuthSystem();
