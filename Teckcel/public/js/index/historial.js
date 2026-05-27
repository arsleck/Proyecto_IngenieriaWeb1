// ============================================================
// HISTORIAL DE COMPRAS Y RESEÑAS — TECKCEL
// ============================================================

function crearSeccionHistorial(parentContenedor) {
    const wrapHistorial = document.createElement('div');
    wrapHistorial.className = 'rastreo-historial-wrap';
    wrapHistorial.style.cssText = 'margin-top: 40px; border-top: 2px dashed #e5e7eb; padding-top: 30px; text-align: center; padding-bottom: 50px;';

    // Usamos window.ICON_URLS que declaramos en rastreo.js
    wrapHistorial.innerHTML = `
        <button onclick="toggleHistorial()" style="background: #111827; color: white; padding: 12px 24px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <img src="${window.ICON_URLS['historial']}" style="width:20px; height:20px;">
            Ver Historial de Compras y Reseñas
        </button>
        <div id="historial-lista" style="display: none; margin-top: 25px; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto; padding: 0 15px;">
            <div style="text-align:center; color:#6b7280;">⏳ Cargando tus pedidos...</div>
        </div>
    `;
    parentContenedor.appendChild(wrapHistorial);
}

async function toggleHistorial() {
    const lista = document.getElementById('historial-lista');
    
    // Si está oculto, lo mostramos y consultamos la API
    if (lista.style.display === 'none') {
        lista.style.display = 'block';
        lista.innerHTML = '<div style="text-align:center; color:#6b7280;">⏳ Buscando tus pedidos anteriores...</div>';
        
        try {
            const res = await fetch('/api/pedidos', { credentials: 'include' });
            if (res.ok) {
                const pedidos = await res.json();
                renderizarListaHistorial(pedidos, lista);
            } else {
                lista.innerHTML = '<div style="text-align:center; color:#ef4444;">Error al cargar el historial.</div>';
            }
        } catch(e) {
            lista.innerHTML = '<div style="text-align:center; color:#ef4444;">Error de conexión con el servidor.</div>';
        }
    } else {
        // Si ya está visible, lo ocultamos
        lista.style.display = 'none';
    }
}

function renderizarListaHistorial(pedidos, contenedor) {
    if (!pedidos || pedidos.length === 0) {
        contenedor.innerHTML = '<div style="text-align:center; color:#6b7280; background:#f3f4f6; padding:20px; border-radius:12px;">Aún no tienes compras finalizadas.</div>';
        return;
    }

    const html = pedidos.map(p => {
        const fecha = new Date(p.fecha_pedido).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
        const total = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.total);
        
        // Asignar icono según estado histórico
        let icon = window.ICON_URLS['Pendiente'];
        if (p.estado === 'Entregado') icon = window.ICON_URLS['entregado_active'];
        else if (p.estado === 'En tránsito' || p.estado === 'En reparto') icon = window.ICON_URLS['tránsito_active'];

        // Lógica del botón de reseña
        let btnResena = '';
        if (p.estado === 'Entregado') {
            btnResena = `<button onclick="window.location.href='index.html'" style="background:#ff0076; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px; transition: 0.2s;">
                <img src="${window.ICON_URLS['estrella']}" style="width:14px; height:14px;">
                Dejar/Ver Reseña
            </button>`;
        } else {
            btnResena = `<span style="font-size:0.8rem; color:#9ca3af; font-weight: 500;">En proceso</span>`;
        }

        return `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 15px 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #f9fafb; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #f3f4f6;">
                    <img src="${icon}" style="width:24px; height:24px; filter:saturate(2);">
                </div>
                <div>
                    <div style="font-weight: 700; color: #111827;">Pedido #${p.id}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${fecha} · ${total}</div>
                    <div style="font-size: 0.85rem; color: #111827; margin-top: 4px; font-weight: 600;">Estado: ${p.estado}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                ${btnResena}
            </div>
        </div>`;
    }).join('');

    contenedor.innerHTML = html;
}