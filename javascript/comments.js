// Comments Module
let comments = [];
let commentsSubscription = null;

const commentsSection = document.getElementById('commentsSection');
const commentText = document.getElementById('commentText');
const submitComment = document.getElementById('submitComment');
const commentsList = document.getElementById('commentsList');
const charCount = document.getElementById('charCount');

// Initialize comments
export function initComments() {
    requestCommentLocation();
    subscribeToComments();
    window.deleteCommentHandler = deleteComment;
    window.loadComments = loadComments;
    submitComment.addEventListener('click', handleAddComment);
    commentText.addEventListener('input', updateCharCount);
}

// Request geolocation and load comments
function requestCommentLocation() {
    if (!navigator.geolocation) {
        console.warn('Geolocalización no disponible');
        loadComments();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=4ed985fb9ddb1fd14d3b447f05d85d6b&units=metric&lang=ca`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (response.ok) {
                    const city = data.name || 'Ubicació desconeguda';
                    localStorage.setItem('lastCity', city);
                    console.log('Ciudad detectada:', city);
                    loadComments();
                } else {
                    loadComments();
                }
            } catch (error) {
                console.error('Error obteniendo ciudad:', error);
                loadComments();
            }
        },
        (error) => {
            console.warn('Geolocalización denegada, cargando comentarios sin ciudad');
            loadComments();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Update character count
function updateCharCount() {
    const count = commentText.value.length;
    charCount.textContent = `${count}/500`;
}

// Subscribe to real-time comments updates
function subscribeToComments() {
    try {
        if (window.supabaseReady) {
            window.supabaseReady.then(() => {
                const client = window.supabaseClient;
                if (!client) {
                    console.warn('Supabase no inicializado para suscripción');
                    return;
                }
                
                if (commentsSubscription) {
                    client.removeChannel(commentsSubscription);
                }
                
                commentsSubscription = client
                    .channel('comments_realtime')
                    .on('postgres_changes', { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'comments' 
                    }, (payload) => {
                        console.log('Nuevo comentario recibido:', payload.new);
                        handleNewComment(payload.new);
                    })
                    .on('postgres_changes', { 
                        event: 'DELETE', 
                        schema: 'public', 
                        table: 'comments' 
                    }, (payload) => {
                        console.log('Comentario eliminado:', payload.old);
                        handleDeletedComment(payload.old.id);
                    })
                    .subscribe((status) => {
                        console.log('Suscripción comentarios - Estado:', status);
                    });
            });
        }
    } catch (error) {
        console.error('Error en suscripción:', error);
    }
}

// Handle new comment
function handleNewComment(newCommentData) {
    const currentCity = localStorage.getItem('lastCity');
    if (newCommentData.city !== currentCity) {
        console.log('Comentario de otra ciudad, ignorando');
        return;
    }
    
    const newComment = {
        id: newCommentData.id,
        author: newCommentData.username || 'Usuari anònim',
        text: newCommentData.comment,
        city: newCommentData.city,
        timestamp: new Date(newCommentData.created_at).toLocaleString('ca-ES', { 
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    comments.unshift(newComment);
    renderComments();
}

// Handle deleted comment
function handleDeletedComment(deletedId) {
    comments = comments.filter(comment => comment.id !== deletedId);
    renderComments();
}

// Add new comment
async function handleAddComment() {
    const text = commentText.value.trim();
    
    if (!text) {
        alert('Por favor escribe un comentario');
        return;
    }
    
    if (text.length > 500) {
        alert('El comentario no puede exceder 500 caracteres');
        return;
    }

    const city = localStorage.getItem('lastCity');
    if (!city) {
        alert('Por favor busca una ciudad primero');
        return;
    }

    submitComment.disabled = true;
    
    try {
        const author = localStorage.getItem('username') || 'Usuari anònim';
        const now = new Date();
        const newComment = {
            author: author,
            text: text,
            city: city,
            created_at: now.toISOString()
        };
        
        // Save to Supabase
        await saveCommentToDatabase(newComment);
        
        commentText.value = '';
        updateCharCount();
        // Recarga la lista inmediatamente
        await loadComments();
        
    } catch (error) {
        console.error('Error al guardar comentario:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        alert(`Error al publicar comentario: ${error.message || 'Intenta de nuevo.'}`);
    } finally {
        submitComment.disabled = false;
    }
}

// Delete comment
async function deleteComment(id) {
    console.log('Eliminando comentario con ID:', id);
    if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
        try {
            await deleteCommentFromDatabase(id);
            console.log('Comentario eliminado, recargando lista...');
            // Recarga la lista inmediatamente
            await loadComments();
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            alert('Error al eliminar comentario: ' + error.message);
        }
    }
}

// Save comment to Supabase
async function saveCommentToDatabase(comment) {
    try {
        // Esperar a que Supabase esté inicializado
        if (window.supabaseReady) {
            await window.supabaseReady;
        }
        
        const client = window.supabaseClient;
        if (!client) {
            throw new Error('Supabase client not initialized');
        }
        
        const commentData = {
            username: comment.author,
            comment: comment.text,
            city: comment.city,
            created_at: new Date().toISOString()
        };
        
        console.log('Inserting comment:', commentData);
        
        const { data, error } = await client
            .from('comments')
            .insert([commentData])
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Error desconocido de Supabase');
        }
        
        console.log('Comment saved successfully:', data);
        return data;
    } catch (error) {
        console.error('Error saving to database:', error);
        throw error;
    }
}

// Delete comment from Supabase
async function deleteCommentFromDatabase(id) {
    try {
        if (window.supabaseReady) {
            await window.supabaseReady;
        }
        
        const client = window.supabaseClient;
        if (!client) {
            throw new Error('Supabase no inicializado');
        }
        
        const { error } = await client
            .from('comments')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting from database:', error);
        throw error;
    }
}

// Load comments from Supabase
async function loadComments() {
    try {
        if (window.supabaseReady) {
            await window.supabaseReady;
        }
        
        const client = window.supabaseClient;
        if (!client) {
            console.warn('Supabase no inicializado');
            comments = [];
            renderComments();
            return;
        }
        
        const city = localStorage.getItem('lastCity');
        console.log('Cargando comentarios para ciudad:', city);
        
        if (!city) {
            console.log('No hay ciudad guardada');
            comments = [];
            renderComments();
            return;
        }
        
        const { data, error } = await client
            .from('comments')
            .select('*')
            .eq('city', city)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading:', error);
            comments = [];
            renderComments();
            return;
        }
        
        console.log('Comentarios cargados:', data?.length || 0);
        
        if (!data || data.length === 0) {
            console.log('No hay comentarios para esta ciudad');
            comments = [];
            renderComments();
            return;
        }
        
        comments = data.map(comment => ({
            id: comment.id,
            author: comment.username || 'Usuari anònim',
            text: comment.comment,
            city: comment.city,
            timestamp: new Date(comment.created_at).toLocaleString('ca-ES', { 
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));
        
        console.log('Comentarios procesados:', comments.length);
        renderComments();
    } catch (error) {
        console.error('Error loading comments from database:', error);
        comments = [];
        renderComments();
    }
}

// Render comments
function renderComments() {
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">Aún no hay comentarios. ¡Sé el primero!</div>';
        return;
    }
    
    comments.forEach(comment => {
        const commentCard = document.createElement('div');
        commentCard.className = 'comment-card';
        
        const currentUser = localStorage.getItem('username');
        const isAuthor = currentUser && comment.author === currentUser;
        
        const city = comment.city || localStorage.getItem('lastCity') || 'Ubicació desconeguda';
        
        commentCard.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">@${escapeHtml(comment.author)}</span>
                <span class="comment-city">${escapeHtml(city)}</span>
                <span class="comment-time">${comment.timestamp}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
            ${isAuthor ? `<button class="comment-delete" data-id="${comment.id}">×</button>` : ''}
        `;
        
        // Agregar event listener al botón delete si existe
        const deleteBtn = commentCard.querySelector('.comment-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                deleteComment(id);
            });
        }
        
        commentsList.appendChild(commentCard);
    });
}

// Show/hide comments section based on auth status
export function toggleCommentsSection(isLoggedIn) {
    if (isLoggedIn) {
        commentsSection.style.display = 'block';
        initComments();
    } else {
        commentsSection.style.display = 'none';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Expose delete handler to window
window.deleteCommentHandler = deleteComment;
