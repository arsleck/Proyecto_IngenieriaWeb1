// ============================================================
// ORQUESTADOR DEL MODAL DE PRODUCTO
// Depende de: modalUtils.js, modalBuilder.js, valoraciones.js
// ============================================================

// ============================================================
// ORQUESTADOR DEL MODAL DE PRODUCTO (VERSIÓN BLINDADA)
// ============================================================

async function abrirDetalleProducto(producto) {
    let overlay = document.getElementById('modal-producto-detalle');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id        = 'modal-producto-detalle';
        overlay.className = 'prod-overlay';
        overlay.addEventListener('click', e => {
            if (e.target === overlay) cerrarDetalleProducto();
        });
        document.body.appendChild(overlay);
    }

    // 1. Mostrar el Skeleton mientras carga
    overlay.innerHTML = `
        <div class="prod-modal">
            <div class="prod-skeleton">
                <div class="skel-img"></div>
                <div class="skel-lines">
                    <div class="skel-line w60"></div>
                    <div class="skel-line w80"></div>
                    <div class="skel-line w40"></div>
                </div>
            </div>
        </div>`;
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';

    try {
        // 2. Cargamos datos en paralelo
        const [valoraciones, permisoResena] = await Promise.all([
            fetchValoraciones(producto.id),
            fetchPermisoResena(producto.id)
        ]);

        // Prevención de errores: Nos aseguramos de que siempre sea un array
        const arrayValoraciones = Array.isArray(valoraciones) ? valoraciones : [];

        // 3. Pintamos el modal
        overlay.innerHTML = construirModal(producto, arrayValoraciones, permisoResena);
        inicializarStarPicker();
        
    } catch (error) {
        // Si algo se rompe, atrapamos el error y mostramos un mensaje en vez del esqueleto infinito
        console.error("Error crítico al construir el modal:", error);
        overlay.innerHTML = `
            <div class="prod-modal" style="text-align:center; padding: 50px;">
                <h3 style="color:#e53935;">Ocurrió un error al cargar el producto</h3>
                <p style="color:#666;">Por favor, revisa la consola (F12) para más detalles.</p>
                <button onclick="cerrarDetalleProducto()" style="margin-top:20px; padding:10px 20px; cursor:pointer;">Cerrar</button>
            </div>`;
    }
}

function cerrarDetalleProducto() {
    const overlay = document.getElementById('modal-producto-detalle');
    if (overlay) {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }
}

function cambiarTab(tabEl, panelId) {
    document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    document.querySelectorAll('.pd-body').forEach(p => p.style.display = 'none');
    document.getElementById(panelId).style.display = 'block';
}

// --- Helpers de fetch ---
async function fetchValoraciones(productoId) {
    try {
        const res = await fetch(`/api/valoraciones/producto/${productoId}`);
        return res.ok ? await res.json() : [];
    } catch (_) { return []; }
}

async function fetchPermisoResena(productoId) {
    try {
        // CORRECCIÓN: Apuntamos a la nueva ruta de valoraciones que acabamos de crear
        const res = await fetch(`/api/valoraciones/${productoId}/puede-opinar`, { credentials: 'include' });
        return res.ok ? await res.json() : { puedeOpinar: false, motivo: 'no_sesion' };
    } catch (_) { 
        return { puedeOpinar: false, motivo: 'no_sesion' }; 
    }
}