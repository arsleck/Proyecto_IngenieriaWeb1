// ============================================================
// CONSTRUCTOR DE HTML DEL MODAL
// Depende de: modalUtils.js
// ============================================================

function construirModal(producto, valoraciones, permisoResena) {
    const promedio    = producto.puntuacion_promedio
        ? parseFloat(producto.puntuacion_promedio).toFixed(1) : '—';
    const total       = valoraciones.length;
    const estrellasBig = producto.puntuacion_promedio
        ? renderStars(parseFloat(producto.puntuacion_promedio)) : '—';
    const precio      = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(producto.precio);

    const barras = [5, 4, 3, 2, 1].map(n => {
        const count = valoraciones.filter(v => v.puntuacion === n).length;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
            <div class="pd-bar-row">
                <span>${n}★</span>
                <div class="pd-bar-track"><div class="pd-bar-fill" style="width:${pct}%"></div></div>
                <span>${count}</span>
            </div>`;
    }).join('');

    const seccionFormulario = construirSeccionFormulario(producto.id, permisoResena);

    const listaReseñas = total === 0
        ? `<p style="color:#aaa;text-align:center;padding:20px 0;">Aún no hay reseñas. ¡Sé el primero!</p>`
        : valoraciones.map(v => construirTarjetaResena(v)).join('');

    return `
    <div class="prod-modal">
        <div class="pd-top">
            <div class="pd-img-wrap">
                <img src="${producto.imagen_url}" alt="${producto.nombre}"
                     onerror="this.src='https://via.placeholder.com/200x200?text=Sin+imagen'">
            </div>
            <div class="pd-info">
                <button class="pd-close" onclick="cerrarDetalleProducto()">✕</button>
                <span class="pd-badge">${producto.marca}</span>
                <h2 class="pd-nombre">${producto.nombre}</h2>
                <div class="pd-stars-row">
                    <span class="pd-stars-big">${estrellasBig}</span>
                    <span class="pd-stars-label">${promedio} · ${total} reseña${total !== 1 ? 's' : ''}</span>
                </div>
                <div class="pd-precio">${precio}</div>
                <p class="pd-desc">${producto.descripcion}</p>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="pd-btn-comprar" onclick="agregarAlCarrito(${producto.id})" style="flex: 1; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/shopping-cart.png" style="width:20px; height:20px;">
                        Agregar al carrito
                    </button>
                    <button onclick="alternarFavorito(${producto.id})" style="background: #f3f4f6; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;" title="Agregar a Mis Listas" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#f3f4f6'">
                        <img src="https://img.icons8.com/ios-filled/50/ef4444/like--v1.png" style="width:24px; height:24px;">
                    </button>
                </div>
                </div>
        </div>

        <div class="pd-tabs">
            <div class="pd-tab active" onclick="cambiarTab(this,'pd-panel-resenas')">Reseñas (${total})</div>
            <div class="pd-tab" onclick="cambiarTab(this,'pd-panel-specs')">Especificaciones</div>
        </div>

        <div class="pd-body" id="pd-panel-resenas">
            <div class="pd-rating-summary">
                <div class="pd-rating-big">
                    <div class="pd-num">${promedio}</div>
                    <div class="pd-stars">${estrellasBig}</div>
                    <div class="pd-total">${total} reseñas</div>
                </div>
                <div class="pd-bars">${barras}</div>
            </div>

            ${seccionFormulario}

            <div id="pd-lista-resenas">${listaReseñas}</div>
        </div>

        <div class="pd-body" id="pd-panel-specs" style="display:none">
            <table class="pd-specs-table">
                <tr><td>Marca</td><td>${producto.marca}</td></tr>
                <tr><td>Categoría</td><td>${producto.categoria}</td></tr>
                <tr><td>Precio</td><td>${precio}</td></tr>
                <tr><td>Stock disponible</td><td>${producto.stock ?? '—'} unidades</td></tr>
                <tr><td>Calificación</td><td>${promedio} / 5</td></tr>
            </table>
        </div>
    </div>`;
}

// --- Decide qué mostrar en la zona del formulario ---
function construirSeccionFormulario(productoId, permiso) {
    if (!permiso || permiso.motivo === 'no_sesion') {
        return `
        <div class="pd-locked">
            <img src="https://img.icons8.com/ios-filled/50/666666/lock.png" style="width:18px; vertical-align:middle; margin-right:5px;">
            <a href="#" onclick="cerrarDetalleProducto(); abrirModalCuenta();">Inicia sesión</a>
            para dejar una reseña.
            <p style="margin-top:5px; color:#888;">Solo usuarios que compraron este producto pueden calificar.</p>
        </div>`;
    }

    if (permiso.motivo === 'ya_reseno') {
        return `
        <div class="pd-locked" style="background:#f0fdf4;color:#16a34a;">
            <img src="https://img.icons8.com/ios-filled/50/16a34a/checkmark--v1.png" style="width:18px; vertical-align:middle; margin-right:5px;">
            Ya dejaste tu reseña sobre este producto.
        </div>`;
    }

    if (permiso.motivo === 'no_compro') {
        return `
        <div class="pd-locked">
            <img src="https://img.icons8.com/ios-filled/50/666666/shopping-bag.png" style="width:18px; vertical-align:middle; margin-right:5px;">
            Solo los compradores verificados pueden dejar una reseña.
        </div>`;
    }

    return `
    <div class="pd-review-form" id="pd-form-wrap">
        <h4 style="display:flex; align-items:center;">
            <img src="https://img.icons8.com/ios-filled/50/111827/edit-property.png" style="width:20px; margin-right:8px;">
            Tu reseña
        </h4>
        <div class="pd-star-picker" id="pd-star-picker">
            <span data-v="1">★</span><span data-v="2">★</span>
            <span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span>
        </div>
        <textarea id="pd-comentario" rows="3" placeholder="¿Qué te pareció este producto?"></textarea>
        <button onclick="enviarValoracion(${productoId})" class="pd-btn-enviar">Publicar reseña</button>
        <p id="pd-form-msg" style="font-size:0.82rem;margin-top:8px;color:#888;"></p>
    </div>`;
}

// --- Tarjeta individual de reseña ---
function construirTarjetaResena(v) {
    return `
    <div class="pd-review-card" style="margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">
        <div class="pd-review-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="pd-avatar" style="width: 30px; height: 30px; background: #2196F3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${v.autor.charAt(0).toUpperCase()}
                </div>
                <span class="pd-autor" style="font-weight: bold; color: #374151;">${v.autor}</span>
            </div>
            <span class="pd-fecha" style="font-size: 0.8rem; color: #9ca3af;">${formatearFecha(v.fecha)}</span>
        </div>
        <div class="pd-stars" style="color: #fbbf24; margin: 5px 0;">${renderStars(v.puntuacion)}</div>
        <p class="pd-texto" style="color: #4b5563; font-size: 0.95rem; margin: 0;">${v.comentario}</p>
    </div>`;
}

// ============================================================
// UTILIDADES COMPARTIDAS (Formatos)
// ============================================================

function renderStars(puntuacion) {
    const llenas = Math.floor(puntuacion);
    const media  = puntuacion % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias);
}

function formatearFecha(fechaStr) {
    // Evitamos errores si la fecha viene vacía
    if (!fechaStr) return 'hace poco';
    
    const diff = Date.now() - new Date(fechaStr).getTime();
    const dias  = Math.floor(diff / 86400000);
    if (dias === 0)  return 'hoy';
    if (dias === 1)  return 'hace 1 día';
    if (dias < 7)    return `hace ${dias} días`;
    if (dias < 30)   return `hace ${Math.floor(dias / 7)} semana${Math.floor(dias / 7) > 1 ? 's' : ''}`;
    return `hace ${Math.floor(dias / 30)} mes${Math.floor(dias / 30) > 1 ? 'es' : ''}`;
}