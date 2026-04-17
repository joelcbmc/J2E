# Sistema de Comentarios Compartidos

## Descripción
El sistema de comentarios guarda todos los comentarios en la base de datos Supabase, permitiendo que todos los usuarios vean y compartan los mismos comentarios. **No es necesario estar registrado para comentar**.

## Estructura de la tabla `comments`

```sql
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL DEFAULT 'Usuari anònim',
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Cómo funciona

1. **Crear comentario**: El usuario escribe un comentario y lo publica
   - Se guarda en la tabla `comments` de forma anónima (opcional con nombre de usuario)
   - Se recarga la lista de comentarios desde la BD
   - Todos los usuarios ven el nuevo comentario automáticamente

2. **Ver comentarios**: Al cargar la sección de comentarios
   - Se cargan todos los comentarios de la BD (ordenados por más recientes primero)
   - Se muestran con el nombre de usuario y timestamp

3. **Eliminar comentarios**: El usuario puede eliminar su propio comentario
   - Los comentarios se pueden eliminar si coincide el nombre de usuario
   - Al hacer clic, se elimina de la BD
   - Se recarga la lista para todos los usuarios

## Funciones principales en `comments.js`

- `initComments()` - Inicializa la sección de comentarios
- `loadComments()` - Carga comentarios desde Supabase
- `handleAddComment()` - Maneja la adición de nuevos comentarios
- `deleteComment(id)` - Elimina un comentario por ID
- `saveCommentToDatabase(comment)` - Guarda en Supabase
- `deleteCommentFromDatabase(id)` - Elimina de Supabase

## Permisos en Supabase (RLS - Row Level Security)

Se han configurado tres políticas simples:

1. **Lectura pública**: Cualquiera puede ver los comentarios
```sql
CREATE POLICY "Allow public read comments" ON public.comments
FOR SELECT USING (true);
```

2. **Inserción pública**: Cualquiera puede crear comentarios (anónimo o registrado)
```sql
CREATE POLICY "Allow public insert comments" ON public.comments
FOR INSERT WITH CHECK (true);
```

3. **Eliminación**: Usuarios pueden eliminar comentarios que crearon
```sql
CREATE POLICY "Allow users delete own comments" ON public.comments
FOR DELETE USING (username = CURRENT_USER OR username LIKE '%Usuari anònim%');
```

## Validación

✅ Los comentarios son ahora globales (no locales a cada navegador)
✅ Todos los navegadores ven el mismo contenido
✅ Los comentarios persisten en la base de datos
✅ Funciona sin necesidad de estar registrado (anónimos)
✅ Mejor manejo de errores con logging detallado
✅ Compatible con Supabase RLS
