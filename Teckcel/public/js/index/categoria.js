document.addEventListener('DOMContentLoaded', async () => {
    if (typeof CATEGORIA_ACTUAL === 'undefined') return;
    await cargarProductosPorCategoria(CATEGORIA_ACTUAL);
});

async function cargarProductosPorCategoria(categoria) {
    const contenedor = document.getElementById('grid-productos-categoria');
    if (!contenedor) return;

    contenedor.innerHTML = '<p style="padding:20px; text-align:center; color:#aaa; grid-column: 1 / -1;">Cargando catálogo...</p>';

    try {
        const res = await fetch(`/api/productos?categoria=${categoria}&limite=50`);
        const data = await res.json();

        if (!data.productos || data.productos.length === 0) {
            contenedor.innerHTML = `<p style="padding:40px; text-align:center; color:#666; background:#fff; border-radius:12px; grid-column: 1 / -1;">Aún no hay productos en la categoría <b>${categoria}</b>.</p>`;
            return;
        }

        contenedor.innerHTML = ''; 

        data.productos.forEach(producto => {
            const precioFormateado = new Intl.NumberFormat('es-CO').format(parseFloat(producto.precio));
            const productoJSON = JSON.stringify(producto).replace(/"/g, '&quot;');
            
            // Lógica de puntuación: Si es > 4 verde, si es menor naranja, si no tiene es azul
            const scoreValue = producto.puntuacion_promedio ? parseFloat(producto.puntuacion_promedio).toFixed(1) : 'Nuevo';
            let scoreColor = '#3b82f6'; // Azul por defecto (Nuevo)
            if (producto.puntuacion_promedio >= 4.0) scoreColor = '#10b981'; // Verde alto
            else if (producto.puntuacion_promedio > 0) scoreColor = '#f59e0b'; // Naranja medio

            // Construcción de la tarjeta estilo Kimovil
            contenedor.innerHTML += `
                <div class="k-card" onclick="abrirDetalleProducto(${productoJSON})">
                    
                    <div class="k-card-top">
                        <div class="k-score" style="background-color: ${scoreColor}; font-size: ${scoreValue === 'Nuevo' ? '0.7rem' : '1.1rem'}">${scoreValue}</div>
                        <div class="k-title-box">
                            <span class="k-brand">${producto.marca}</span>
                            <h3 class="k-name">${producto.nombre}</h3>
                        </div>
                    </div>
                    
                    <div class="k-img-wrapper">
                        <img src="${producto.imagen_url}" alt="${producto.nombre}">
                    </div>

                    <div class="k-specs">
                        <span class="k-spec-item">
                            <img src="https://img.icons8.com/ios-filled/50/9ca3af/box.png" style="width:14px; height:14px;"> 
                            Stock: ${producto.stock}
                        </span>
                        <span class="k-spec-item">
                            <img src="https://img.icons8.com/ios-filled/50/9ca3af/info.png" style="width:14px; height:14px;">
                            ${producto.categoria}
                        </span>
                    </div>

                    <div class="k-card-bottom">
                        <button class="k-price-btn" onclick="event.stopPropagation(); manejarCarrito(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}')">
                            $${precioFormateado}
                            <small>Comprar</small>
                        </button>
                        
                        <button class="k-fav-btn" onclick="event.stopPropagation(); alternarFavorito(${producto.id})" title="Añadir a Mis Listas">
                            <img src="https://img.icons8.com/ios-filled/50/ef4444/like--v1.png" style="width:20px; height:20px;">
                        </button>
                    </div>
                    
                </div>
            `;
        });

    } catch (error) {
        console.error("Error cargando categoría:", error);
        contenedor.innerHTML = '<p style="padding:20px; text-align:center; color:#ef4444; grid-column: 1 / -1;">Error de conexión con el servidor.</p>';
    }
}