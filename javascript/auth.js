import { signIn, signUp, signOut, onAuthStateChanged, isAuthenticated } from '../lib/authService.js';

const API_BASE = 'http://localhost:8080';

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authClose = document.getElementById('authClose');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const submitLogin = document.getElementById('submitLogin');
const submitRegister = document.getElementById('submitRegister');
const authMessage = document.getElementById('authMessage');

loginBtn.addEventListener('click', () => showModal(true));
registerBtn.addEventListener('click', () => showModal(false));
authClose.addEventListener('click', hideModal);
switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});
switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});
submitLogin.addEventListener('click', handleLogin);
submitRegister.addEventListener('click', handleRegister);
logoutBtn.addEventListener('click', handleLogout);

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupAuthStateListener();
});

function showModal(isLogin) {
    authModal.style.display = 'block';
    authMessage.textContent = '';
    if (isLogin) {
        showLoginForm();
    } else {
        showRegisterForm();
    }
}

function hideModal() {
    authModal.style.display = 'none';
    clearForms();
}

function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function clearForms() {
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
}

async function handleLogin() {
    const email = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Omple tots els camps');
        return;
    }

    showMessage('Autenticant...', 'loading');
    submitLogin.disabled = true;

    const result = await signIn(email, password);

    if (result.success) {
        showMessage('Autenticació exitosa!', 'success');
        setTimeout(() => {
            updateUIForLoggedInUser();
            hideModal();
        }, 500);
    } else {
        showMessage(`Error: ${result.error}`);
    }

    submitLogin.disabled = false;
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !email || !password) {
        showMessage('Omple tots els camps');
        return;
    }

    showMessage('Registrant...', 'loading');
    submitRegister.disabled = true;

    const result = await signUp(email, password, username);

    if (result.success) {
        showMessage('Usuari registrat correctament. Comprova el teu correu per confirmar.', 'success');
        setTimeout(() => {
            showLoginForm();
        }, 2000);
    } else {
        showMessage(`Error: ${result.error}`);
    }

    submitRegister.disabled = false;
}

async function handleLogout() {
    logoutBtn.disabled = true;
    const result = await signOut();
    
    if (result.success) {
        updateUIForLoggedOutUser();
    } else {
        showMessage(`Error al tancar sessió: ${result.error}`);
    }
    
    logoutBtn.disabled = false;
}

function checkAuthStatus() {
    if (isAuthenticated()) {
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    
    const username = localStorage.getItem('username');
    if (username) {
        console.log('Usuario conectado:', username);
    }
}

function updateUIForLoggedOutUser() {
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
}

function showMessage(message, type = 'error') {
    authMessage.textContent = message;
    authMessage.className = type;
}

window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        hideModal();
    }
});

function setupAuthStateListener() {
    onAuthStateChanged((session) => {
        if (session) {
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    });
}