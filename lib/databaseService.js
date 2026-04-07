import { supabase } from './supabaseClient.js';

/**
 * Obtener comentarios de una ciudad
 */
export async function getComments(city) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('city', city)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Crear un comentario
 */
export async function addComment(city, comment, userId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          city,
          comment,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar un comentario
 */
export async function deleteComment(commentId) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtener ubicaciones guardadas del usuario
 */
export async function getSavedLocations(userId) {
  try {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Guardar una ubicación
 */
export async function saveLocation(userId, city, country, latitude, longitude) {
  try {
    const { data, error } = await supabase
      .from('saved_locations')
      .insert([
        {
          user_id: userId,
          city,
          country,
          latitude,
          longitude,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar una ubicación guardada
 */
export async function deleteLocation(locationId) {
  try {
    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtener perfil del usuario
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar perfil del usuario
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
