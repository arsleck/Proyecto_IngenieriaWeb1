// ==========================================
// CENTRO DE NOTIFICACIONES
// ==========================================

async function abrirNotificaciones() {
    if (typeof usuarioSesion !== 'undefined' && !usuarioSesion) {
        abrirModalCuenta();
        return;
    }

    let overlay = document.getElementById('notificaciones-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'notificaciones-overlay';
        overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;`;
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }

    try {
        const res = await fetch('/api/notificaciones', { credentials: 'include' });
        const notificaciones = await res.json();

        const itemsHTML = notificaciones.length === 0
            ? `<p style="text-align:center;color:#666;padding:25px 0;">No tienes alertas ni novedades en tu cuenta.</p>`
            : notificaciones.map(n => `
                <div style="padding:14px; border-bottom:1px solid #eee; background:${n.leido ? '#fff' : '#f0fdf4'}; border-radius:6px; display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:4px;">
                    <div style="flex:1;">
                        <p style="margin:0; font-size:0.88rem; color:#374151; ${n.leido ? '' : 'font-weight:500;'}">${n.mensaje}</p>
                        <span style="font-size:0.75rem; color:#a1a1aa;">${new Date(n.fecha_creacion).toLocaleDateString('es-CO')}</span>
                    </div>
                    ${n.leido ? '' : `<button onclick="marcarNotificacionLeida(${n.id})" style="background:#e4e4e7; border:none; padding:5px 10px; border-radius:4px; font-size:0.75rem; font-weight:600; cursor:pointer; color:#3f3f46; transition:0.2s;">Leído</button>`}
                </div>
            `).join('');

        overlay.innerHTML = `
            <div style="background:#fff; width:90%; max-width:440px; padding:25px; border-radius:12px; max-height:75vh; display:flex; flex-direction:column; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:12px;">
                    <h3 style="margin:0; font-size:1.15rem; color:#111827;">Notificaciones</h3>
                    <button onclick="document.getElementById('notificaciones-overlay').remove()" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:#9ca3af;">&times;</button>
                </div>
                <div style="flex:1; overflow-y:auto; padding-right:5px; display:flex; flex-direction:column; gap:4px;">${itemsHTML}</div>
            </div>
        `;
    } catch (error) {
        console.error(error);
    }
}

async function marcarNotificacionLeida(id) {
    try {
        const res = await fetch(`/api/notificaciones/${id}/leer`, { method: 'PUT', credentials: 'include' });
        if (res.ok) {
            document.getElementById('notificaciones-overlay').remove();
            abrirNotificaciones(); // Renderizar de nuevo el panel actualizado
            actualizarContadorNotificaciones();
        }
    } catch (error) {
        console.error('Error al actualizar la notificación:', error);
    }
}

async function actualizarContadorNotificaciones() {
    const badge = document.getElementById('notif-count');
    if (!badge) return;
    
    try {
        const res = await fetch('/api/notificaciones', { credentials: 'include' });
        if (res.ok) {
            const notificaciones = await res.json();
            const noLeidas = notificaciones.filter(n => !n.leido).length;
            
            // Guardamos el número que tenía antes para saber si aumentó
            const numeroAnterior = parseInt(badge.textContent) || 0;
            
            // Actualizamos el número real en la interfaz
            badge.textContent = noLeidas;
            badge.style.display = 'flex'; // Nos aseguramos de que el badge sea visible
            
            // LÓGICA DINÁMICA: Si llegaron notificaciones nuevas, disparamos un efecto visual
            if (noLeidas > numeroAnterior) {
                badge.style.transform = 'scale(1.5)';
                badge.style.transition = 'transform 0.2s ease';
                
                // Volvemos al tamaño original después de la animación
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                }, 200);
            }
        } else {
            badge.textContent = '0';
        }
    } catch (error) {
        console.error('Error al actualizar notificaciones:', error);
    }
}

// Inicialización del ecosistema de notificaciones en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    const badge = document.getElementById('notif-count');
    if (badge) {
        badge.textContent = '0'; // Forzamos el estado inicial en cero absoluto
        badge.style.display = 'flex';
    }
    
    // Ejecuta la primera consulta inmediata al servidor para validar el estado actual de la BD
    actualizarContadorNotificaciones();
    
    // Agregamos el bucle de consulta en tiempo real (Short Polling)
    // El sistema consultará de forma asíncrona al backend cada 8 segundos
    setInterval(actualizarContadorNotificaciones, 8000);
});

// Ejecución directa al cargar
document.addEventListener('DOMContentLoaded', actualizarContadorNotificaciones);