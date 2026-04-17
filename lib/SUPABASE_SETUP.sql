-- Tabla de comentarios compartidos (global, sin requerir autenticación)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL DEFAULT 'Usuari anònim',
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer comentarios
CREATE POLICY "Allow public read comments" ON public.comments
FOR SELECT USING (true);

-- Política: Cualquiera puede insertar comentarios
CREATE POLICY "Allow public insert comments" ON public.comments
FOR INSERT WITH CHECK (true);

-- Política: Cualquiera puede eliminar su propio comentario (por nombre de usuario)
CREATE POLICY "Allow users delete own comments" ON public.comments
FOR DELETE USING (username = CURRENT_USER OR username LIKE '%Usuari anònim%');

/* Permitir leer datos de auth.users para los joins */
CREATE POLICY "Allow read auth.users" ON auth.users
FOR SELECT USING (true);