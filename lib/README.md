# Integración Supabase - J2E Weather App

## 📋 Resumen

Se ha completado la integración de Supabase en la aplicación J2E con:
- ✅ Cliente de Supabase configurado
- ✅ Servicios de autenticación
- ✅ Servicios de base de datos
- ✅ Protección de rutas
- ✅ Sistema de autenticación integrado en UI

---

## 📁 Estructura de Archivos

```
lib/
├── supabaseClient.js      # Cliente base de Supabase
├── authService.js         # Funciones de autenticación
├── databaseService.js     # Funciones de base de datos
├── routeProtection.js     # Protección de rutas
├── EJEMPLOS.js           # Ejemplos de uso
└── README.md            # Este archivo

javascript/
├── auth.js              # Lógica de autenticación de UI
└── script.js           # Scripts principales (weather)
```

---

## 🔐 Configuración

### Variables de Entorno

El archivo `.env` ya está configurado con:
```
VITE_SUPABASE_URL=https://lpqicpquvwcodfjqquerd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧬 Servicios Disponibles

### 1. **authService.js** - Autenticación

```javascript
import { 
  signUp, signIn, signOut, 
  getCurrentUser, getSession, 
  isAuthenticated, onAuthStateChanged 
} from './lib/authService.js';

// Registrar usuario
const result = await signUp(email, password, username);

// Iniciar sesión
const result = await signIn(email, password);

// Cerrar sesión
const result = await signOut();

// Verificar si está autenticado
const isAuth = isAuthenticated();

// Escuchar cambios de sesión
const unsubscribe = onAuthStateChanged((session) => { });
```

### 2. **databaseService.js** - Base de Datos

```javascript
import {
  getComments, addComment, deleteComment,
  getSavedLocations, saveLocation, deleteLocation,
  getUserProfile, updateUserProfile
} from './lib/databaseService.js';

// Comentarios
await getComments(city);
await addComment(city, comment, userId);
await deleteComment(commentId);

// Ubicaciones guardadas
await getSavedLocations(userId);
await saveLocation(userId, city, country, lat, lng);
await deleteLocation(locationId);

// Perfil de usuario
await getUserProfile(userId);
await updateUserProfile(userId, updates);
```

### 3. **routeProtection.js** - Protección

```javascript
import {
  requireAuth, checkAuth, 
  setupAuthStateListener, redirectAfterAuth
} from './lib/routeProtection.js';

// Requerir autenticación (redirige si no está autenticado)
const isAuth = await requireAuth();

// Verificar sin redirigir
const isAuth = await checkAuth();

// Monitorear cambios
setupAuthStateListener({
  onSignIn: () => { },
  onSignOut: () => { }
});
```

---

## 🗄️ Tablas Necesarias en Supabase

### Tabla: `comments`
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  comment TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `saved_locations`
```sql
CREATE TABLE saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  city TEXT NOT NULL,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `users` (Opcional)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Seguridad - Row Level Security (RLS)

### Policy para `comments`
```sql
-- Leer comentarios de cualquier ciudad
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

-- Usuario solo puede crear sus propios comentarios
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuario solo puede eliminar sus propios comentarios
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

### Policy para `saved_locations`
```sql
-- Usuario solo ve sus ubicaciones
CREATE POLICY "Users can view own locations"
  ON saved_locations FOR SELECT
  USING (auth.uid() = user_id);

-- Usuario solo puede insertar sus ubicaciones
CREATE POLICY "Users can insert own locations"
  ON saved_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuario solo puede eliminar sus ubicaciones
CREATE POLICY "Users can delete own locations"
  ON saved_locations FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 💡 Ejemplos de Uso

Para ejemplos completos, ver [lib/EJEMPLOS.js](lib/EJEMPLOS.js)

### Ejemplo Rápido: Agregar Comentario

```javascript
import { addComment } from './lib/databaseService.js';

async function handleAddComment() {
  const userId = localStorage.getItem('userId');
  const city = 'Madrid';
  const comment = 'Buen clima hoy';

  const result = await addComment(city, comment, userId);

  if (result.success) {
    console.log('Comentario agregado:', result.data);
    // Actualizar UI
  } else {
    console.error('Error:', result.error);
  }
}
```

---

## 🔄 Flujo de Autenticación

1. **Usuario hace clic en "Iniciar Sesión"**
   ↓
2. **Modal de auth se abre**
   ↓
3. **Usuario ingresa email y contraseña**
   ↓
4. **`handleLogin()` llama `signIn()`**
   ↓
5. **Supabase autentica al usuario**
   ↓
6. **Token se guarda en localStorage**
   ↓
7. **`onAuthStateChanged()` se ejecuta**
   ↓
8. **UI se actualiza (botones de Login/Logout)**
   ↓
9. **Modal se cierra**

---

## 🛠️ Integración en Componentes Existentes

### En `javascript/script.js` (Weather App)

```javascript
import { isAuthenticated } from '../lib/authService.js';
import { getComments, addComment } from '../lib/databaseService.js';

// Cargar comentarios de una ciudad
async function loadCityComments(city) {
  if (!isAuthenticated()) {
    console.log('Inicia sesión para ver comentarios');
    return;
  }

  const result = await getComments(city);
  if (result.success) {
    // Renderizar comentarios en el HTML
    result.data.forEach(comment => {
      console.log(`${comment.username}: ${comment.comment}`);
    });
  }
}
```

### En `html/map.html` (Si existe página de mapa)

```html
<script type="module">
  import { requireAuth } from '../lib/routeProtection.js';
  import { getSavedLocations } from '../lib/databaseService.js';

  // Verificar autenticación antes de cargar la página
  const isAuth = await requireAuth();
  if (isAuth) {
    const userId = localStorage.getItem('userId');
    const result = await getSavedLocations(userId);
    // Cargar ubicaciones en el mapa
  }
</script>
```

---

## ✅ Checklist de Implementación

- [x] Cliente Supabase configurado
- [x] Variables de entorno .env
- [x] Servicios de autenticación
- [x] Servicios de base de datos
- [x] Protección de rutas
- [x] Integración en auth.js
- [x] HTML actualizado para módulos ES6
- [ ] Crear tablas en Supabase
- [ ] Configurar RLS en Supabase
- [ ] Integrar comentarios en weather cards
- [ ] Integrar ubicaciones guardadas
- [ ] Integrar perfil de usuario

---

## 📞 Soporte

Para problemas, verifica:

1. ✅ Variables de entorno están configuradas
2. ✅ Supabase está en línea
3. ✅ Tablas existen en la base de datos
4. ✅ RLS está correctamente configurado
5. ✅ Navegador permite localStorage
6. ✅ Consola del navegador para errores

---

## 📚 Documentación Oficial

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Auth en Supabase](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Próximos Pasos

1. **Crear tablas en Supabase** (SQL en dashboard)
2. **Habilitar RLS** en las tablas
3. **Agregar políticas de seguridad**
4. **Integrar comentarios en weather app**
5. **Integrar ubicaciones guardadas**
6. **Crear página de perfil**
7. **Agregar validaciones de email**
8. **Implementar recuperación de contraseña**

---

**Última actualización:** 7 de abril de 2026
