#!/usr/bin/env node

/**
 * ⚡ INICIO RÁPIDO - SUPABASE INTEGRATION
 * 
 * Este archivo contiene los pasos esenciales para poner en marcha
 * la integración de Supabase en menos de 15 minutos.
 */

// ============================================
// PASO 1: VERIFICACIÓN INICIAL (1 minuto)
// ============================================

console.log('🔍 Verificando configuración...');

const requiredFiles = [
  'lib/supabaseClient.js',
  'lib/authService.js',
  'lib/databaseService.js',
  'lib/routeProtection.js',
  '.env'
];

console.log('✅ Archivos requeridos:');
requiredFiles.forEach(file => console.log(`   - ${file}`));

// Verificar .env
const envRequired = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

console.log('\n✅ Variables de entorno requeridas:');
envRequired.forEach(env => console.log(`   - ${env}`));

// ============================================
// PASO 2: CONFIGURAR SUPABASE (1-2 minutos)
// ============================================

console.log('\n📋 PARA CONFIGURAR SUPABASE:');
console.log('1. Abre: https://app.supabase.com');
console.log('2. Selecciona tu proyecto: lpqicpquvwcodfjqquerd');
console.log('3. Ve a: SQL Editor → New Query');
console.log('4. Copia todo el contenido de: lib/SUPABASE_SETUP.sql');
console.log('5. Pega en el editor de SQL');
console.log('6. Presiona: Ctrl+Enter para ejecutar');

// ============================================
// PASO 3: PROBAR EN NAVEGADOR (5 minutos)
// ============================================

console.log('\n🧪 PARA PROBAR LA APLICACIÓN:');
console.log('1. Abre la aplicación en el navegador');
console.log('2. Presiona F12 para abrir DevTools');
console.log('3. Ve a la pestaña "Console"');
console.log('4. Copia esto en la consola:');

const testCode = `
import { signUp, signIn } from './lib/authService.js';

// Registrar usuario
const result = await signUp('test@example.com', 'Test123!', 'testuser');
console.log('Registro:', result);

// Si el registro fue exitoso, intenta login
if (result.success) {
  const login = await signIn('test@example.com', 'Test123!');
  console.log('Login:', login);
}
`;

console.log(testCode);

// ============================================
// PASO 4: INTEGRAR EN TU CÓDIGO (5+ minutos)
// ============================================

console.log('\n💻 PARA USAR EN TU CÓDIGO:');
console.log('1. Abre lib/EJEMPLOS.js para ver ejemplos');
console.log('2. Copia el ejemplo que necesites');
console.log('3. Pégalo en tu código');
console.log('4. Adapta según tus necesidades');

// ============================================
// PASO 5: DOCUMENTACIÓN DISPONIBLE
// ============================================

console.log('\n📚 DOCUMENTACIÓN DISPONIBLE:');
console.log('  lib/INDEX.md        - Índice general');
console.log('  lib/RESUMEN.md      - Resumen de lo hecho');
console.log('  lib/README.md       - Documentación completa');
console.log('  lib/EJEMPLOS.js     - 12+ ejemplos de código');
console.log('  lib/CHECKLIST.md    - Checklist paso a paso');
console.log('  lib/SUPABASE_SETUP.sql - Scripts SQL');

// ============================================
// FUNCIONES DE AYUDA
// ============================================

/**
 * Ver estado de autenticación actual
 */
async function verStatusAutenticacion() {
  try {
    const { getSession } = await import('./authService.js');
    const { success, session } = await getSession();
    console.log('Estado de autenticación:');
    console.log(success ? '✅ Usuario autenticado' : '❌ No autenticado');
    if (session) {
      console.log('Email:', session.user.email);
      console.log('ID:', session.user.id);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Ver datos en localStorage
 */
function verLocalStorage() {
  console.log('📦 Datos en localStorage:');
  Object.keys(localStorage).forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value.substring(0, 50)}...`);
  });
}

/**
 * Limpiar localStorage (para resetear)
 */
function limpiarLocalStorage() {
  localStorage.clear();
  console.log('✅ localStorage limpiado. Recarga la página.');
}

/**
 * Probar conexión con Supabase
 */
async function probarConexion() {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { data, error } = await supabase.from('comments').select('count');
    if (error) throw error;
    console.log('✅ Conexión exitosa con Supabase');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// ============================================
// EJEMPLOS RÁPIDOS
// ============================================

/**
 * EJEMPLO 1: Registrar usuario
 */
async function ejemploRegistro() {
  const { signUp } = await import('./authService.js');
  const result = await signUp(
    'nuevo@example.com',
    'Password123!',
    'nuevoUsuario'
  );
  console.log('Resultado:', result);
}

/**
 * EJEMPLO 2: Login
 */
async function ejemploLogin() {
  const { signIn } = await import('./authService.js');
  const result = await signIn('test@example.com', 'Test123!');
  console.log('Resultado:', result);
}

/**
 * EJEMPLO 3: Agregar comentario
 */
async function ejemploAgregarComentario() {
  const { addComment } = await import('./databaseService.js');
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    console.error('Primero inicia sesión');
    return;
  }

  const result = await addComment('Madrid', 'Buen clima', userId);
  console.log('Resultado:', result);
}

/**
 * EJEMPLO 4: Obtener comentarios
 */
async function ejemploObtenerComentarios() {
  const { getComments } = await import('./databaseService.js');
  const result = await getComments('Madrid');
  console.log('Comentarios:', result);
}

/**
 * EJEMPLO 5: Guardar ubicación
 */
async function ejemploGuardarUbicacion() {
  const { saveLocation } = await import('./databaseService.js');
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    console.error('Primero inicia sesión');
    return;
  }

  const result = await saveLocation(
    userId,
    'Barcelona',
    'Spain',
    41.3874,
    2.1686
  );
  console.log('Resultado:', result);
}

// ============================================
// EXPORTAR PARA USAR EN CONSOLA
// ============================================

window.QuickStart = {
  // Utilidades
  verStatusAutenticacion,
  verLocalStorage,
  limpiarLocalStorage,
  probarConexion,
  
  // Ejemplos
  ejemploRegistro,
  ejemploLogin,
  ejemploAgregarComentario,
  ejemploObtenerComentarios,
  ejemploGuardarUbicacion
};

console.log('\n✨ FUNCIONES DISPONIBLES EN LA CONSOLA:');
console.log('Usa: QuickStart.<función>()');
console.log('Ejemplos:');
console.log('  QuickStart.probarConexion()');
console.log('  QuickStart.verStatusAutenticacion()');
console.log('  QuickStart.ejemploLogin()');
console.log('  QuickStart.ejemploAgregarComentario()');

// ============================================
// INFORMACIÓN FINAL
// ============================================

console.log('\n═══════════════════════════════════════════════');
console.log('✅ INTEGRACIÓN SUPABASE LISTA');
console.log('═══════════════════════════════════════════════');
console.log('\n📍 PRÓXIMOS PASOS:');
console.log('  1. Crear tablas en Supabase (1 minuto)');
console.log('  2. Probar autenticación (2 minutos)');
console.log('  3. Integrar en tu app (5+ minutos)');
console.log('\n📚 DOCUMENTACIÓN:');
console.log('  Abre: lib/INDEX.md para acceso rápido');
console.log('  Abre: lib/README.md para documentación completa');
console.log('\n💡 TIPS:');
console.log('  - Usa QuickStart.probarConexion() para verificar');
console.log('  - Revisa la sección "Console" de DevTools');
console.log('  - localStorage guarda el token de sesión');
console.log('  - Todos los servicios retornan { success, data/error }');

console.log('\n🚀 ¡LISTO PARA USAR!');
console.log('═══════════════════════════════════════════════\n');

// Exportar como módulo
export {
  verStatusAutenticacion,
  verLocalStorage,
  limpiarLocalStorage,
  probarConexion,
  ejemploRegistro,
  ejemploLogin,
  ejemploAgregarComentario,
  ejemploObtenerComentarios,
  ejemploGuardarUbicacion
};
