# 📋 CHECKLIST DE IMPLEMENTACIÓN - SUPABASE

## Fase 1: Configuración Inicial ✅

- [x] Cliente Supabase creado (`lib/supabaseClient.js`)
- [x] Variables de entorno configuradas (`.env`)
- [x] Servicios de autenticación creados (`lib/authService.js`)
- [x] Servicios de base de datos creados (`lib/databaseService.js`)
- [x] Protección de rutas implementada (`lib/routeProtection.js`)
- [x] Integración en `javascript/auth.js`
- [x] HTML actualizado con módulos ES6

---

## Fase 2: Configuración en Supabase ⏳

### Paso 1: Crear Tablas
- [ ] Acceder a [Supabase Dashboard](https://app.supabase.com)
- [ ] Proyecto: `lpqicpquvwcodfjqquerd`
- [ ] Ir a: SQL Editor → New Query
- [ ] Copiar contenido de `lib/SUPABASE_SETUP.sql`
- [ ] Ejecutar script (Ctrl+Enter)
- [ ] Verificar que se crearon las tablas:
  - [ ] `comments`
  - [ ] `saved_locations`
  - [ ] `users` (opcional)

### Paso 2: Verificar RLS
- [ ] Ir a: Authentication → Policies
- [ ] Verificar que existen policies para:
  - [ ] `comments` (SELECT, INSERT, UPDATE, DELETE)
  - [ ] `saved_locations` (SELECT, INSERT, UPDATE, DELETE)
  - [ ] `users` (SELECT, UPDATE)

### Paso 3: Habilitar Autenticación
- [ ] Ir a: Authentication → Providers
- [ ] Verificar que "Email" está habilitado ✅
- [ ] (Opcional) Habilitar: Google, GitHub, etc.

### Paso 4: Configurar CORS
- [ ] Ir a: Project Settings → API
- [ ] En "CORS allowed origins", agregar:
  ```
  http://localhost:3000
  http://localhost:5173
  https://tu-dominio.com
  ```

---

## Fase 3: Desarrollo Frontend 🚀

### Pruebas de Autenticación
- [ ] Abrir aplicación en navegador
- [ ] Hacer clic en "Registrar-se"
- [ ] Llenar formulario con:
  - Email: `test@example.com`
  - Usuario: `testuser`
  - Contraseña: `Test123!`
- [ ] Verificar en Supabase > Auth > Users que se creó el usuario
- [ ] Hacer clic en "Iniciar Sessió" con las credenciales
- [ ] Verificar que se muestra "Tancar Sessió" (logout)
- [ ] Verificar en localStorage:
  ```javascript
  // En consola del navegador:
  localStorage.getItem('authToken') // debe retornar token
  localStorage.getItem('userId') // debe retornar UUID
  ```

### Pruebas de Comentarios
- [ ] Con usuario autenticado, abrir en consola:
  ```javascript
  import { addComment } from './lib/databaseService.js';
  const userId = localStorage.getItem('userId');
  const result = await addComment('Madrid', 'Prueba comentario', userId);
  console.log(result);
  ```
- [ ] Verificar que retorna `{ success: true, data: {...} }`
- [ ] Ver comentario en Supabase > Table Editor > comments

### Pruebas de Ubicaciones Guardadas
- [ ] Con usuario autenticado:
  ```javascript
  import { saveLocation } from './lib/databaseService.js';
  const userId = localStorage.getItem('userId');
  const result = await saveLocation(userId, 'Barcelona', 'Spain', 41.3874, 2.1686);
  console.log(result);
  ```
- [ ] Verificar que se guardó en Supabase > Table Editor > saved_locations

---

## Fase 4: Integración en Componentes 🎨

### Integración en Weather App
- [ ] Agregar botón "Guardar ésta ubicación" en weather card
- [ ] Al hacer clic:
  ```javascript
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Inicia sesión primero');
    return;
  }
  const result = await saveLocation(userId, cityName, country, lat, lng);
  if (result.success) {
    alert('¡Ubicación guardada!');
  }
  ```
- [ ] Mostrar ubicaciones guardadas del usuario

### Integración de Comentarios
- [ ] Agregar sección "Comentarios" bajo weather card
- [ ] Botón "Agregar comentario" (solo si está autenticado)
- [ ] Mostrar lista de comentarios de la ciudad
- [ ] Opción para eliminar comentario (si es del usuario)

### Integración de Perfil de Usuario
- [ ] Crear página `/perfil.html`
- [ ] Mostrar:
  - [ ] Email del usuario
  - [ ] Username
  - [ ] Ubicaciones guardadas
  - [ ] Comentarios realizados
- [ ] Usar `requireAuth()` para proteger la página

---

## Fase 5: Pruebas de Seguridad 🔒

### Verificar RLS
- [ ] Intentar acceder a comentarios sin autenticación:
  ```javascript
  // Sin token, debería retornar error
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*');
  ```
- [ ] Intentar acceder a las ubicaciones de otro usuario:
  ```javascript
  // Debería retornar solo sus ubicaciones
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', 'otro-uuid');
  // data debe ser vacío o error
  ```

### Verificar Tokens
- [ ] Verificar que tokens expiran correctamente
- [ ] Verificar que logout limpia localStorage
- [ ] Verificar que login genera nuevo token

---

## Fase 6: Optimización 📈

- [ ] Implementar caché de comentarios
- [ ] Agregar paginación a comentarios
- [ ] Implementar búsqueda de ubicaciones guardadas
- [ ] Agregar validaciones de entrada
- [ ] Implementar loading spinners
- [ ] Agregar manejo de errores más detallados

---

## Fase 7: Producción 🎯

- [ ] Agregar dominios permitidos en CORS
- [ ] Cambiar URLs de API a producción
- [ ] Implementar logging de errores
- [ ] Hacer backup de base de datos
- [ ] Configurar backups automáticos en Supabase
- [ ] Revisar políticas de RLS
- [ ] Hacer pruebas finales

---

## 🆘 Troubleshooting

### Error: "Variables de entorno no encontradas"
- [ ] Verificar que `.env` existe en raíz de `j2e/`
- [ ] Verificar que tiene `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [ ] Reiniciar servidor de desarrollo

### Error: "User already registered"
- [ ] El usuario ya existe en Supabase
- [ ] Probar con otro email o eliminar usuario en dashboard

### Error: "Row level security violation"
- [ ] RLS está habilitado pero policies no están bien
- [ ] Verificar policies en Supabase > Authentication > Policies
- [ ] Verificar que `auth.uid()` retorna UUID correcto

### Los comentarios no se guardan
- [ ] Verificar que tabla `comments` existe
- [ ] Verificar que RLS policies permiten INSERT
- [ ] Verificar en consola si hay errores

### localStorage no persiste
- [ ] Comprobar que navegador permite localStorage
- [ ] Verificar en DevTools > Application > Local Storage
- [ ] Comprobar modo incógnito (no persiste entre sesiones)

---

## 📝 Comandos Útiles para Desarrollo

### Verificar estado en consola del navegador
```javascript
// Ver todas las claves en localStorage
Object.keys(localStorage).forEach(k => console.log(`${k}: ${localStorage.getItem(k)}`));

// Obtener usuario actual
import { getCurrentUser } from './lib/authService.js';
const user = await getCurrentUser();
console.log(user);

// Verficar sesión
import { getSession } from './lib/authService.js';
const session = await getSession();
console.log(session);

// Limpiar localStorage (logout forzado)
localStorage.clear();
location.reload();
```

### Queries útiles en Supabase SQL Editor
```sql
-- Ver todos los usuarios
SELECT id, email, created_at FROM auth.users;

-- Ver todos los comentarios
SELECT * FROM public.comments ORDER BY created_at DESC;

-- Ver comentarios de una ciudad
SELECT * FROM public.comments WHERE city = 'Madrid';

-- Ver ubicaciones de un usuario
SELECT * FROM public.saved_locations WHERE user_id = 'UUID_DEL_USUARIO';

-- Eliminar datos de prueba
DELETE FROM public.comments WHERE user_id = 'UUID_DEL_USUARIO';
DELETE FROM public.saved_locations WHERE user_id = 'UUID_DEL_USUARIO';
```

---

## 📚 Documentación de Referencia

- [Supabase Docs](https://supabase.com/docs)
- [Auth Reference](https://supabase.com/docs/reference/javascript/auth-signup)
- [Database Reference](https://supabase.com/docs/reference/javascript/select)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Deploy Guides](https://supabase.com/docs/guides/deployment)

---

## ✅ Firma de Completaciόn

Nombre: ________________________  Fecha: _______________

Proyecto: J2E Weather App
Versión: 1.0.0
Estado: En Desarrollo 🚀

---

**Última actualización:** 7 de abril de 2026
