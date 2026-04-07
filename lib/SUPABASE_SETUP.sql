-- ============================================
-- SCRIPTS SQL PARA SUPABASE
-- ============================================
-- 
-- Ejecuta estos comandos en:
-- Supabase Dashboard → SQL Editor → New Query
--
-- ============================================

-- ============================================
-- 1. CREAR TABLA: comments
-- ============================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  comment TEXT NOT NULL,
  username TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS comments_city_idx ON public.comments(city);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

-- ============================================
-- 2. CREAR TABLA: saved_locations
-- ============================================

CREATE TABLE IF NOT EXISTS public.saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS saved_locations_user_id_idx ON public.saved_locations(user_id);
CREATE INDEX IF NOT EXISTS saved_locations_city_idx ON public.saved_locations(city);

-- ============================================
-- 3. CREAR TABLA: users (Opcional)
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por username
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);

-- ============================================
-- 4. HABILITAR Row Level Security (RLS)
-- ============================================

-- Comentarios
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES PARA LA TABLA: comments
-- ============================================

-- Policy 1: Cualquiera puede leer comentarios
CREATE POLICY "Anyone can read comments"
  ON public.comments
  FOR SELECT
  USING (true);

-- Policy 2: Usuarios autenticados pueden crear sus propios comentarios
CREATE POLICY "Users can create own comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Usuarios solo pueden eliminar sus propios comentarios
CREATE POLICY "Users can delete own comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 4: Usuarios solo pueden actualizar sus propios comentarios
CREATE POLICY "Users can update own comments"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. POLICIES PARA LA TABLA: saved_locations
-- ============================================

-- Policy 1: Usuarios solo pueden ver sus propias ubicaciones guardadas
CREATE POLICY "Users can read own saved locations"
  ON public.saved_locations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Usuarios solo pueden crear sus propias ubicaciones
CREATE POLICY "Users can create own saved locations"
  ON public.saved_locations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Usuarios solo pueden actualizar sus propias ubicaciones
CREATE POLICY "Users can update own saved locations"
  ON public.saved_locations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Usuarios solo pueden eliminar sus propias ubicaciones
CREATE POLICY "Users can delete own saved locations"
  ON public.saved_locations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. POLICIES PARA LA TABLA: users
-- ============================================

-- Policy 1: Cualquiera puede leer perfiles de usuario (datos públicos)
CREATE POLICY "Anyone can read user profiles"
  ON public.users
  FOR SELECT
  USING (true);

-- Policy 2: Usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 8. FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

-- Crear función que actualiza automatically el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para comments
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para saved_locations
CREATE TRIGGER update_saved_locations_updated_at BEFORE UPDATE ON public.saved_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. VERIFICAR QUE TODO ESTÁ CREADO
-- ============================================

-- Ver todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver todas las policies
SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';

-- Ver RLS habilitado
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('comments', 'saved_locations', 'users');

-- ============================================
-- 10. DATOS DE PRUEBA (Opcional)
-- ============================================

-- Nota: Los usuarios se crean a través de auth.signUp() en el frontend
-- No necesitas crear usuarios manualmente via SQL

-- Insertar comentarios de prueba (reemplaza con UUIDs reales)
-- INSERT INTO public.comments (city, comment, user_id, username)
-- VALUES ('Madrid', 'Buen clima hoy', '<USER_ID>', 'usuario1');

-- Insertar ubicaciones guardadas de prueba
-- INSERT INTO public.saved_locations (user_id, city, country, latitude, longitude)
-- VALUES ('<USER_ID>', 'Barcelona', 'Spain', 41.3874, 2.1686);

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. CREAR TABLAS:
   - Copia cada CREATE TABLE y ejecuta en Supabase SQL Editor
   - O ejecuta todo el script de una vez

2. RLS SECURITY:
   - RLS está HABILITADO (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
   - Sin policies definidas, nadie tiene acceso
   - Las policies dan permisos específicos

3. USUARIOS:
   - Los usuarios se crean via auth.signUp() en el frontend
   - Supabase automáticamente crea el registro en auth.users
   - El UUID se obtiene de auth.uid() en las policies

4. ÍNDICES:
   - Mejoran el rendimiento de búsquedas
   - Créalos para columnas que usas en WHERE clauses

5. TRIGGERS:
   - Actualizan automáticamente el campo updated_at
   - Útil para saber cuándo se modificó un registro

6. VERIFICACIÓN:
   - Usa las queries de la sección 9 para verificar que todo está bien
   - Verifica que RLS está enabled
   - Verifica que las policies están creadas

7. PRÓXIMOS PASOS:
   - Crear usuarios desde el frontend (auth.signUp)
   - Los usuarios verán sus propios datos automáticamente
   - Los comentarios son públicos pero users solo ven/modifican los suyos
*/

-- ============================================
-- FIN DE SCRIPTS SQL
-- ============================================
