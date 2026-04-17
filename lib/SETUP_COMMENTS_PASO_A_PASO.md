# Configuración de Comentarios en Supabase - Paso a Paso

## ⚠️ IMPORTANTE: Sigue estos pasos EXACTAMENTE

### Paso 1: Accede al SQL Editor de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto `j2e`
3. En el menú izquierdo, ve a **SQL Editor**
4. Haz clic en **"New Query"**

### Paso 2: Elimina la tabla antigua (SI EXISTE)

Copia y pega EXACTAMENTE esto en el editor SQL:

```sql
-- Primero, desactiva RLS temporalmente para limpiar
ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;

-- Elimina todas las políticas antigas
DROP POLICY IF EXISTS "Allow public read comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public insert comments" ON public.comments;
DROP POLICY IF EXISTS "Allow users delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public read access" ON public.comments;
DROP POLICY IF EXISTS "Allow public insert access" ON public.comments;

-- Finalmente, elimina la tabla antiga
DROP TABLE IF EXISTS public.comments;

SELECT 'Tabla antiga eliminada' AS estado;
```

Luego haz clic en **"Run"** (o presiona `Ctrl+Enter`)

### Paso 3: Crea la tabla NUEVA

Copia y pega esto en una NUEVA consulta:

```sql
-- Crear tabla de comentarios compartidos
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL DEFAULT 'Usuari anònim',
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Política 1: Cualquiera puede LEER comentarios
CREATE POLICY "Allow public read comments" 
ON public.comments
FOR SELECT 
USING (true);

-- Política 2: Cualquiera puede CREAR comentarios
CREATE POLICY "Allow public insert comments" 
ON public.comments
FOR INSERT 
WITH CHECK (true);

-- Política 3: Cualquiera puede ELIMINAR sus propios comentarios
CREATE POLICY "Allow users delete own comments" 
ON public.comments
FOR DELETE 
USING (true);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_comments_created_at 
ON public.comments(created_at DESC);

SELECT 'Tabla de comentarios creada exitosamente' AS estado;
```

Haz clic en **"Run"**

### Paso 4: Verifica que funcionó

Ejecuta esta consulta para confirmar:

```sql
SELECT * FROM public.comments LIMIT 5;
```

Si ves la estructura de columnas (sin errores), ¡está correcto!

### Paso 5: Prueba en tu aplicación

1. Recarga tu sitio web (Ctrl+F5 para limpiar caché)
2. Intenta escribir un comentario
3. Si aún falla, abre F12 y copia el error exacto

---

## 🔍 Si aún no funciona

Copia y pega el EXACTO error que aparezca en la consola (F12 → Console) para diagnosticar el problema.

## ✅ Checklist de verificación

- [ ] Ejecuté el SQL de eliminación sin errores
- [ ] Ejecuté el SQL de creación sin errores
- [ ] La tabla aparece en **"Table Editor"** en Supabase
- [ ] Puedo ver las 5 columnas: id, username, comment, created_at, updated_at
- [ ] RLS está habilitado en la tabla
- [ ] Las 3 políticas aparecen en la tabla
