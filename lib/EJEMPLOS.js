/**
 * EJEMPLOS DE USO DE LOS SERVICIOS SUPABASE
 * 
 * Este archivo muestra cómo usar los servicios de autenticación y base de datos
 * creados en lib/authService.js y lib/databaseService.js
 */

// ============================================
// AUTENTICACIÓN
// ============================================

import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  getSession, 
  isAuthenticated,
  onAuthStateChanged 
} from '../lib/authService.js';

import {
  getComments,
  addComment,
  deleteComment,
  getSavedLocations,
  saveLocation,
  deleteLocation,
  getUserProfile,
  updateUserProfile
} from '../lib/databaseService.js';

import {
  requireAuth,
  checkAuth,
  setupAuthStateListener
} from '../lib/routeProtection.js';

// ============================================
// EJEMPLO 1: REGISTRAR USUARIO
// ============================================

async function registerExample() {
  const result = await signUp(
    'usuario@example.com',
    'password123',
    'miUsuario'
  );

  if (result.success) {
    console.log('Usuario registrado:', result.user);
  } else {
    console.error('Error al registrar:', result.error);
  }
}

// ============================================
// EJEMPLO 2: INICIAR SESIÓN
// ============================================

async function loginExample() {
  const result = await signIn(
    'usuario@example.com',
    'password123'
  );

  if (result.success) {
    console.log('Usuario autenticado:', result.user);
    console.log('Sesión:', result.session);
  } else {
    console.error('Error al iniciar sesión:', result.error);
  }
}

// ============================================
// EJEMPLO 3: CERRAR SESIÓN
// ============================================

async function logoutExample() {
  const result = await signOut();
  
  if (result.success) {
    console.log('Sesión cerrada');
  } else {
    console.error('Error al cerrar sesión:', result.error);
  }
}

// ============================================
// EJEMPLO 4: VERIFICAR AUTENTICACIÓN
// ============================================

async function checkAuthExample() {
  // Método 1: Verificación rápida (sin API call)
  const isAuth = isAuthenticated();
  console.log('¿Usuario autenticado?', isAuth);

  // Método 2: Verificación desde servidor
  const { success, session } = await getSession();
  if (success && session) {
    console.log('Sesión válida:', session.user);
  }
}

// ============================================
// EJEMPLO 5: OBTENER USUARIO ACTUAL
// ============================================

async function getCurrentUserExample() {
  const { success, user } = await getCurrentUser();
  
  if (success) {
    console.log('Usuario actual:', user.email);
  }
}

// ============================================
// EJEMPLO 6: AGREGAR COMENTARIO
// ============================================

async function addCommentExample() {
  const userId = localStorage.getItem('userId');
  
  const result = await addComment(
    'Madrid',
    'Buen clima hoy',
    userId
  );

  if (result.success) {
    console.log('Comentario agregado:', result.data);
  } else {
    console.error('Error al agregar comentario:', result.error);
  }
}

// ============================================
// EJEMPLO 7: OBTENER COMENTARIOS
// ============================================

async function getCommentsExample() {
  const result = await getComments('Madrid');

  if (result.success) {
    console.log('Comentarios:', result.data);
    // Renderizar comentarios en la UI
    result.data.forEach(comment => {
      console.log(`${comment.username}: ${comment.comment}`);
    });
  } else {
    console.error('Error al obtener comentarios:', result.error);
  }
}

// ============================================
// EJEMPLO 8: GUARDAR UBICACIÓN
// ============================================

async function saveLocationExample() {
  const userId = localStorage.getItem('userId');

  const result = await saveLocation(
    userId,
    'Barcelona',
    'Spain',
    41.3874,
    2.1686
  );

  if (result.success) {
    console.log('Ubicación guardada:', result.data);
  } else {
    console.error('Error al guardar ubicación:', result.error);
  }
}

// ============================================
// EJEMPLO 9: OBTENER UBICACIONES GUARDADAS
// ============================================

async function getSavedLocationsExample() {
  const userId = localStorage.getItem('userId');
  
  const result = await getSavedLocations(userId);

  if (result.success) {
    console.log('Ubicaciones guardadas:', result.data);
  } else {
    console.error('Error al obtener ubicaciones:', result.error);
  }
}

// ============================================
// EJEMPLO 10: PROTEGER RUTAS
// ============================================

// En una página que requiere autenticación:
async function protectedPageExample() {
  const isAuth = await requireAuth();
  
  if (!isAuth) {
    // El usuario no está autenticado y será redirigido
    return;
  }

  // Código de la página protegida aquí
  console.log('Esta es una página protegida');
}

// ============================================
// EJEMPLO 11: MONITOREAR CAMBIOS DE AUTH
// ============================================

function setupAuthListenerExample() {
  setupAuthStateListener({
    onSignIn: () => {
      console.log('Usuario iniciado sesión');
      // Actualizar UI, cargar datos del usuario, etc.
    },
    onSignOut: () => {
      console.log('Usuario cerró sesión');
      // Actualizar UI, limpiar datos, etc.
    }
  });
}

// ============================================
// EJEMPLO 12: ESCUCHAR CAMBIOS EN TIEMPO REAL
// ============================================

function setupRealtimeListenerExample() {
  const unsubscribe = onAuthStateChanged((session) => {
    if (session) {
      console.log('Usuario autenticado:', session.user.email);
    } else {
      console.log('Sesión cerrada');
    }
  });

  // Llamar unsubscribe() cuando quieras dejar de escuchar
}

// ============================================
// ESTRUCTURA DE DATOS ESPERADA EN SUPABASE
// ============================================

/*
TABLA: auth.users (Gestionada por Supabase)
- id (UUID)
- email (text)
- password (hashed)
- user_metadata (JSON) - Contiene: { username }

TABLA: public.comments
- id (UUID)
- city (text)
- comment (text)
- user_id (UUID) - FK a auth.users
- created_at (timestamp)

TABLA: public.saved_locations
- id (UUID)
- user_id (UUID) - FK a auth.users
- city (text)
- country (text)
- latitude (numeric)
- longitude (numeric)
- created_at (timestamp)

TABLA: public.users (Opcional, para datos adicionales)
- id (UUID) - FK a auth.users
- username (text)
- avatar_url (text)
- bio (text)
- created_at (timestamp)
*/

// ============================================
// NOTAS IMPORTANTES
// ============================================

/*
1. Variables de entorno (.env):
   - VITE_SUPABASE_URL=tu_url
   - VITE_SUPABASE_ANON_KEY=tu_anon_key

2. Autenticación:
   - Los tokens se guardan en localStorage
   - Los servicios verifican automáticamente la sesión
   - onAuthStateChanged() se ejecuta cuando hay cambios

3. Seguridad:
   - Usa Row Level Security (RLS) en Supabase
   - Las claves anon solo permiten acceso a datos públicos
   - Los usuarios solo pueden ver/modificar sus propios datos

4. Error Handling:
   - Todos los servicios retornan { success, data/error }
   - Siempre verifica success antes de usar data
   - Mostrarpuede mensajes de error al usuario de forma clara
*/

export {
  registerExample,
  loginExample,
  logoutExample,
  checkAuthExample,
  getCurrentUserExample,
  addCommentExample,
  getCommentsExample,
  saveLocationExample,
  getSavedLocationsExample,
  protectedPageExample,
  setupAuthListenerExample,
  setupRealtimeListenerExample
};
