# 🏗️ ARQUITECTURA - J2E SUPABASE INTEGRATION

```
┌─────────────────────────────────────────────────────────────────┐
│                   🌐 NAVEGADOR DEL USUARIO                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │  index.html      │        │  javascript/     │               │
│  │                  │────────│  - auth.js       │               │
│  │  - HTML          │        │  - script.js     │               │
│  │  - CSS           │        │  - map.js        │               │
│  │  - Modales       │        └──────────────────┘               │
│  └──────────────────┘                 │                          │
│                                       │                          │
│                                       ▼                          │
│         ┌─────────────────────────────────────────┐             │
│         │    📦 lib/ - Servicios Supabase          │             │
│         ├─────────────────────────────────────────┤             │
│         │                                          │             │
│         │  ┌──────────────────────────────┐       │             │
│         │  │ supabaseClient.js            │       │             │
│         │  │ - Cliente base               │       │             │
│         │  │ - Inicialización             │       │             │
│         │  └──────────────────────────────┘       │             │
│         │           ▲                              │             │
│         │           │                              │             │
│         │  ┌────────┴──────────┐                  │             │
│         │  │                   │                  │             │
│         │  ▼                   ▼                  │             │
│         │  ┌──────────┐  ┌──────────────┐        │             │
│         │  │authService   databaseService│        │             │
│         │  │─────────────────────────────        │             │
│         │  │- signUp()    - getComments()│        │             │
│         │  │- signIn()    - addComment()│        │             │
│         │  │- signOut()   - saveLocation │        │             │
│         │  │- getSession() - getLocations        │             │
│         │  │- isAuth()   - getUserProfile│       │             │
│         │  └──────────┬────────────┬─────┘       │             │
│         │             │            │             │             │
│         │  ┌──────────┴──┐  ┌──────┴─────┐     │             │
│         │  │              │  │             │     │             │
│         │  ▼              ▼  ▼             ▼     │             │
│         │  ┌────────────────────────────────┐   │             │
│         │  │ routeProtection.js             │   │             │
│         │  │ - requireAuth()                │   │             │
│         │  │ - checkAuth()                  │   │             │
│         │  │ - setupAuthStateListener()     │   │             │
│         │  │ - redirectAfterAuth()          │   │             │
│         │  └────────────────────────────────┘   │             │
│         │                                        │             │
│         └─────────────────────────────────────────┘             │
│                                                                   │
│  ┌──────────────────────────────────────────────┐               │
│  │ 💾 localStorage                               │               │
│  │ - authToken (JWT)                            │               │
│  │ - userId (UUID)                              │               │
│  │ - userEmail (string)                         │               │
│  │ - username (string)                          │               │
│  └──────────────────────────────────────────────┘               │
│                                                                   │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        │ HTTP (HTTPS)
                        │
        ┌───────────────▼──────────────┐
        │   🔐 SUPABASE BACKEND        │
        ├────────────────────────────┐
        │                            │
        │ ┌──────────────────────┐  │
        │ │ Auth Service         │  │
        │ │ - JWT Tokens         │  │
        │ │ - User Management    │  │
        │ │ - Session Control    │  │
        │ └──────────────────────┘  │
        │                            │
        │ ┌──────────────────────┐  │
        │ │ PostgreSQL Database  │  │
        │ │                      │  │
        │ │ ┌────────────────┐   │  │
        │ │ │ users          │   │  │
        │ │ │ (auth)         │   │  │
        │ │ └────────────────┘   │  │
        │ │                      │  │
        │ │ ┌────────────────┐   │  │
        │ │ │ comments       │   │  │
        │ │ │ - Públicos     │   │  │
        │ │ │ - RLS          │   │  │
        │ │ └────────────────┘   │  │
        │ │                      │  │
        │ │ ┌────────────────┐   │  │
        │ │ │saved_locations │   │  │
        │ │ │ - Privados     │   │  │
        │ │ │ - RLS          │   │  │
        │ │ └────────────────┘   │  │
        │ │                      │  │
        │ │ ┌────────────────┐   │  │
        │ │ │ users (profile)│   │  │
        │ │ │ - Públicos     │   │  │
        │ │ │ - RLS          │   │  │
        │ │ └────────────────┘   │  │
        │ │                      │  │
        │ └──────────────────────┘  │
        │                            │
        │ ┌──────────────────────┐  │
        │ │ Row Level Security   │  │
        │ │ (RLS) Policies       │  │
        │ │                      │  │
        │ │ comments:            │  │
        │ │ - SELECT: Público    │  │
        │ │ - INSERT: Usuario    │  │
        │ │ - DELETE: Propietario│  │
        │ │                      │  │
        │ │ saved_locations:     │  │
        │ │ - SELECT: Propietario│  │
        │ │ - INSERT: Usuario    │  │
        │ │ - DELETE: Propietario│  │
        │ │                      │  │
        │ └──────────────────────┘  │
        │                            │
        └────────────────────────────┘
```

---

## 🔄 Flujo de Autenticación

```
Usuario abre app
    │
    ▼
┌─────────────────────────┐
│ Cargar página           │
│ → checkAuthStatus()     │
└────────┬────────────────┘
         │
         ▼
    ¿Token en       
    localStorage?  
         │
    ┌────┴──────┐
    NO         YES
    │           │
    ▼           ▼
[Botones]   [Obtener datos
 Login      del usuario]
 Registrar      │
    │           ▼
    │      ┌───────────────┐
    │      │ UI Lista      │
    │      │ - Logout      │
    │      │ - Datos User  │
    │      └───────────────┘
    │
    ▼
Usuario Registra/Login
    │
    ▼
┌──────────────────────────┐
│ signUp() o signIn()      │
│ → Supabase Auth          │
└────────┬─────────────────┘
         │
    ┌────┴──────┐
    ÉXITO      ERROR
    │           │
    ▼           ▼
Guardar     Mostrar
Token      Error
    │
    ▼
┌──────────────────────┐
│ onAuthStateChanged   │
│ → Actualizar UI      │
└──────────────────────┘
```

---

## 📊 Flujo de Datos

```
┌──────────────────┐
│ Usuario interacta│
│ con la app       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ JavaScript llama     │
│ a un servicio        │
│ (authService, etc)   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ El servicio prepara  │
│ la request           │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ supabaseClient.js    │
│ envía la request     │
│ a Supabase           │
└────────┬─────────────┘
         │
         ▼
  🌐 INTERNET 🌐
         │
         ▼
┌──────────────────────┐
│ Supabase procesa     │
│ - Valida token JWT   │
│ - Verifica RLS       │
│ - Accede a DB        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Retorna respuesta    │
│ { data } o { error } │
└────────┬─────────────┘
         │
         ▼
  🌐 INTERNET 🌐
         │
         ▼
┌──────────────────────┐
│ El servicio procesa  │
│ la respuesta         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Retorna resultado    │
│ { success, data }    │
│ o { success, error } │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ JavaScript maneja    │
│ el resultado         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Actualiza el DOM     │
│ o muestra error      │
└──────────────────────┘
```

---

## 🔐 Flujo de Seguridad - RLS

```
Usuario pide datos
    │
    ▼
┌──────────────────────┐
│ Petición a Supabase  │
│ + headers JWT        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Supabase lee JWT     │
│ Extrae: user_id      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Evalúa RLS Policies  │
│                      │
│ ¿Puede el usuario    │
│ acceder a estos      │
│ datos?               │
└────────┬─────────────┘
         │
    ┌────┴──────────┐
    SÍ              NO
    │               │
    ▼               ▼
[Retorna    [Retorna
 datos]      error 403]
    │               │
    └────┬──────────┘
         │
         ▼
    Usuario recibe
    respuesta
```

---

## 🎯 Estructura de Servicios

```
authService.js
├── signUp(email, password, username)        → bool
├── signIn(email, password)                  → { user, session }
├── signOut()                                → bool
├── getCurrentUser()                         → { user }
├── getSession()                             → { session }
├── isAuthenticated()                        → bool
└── onAuthStateChanged(callback)             → unsubscribe fn

databaseService.js
├── getComments(city)                        → { data }
├── addComment(city, comment, userId)        → { data }
├── deleteComment(commentId)                 → bool
├── getSavedLocations(userId)                → { data }
├── saveLocation(userId, city, ...)          → { data }
├── deleteLocation(locationId)               → bool
├── getUserProfile(userId)                   → { data }
└── updateUserProfile(userId, updates)       → { data }

routeProtection.js
├── requireAuth()                            → bool
├── checkAuth()                              → bool
├── setupAuthStateListener(callbacks)        → void
└── redirectAfterAuth(defaultPath)           → void
```

---

## 📦 Dependencias del Proyecto

```
j2e/
├── package.json
│   └── dependencies:
│       └── @supabase/supabase-js: ^2.102.0
│
├── .env
│   ├── VITE_SUPABASE_URL
│   └── VITE_SUPABASE_ANON_KEY
│
├── index.html
│   └── scripts:
│       ├── script.js (módulo)
│       ├── auth.js (módulo)
│       └── QUICKSTART.js (módulo)
│
├── lib/ (nuevo)
│   ├── supabaseClient.js
│   ├── authService.js
│   ├── databaseService.js
│   ├── routeProtection.js
│   ├── QUICKSTART.js
│   ├── EJEMPLOS.js
│   ├── README.md
│   ├── SUPABASE_SETUP.sql
│   ├── CHECKLIST.md
│   ├── RESUMEN.md
│   └── INDEX.md
│
└── javascript/
    ├── auth.js (modificado)
    ├── script.js
    └── map.js
```

---

## 🔗 Integraciones Externas

```
┌─────────────────────────────────────────────────────┐
│ SERVICIOS EXTERNOS                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. SUPABASE (Cloud Backend)                         │
│    - Authentication (Email/Password)                │
│    - PostgreSQL Database                            │
│    - Row Level Security (RLS)                       │
│    - Real-time Listeners (opcional)                 │
│                                                     │
│ 2. OpenWeatherMap API (Existente)                   │
│    - Datos del clima                                │
│    - Pronósticos                                    │
│    - Geolocalización                                │
│                                                     │
│ 3. Google Fonts (Existente)                         │
│    - Fuentes tipográficas                           │
│                                                     │
│ 4. Font Awesome (Existente)                         │
│    - Iconos                                         │
│                                                     │
│ 5. Globe.gl (Existente)                             │
│    - Visualización globe 3D                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 Patrones de Diseño Utilizados

```
1. SERVICE PATTERN
   ├─ authService.js
   ├─ databaseService.js
   └─ routeProtection.js

2. REPOSITORY PATTERN
   └─ databaseService.js (acceso a datos)

3. ERROR HANDLING
   └─ { success, data/error } en todas partes

4. MODULAR ARCHITECTURE
   └─ Código separado por responsabilidad

5. ASYNC/AWAIT
   └─ Manejo de promesas moderno

6. ROW LEVEL SECURITY
   └─ Seguridad en base de datos
```

---

## 🚀 Performance Optimization

```
1. LazyLoading
   └─ Servicios cargados bajo demanda

2. localStorage
   └─ Evita requests innecesarias

3. Connection Pooling
   └─ Supabase maneja internamente

4. Índices en BD
   └─ Queries más rápidas (SUPABASE_SETUP.sql)

5. JWT Tokens
   └─ Sin necesidad de sesiones en servidor
```

---

**Última actualización:** 7 de Abril de 2026
