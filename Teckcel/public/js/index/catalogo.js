// ==========================================
// CATÁLOGO PRINCIPAL
// ==========================================

let todosLosProductos = [];
let usuarioSesion = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/usuarios/perfil', { credentials: 'include' });
        if (res.ok) usuarioSesion = await res.json();
    } catch (_) {}

    await cargarCatalogo();
});

async function cargarCatalogo() {
    try {
        const [resTodos, resVendidos, resDeseados] = await Promise.all([
            fetch('/api/productos'),
            fetch('/api/productos/top-vendidos'),
            fetch('/api/productos/top-deseados')
        ]);
        const [dataTodos, dataVendidos, dataDeseados] = await Promise.all([
            resTodos.json(), resVendidos.json(), resDeseados.json()
        ]);

        todosLosProductos = dataTodos.productos;
        pintarColumna('lista-vendidos', dataVendidos.productos, 'vendidos');
        pintarColumna('lista-deseados', dataDeseados.productos, 'deseados');
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
    }
}

function pintarColumna(idContenedor, productos, tipo) {
    const contenedor = document.getElementById(idContenedor);
    contenedor.innerHTML = '';

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<p style="padding:20px;color:#aaa;">Sin datos aún.</p>';
        return;
    }

    productos.forEach((producto, index) => {
        const precioFormateado = new Intl.NumberFormat('es-CO').format(parseFloat(producto.precio));
        const scoreHTML = producto.puntuacion_promedio
            ? `<span class="item-score">${parseFloat(producto.puntuacion_promedio).toFixed(1)} ★</span>`
            : `<span class="item-score item-score-new">Nuevo</span>`;

        const subiendo = index < 2;
        const flechaIcon = subiendo
            ? `<img src="https://img.icons8.com/ios-filled/20/4CAF50/up--v1.png" alt="sube" style="width:14px;vertical-align:middle;">`
            : `<img src="https://img.icons8.com/ios-filled/20/F44336/down--v1.png" alt="baja" style="width:14px;vertical-align:middle;">`;

        contenedor.innerHTML += `
            <div class="item-lista" onclick="abrirDetalleProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})" style="cursor:pointer;">
                <div class="item-info-wrapper">
                    <span class="item-number">${index + 1} ${flechaIcon}</span>
                    <img src="${producto.imagen_url}" alt="${producto.nombre}" class="item-img" loading="lazy">
                    <span class="item-name">${producto.nombre}</span>
                </div>
                <div class="item-actions">
                    <span class="item-price">$${precioFormateado}</span>
                    ${scoreHTML}
                    <button onclick="event.stopPropagation(); alternarFavorito(${producto.id})" class="icon-action-btn" title="Añadir a Deseados">
                        <img src="https://img.icons8.com/ios-filled/50/ef4444/like--v1.png" alt="Favorito" style="width:18px;height:18px;">
                    </button>
                    <button onclick="event.stopPropagation(); manejarCarrito(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}')" class="icon-action-btn btn-add" title="Añadir al carrito">
                        <img src="https://img.icons8.com/ios-filled/50/333333/shopping-cart.png" alt="Carrito" style="width:18px;height:18px;">
                    </button>
                </div>
            </div>
        `;
    });
}