// ==========================================
// GESTIÓN DE MIS LISTAS (FAVORITOS)
// ==========================================

async function alternarFavorito(productoId) {
    try {
        const res = await fetch('/api/favoritos/alternar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: productoId }),
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Le avisamos al usuario visualmente
            alert(data.mensaje); 
            actualizarContadorFavoritos();
        } else if (res.status === 401) {
            abrirModalCuenta();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al alternar favorito:', error);
        alert('Ocurrió un error de conexión.');
    }
}

async function verMisListas() {
    if (typeof usuarioSesion !== 'undefined' && !usuarioSesion) {
        abrirModalCuenta();
        return;
    }

    let overlay = document.getElementById('favoritos-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'favoritos-overlay';
        overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;`;
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }

    try {
        const res = await fetch('/api/favoritos', { credentials: 'include' });
        const favoritos = await res.json();

        const itemsHTML = favoritos.length === 0
            ? `<p style="text-align:center;color:#666;padding:20px 0;">No tienes productos guardados en tus listas.</p>`
            : favoritos.map(p => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${p.imagen_url}" style="width:45px; height:45px; object-fit:contain; border-radius:4px;">
                        <div>
                            <strong style="font-size:0.9rem; color:#111827;">${p.nombre}</strong>
                            <div style="color:#2196F3; font-size:0.85rem; font-weight:bold;">$${parseFloat(p.precio).toLocaleString('es-CO')}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button onclick="agregarAlCarrito(${p.id})" style="background:#111827; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600;">
                            Agregar
                        </button>
                        <button onclick="alternarFavorito(${p.id}); document.getElementById('favoritos-overlay').remove(); verMisListas();" style="background:none; border:none; cursor:pointer; padding:4px;">
                            <img src="https://img.icons8.com/ios-filled/50/ef4444/trash.png" style="width:18px; height:18px;">
                        </button>
                    </div>
                </div>
            `).join('');

        overlay.innerHTML = `
            <div style="background:#fff; width:90%; max-width:480px; padding:25px; border-radius:12px; max-height:75vh; display:flex; flex-direction:column; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:12px;">
                    <h3 style="margin:0; font-size:1.15rem; color:#111827;">Mis Listas de Deseos</h3>
                    <button onclick="document.getElementById('favoritos-overlay').remove()" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:#9ca3af;">&times;</button>
                </div>
                <div style="flex:1; overflow-y:auto; padding-right:5px;">${itemsHTML}</div>
            </div>
        `;
    } catch (error) {
        console.error(error);
    }
}

async function actualizarContadorFavoritos() {
    const badge = document.getElementById('fav-count');
    if (!badge) return;
    
    try {
        const res = await fetch('/api/favoritos', { credentials: 'include' });
        if (res.ok) {
            const favoritos = await res.json();
            badge.textContent = favoritos.length;
            // Opcional: Ocultar el badge si es 0, mostrarlo si es mayor
            badge.style.display = favoritos.length > 0 ? 'inline-block' : 'none';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al actualizar contador de listas:', error);
    }
}

// Escuchamos el evento sin temporizadores, para que corra apenas esté listo
document.addEventListener('DOMContentLoaded', actualizarContadorFavoritos);