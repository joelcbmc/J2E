// Auth Service - Uses global supabase from CDN

/**
 * Wait for supabase to be initialized
 */
async function waitForSupabase() {
  if (window.supabaseClient) {
    return window.supabaseClient;
  }
  
  if (window.supabaseReady) {
    return await window.supabaseReady;
  }
  
  return new Promise((resolve) => {
    function check() {
      if (window.supabaseClient) {
        resolve(window.supabaseClient);
      } else {
        setTimeout(check, 50);
      }
    }
    check();
  });
}

/**
 * Registro de usuario
 */
window.signUp = async function signUp(email, password, username) {
  try {
    const supabase = await waitForSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Login de usuario
 */
window.signIn = async function signIn(email, password) {
  try {
    const supabase = await waitForSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    localStorage.setItem('authToken', data.session.access_token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('username', data.user.user_metadata?.username || data.user.email);

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Logout de usuario
 */
window.signOut = async function signOut() {
  try {
    const supabase = await waitForSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtener usuario actual
 */
window.getCurrentUser = async function getCurrentUser() {
  try {
    const supabase = await waitForSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtener sesión actual
 */
window.getSession = async function getSession() {
  try {
    const supabase = await waitForSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Verificar si el usuario está autenticado
 */
window.isAuthenticated = function isAuthenticated() {
  return !!localStorage.getItem('authToken');
};

/**
 * Escuchar cambios de autenticación
 */
window.onAuthStateChanged = function onAuthStateChanged(callback) {
  function setupListener() {
    if (window.supabaseClient) {
      return window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
          localStorage.setItem('authToken', session.access_token);
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userEmail', session.user.email);
          localStorage.setItem('username', session.user.user_metadata?.username || session.user.email);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('username');
        }
        callback(session);
      });
    } else {
      setTimeout(setupListener, 50);
    }
  }
  return setupListener();
};

// Export functions for ES6 modules
export const signUp = window.signUp;
export const signIn = window.signIn;
export const signOut = window.signOut;
export const getCurrentUser = window.getCurrentUser;
export const getSession = window.getSession;
export const isAuthenticated = window.isAuthenticated;
export const onAuthStateChanged = window.onAuthStateChanged;
