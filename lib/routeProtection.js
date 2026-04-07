import { getSession } from './authService.js';

/**
 * Verificar si el usuario está autenticado
 * Si no, redirige a la página de login
 */
export async function requireAuth() {
  const { success, session } = await getSession();

  if (!success || !session) {
    // Guardar la URL actual para redirigir después de login
    sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
    window.location.href = '/';
    return false;
  }

  return true;
}

/**
 * Verificar si el usuario está autenticado
 * Retorna true/false sin redirigir
 */
export async function checkAuth() {
  const { success, session } = await getSession();
  return success && !!session;
}

/**
 * Redirigir después de login
 */
export function redirectAfterAuth(defaultPath = '/') {
  const redirectPath = sessionStorage.getItem('redirectAfterAuth');
  sessionStorage.removeItem('redirectAfterAuth');
  window.location.href = redirectPath || defaultPath;
}

/**
 * Monitorear cambios de autenticación y actualizar UI
 */
export function setupAuthStateListener(callbacks = {}) {
  const {
    onSignIn = () => {},
    onSignOut = () => {},
  } = callbacks;

  // Escuchar cambios en localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'authToken') {
      if (e.newValue) {
        onSignIn();
      } else {
        onSignOut();
      }
    }
  });

  // Verificar estado actual
  const isAuthenticated = !!localStorage.getItem('authToken');
  if (isAuthenticated) {
    onSignIn();
  } else {
    onSignOut();
  }
}
