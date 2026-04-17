import { signIn, signUp, signOut, onAuthStateChanged, isAuthenticated } from '../lib/authService.js';
import { toggleCommentsSection } from './comments.js';

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authClose = document.querySelector('.auth-close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const submitLogin = document.getElementById('loginSubmit');
const submitRegister = document.getElementById('registerSubmit');

loginBtn.addEventListener('click', () => showModal(true));
registerBtn.addEventListener('click', () => showModal(false));
authClose.addEventListener('click', hideModal);
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showRegisterForm();
});
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showLoginForm();
});
submitLogin.addEventListener('click', handleLogin);
submitRegister.addEventListener('click', handleRegister);
logoutBtn.addEventListener('click', handleLogout);

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupAuthStateListener();
    
    // Also re-setup event listeners on DOM ready to ensure they're attached
    const loginBtnCheck = document.getElementById('loginBtn');
    const registerBtnCheck = document.getElementById('registerBtn');
    if (loginBtnCheck) loginBtnCheck.addEventListener('click', () => showModal(true));
    if (registerBtnCheck) registerBtnCheck.addEventListener('click', () => showModal(false));
});

function showModal(isLogin) {
    authModal.classList.add('active');
    
    // Clear messages from both forms
    const loginMsg = loginForm.querySelector('.auth-message');
    const registerMsg = registerForm.querySelector('.auth-message');
    if (loginMsg) loginMsg.textContent = '';
    if (registerMsg) registerMsg.textContent = '';
    
    // Clear input fields
    clearForms();
    
    // Ensure correct form is displayed
    if (isLogin) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function hideModal() {
    authModal.classList.remove('active');
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
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
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
    
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.style.display = 'block';
        const userName = document.getElementById('userName');
        const username = localStorage.getItem('username');
        if (userName && username) {
            userName.textContent = username;
        }
    }
    
    const username = localStorage.getItem('username');
    if (username) {
        console.log('Usuario conectado:', username);
    }
    
    // Show comments section
    toggleCommentsSection(true);
}

function updateUIForLoggedOutUser() {
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    
    const userMenu = document.getElementById('userMenu');
    
    // Hide comments section
    toggleCommentsSection(false);
    if (userMenu) {
        userMenu.style.display = 'none';
    }
}

function showMessage(message, type = 'error') {
    const authMessage = getAuthMessage();
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = 'auth-message ' + type;
        authMessage.style.display = 'block';
    }
}

function getAuthMessage() {
    const loginVisible = loginForm.style.display !== 'none';
    return loginVisible 
        ? loginForm.querySelector('.auth-message')
        : registerForm.querySelector('.auth-message');
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