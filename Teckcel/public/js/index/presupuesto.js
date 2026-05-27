// ============================================================
// ASISTENTE DE PRESUPUESTO INTERACTIVO — TECKCEL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias al DOM
    const slider = document.getElementById('presupuesto-slider');
    const btnValor = document.querySelector('.slider-value-pink');
    
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContenido = document.getElementById('modal-contenido');

    if (!slider || !btnValor || !modalOverlay || !modalContenido) return;

    // Utilidad para formatear la moneda
    const formatearCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    // Actualizar el texto al mover la barra
    slider.addEventListener('input', (e) => {
        const valorActual = e.target.value;
        btnValor.textContent = `Menos de ${formatearCOP(valorActual)} >`;
    });

    // Acción al hacer clic en el botón rosa (Ahora es asíncrona)
    btnValor.addEventListener('click', async () => {
        const presupuestoMaximo = parseFloat(slider.value);
        
        // Feedback visual
        const textoOriginal = btnValor.textContent;
        btnValor.textContent = "Buscando... ⏳";
        btnValor.style.opacity = "0.8";
        
        try {
            // ==========================================
            // 2. CONEXIÓN A LA BASE DE DATOS
            // ==========================================
            // Hacemos fetch a tu API para traer el inventario
            const res = await fetch('/api/productos?limite=1000');
            const data = await res.json();
            const inventario = data.productos || [];
            
            // Filtramos comparando el precio del producto con el valor del slider
            const resultados = inventario.filter(producto => parseFloat(producto.precio) <= presupuestoMaximo);

            // Restauramos el botón
            btnValor.textContent = textoOriginal;
            btnValor.style.opacity = "1";

            // ==========================================
            // 3. CONSTRUCCIÓN DEL HTML DEL MODAL
            // ==========================================
            let htmlResultados = `
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 1.5rem; color: #333;">Opciones por menos de ${formatearCOP(presupuestoMaximo)}</h2>
                    <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color: #999;">&times;</button>
                </div>
                <div class="resultados-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; max-height: 60vh; overflow-y: auto; padding-right: 5px;">
            `;

            if (resultados.length > 0) {
                resultados.forEach(prod => {
                    // Nos aseguramos de parsear el precio para mostrarlo bien
                    const precioProd = parseFloat(prod.precio);
                    
                    htmlResultados += `
                        <div class="producto-card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; transition: transform 0.2s;">
                            <img src="${prod.imagen_url || '../img/placeholder.png'}" alt="${prod.nombre}" style="max-width: 100%; height: 120px; object-fit: contain; margin-bottom: 10px;">
                            <h4 style="margin: 0 0 5px; font-size: 1rem;">${prod.nombre}</h4>
                            <p style="color: #ff0076; font-weight: bold; margin: 0 0 10px; font-size: 1.1rem;">${formatearCOP(precioProd)}</p>
                            <button onclick='abrirDetalleProducto(${JSON.stringify(prod).replace(/'/g, "&apos;").replace(/"/g, "&quot;")})' style="width: 100%; padding: 8px; background: #fff; color: #ff0076; border: 1px solid #ff0076; border-radius: 4px; cursor: pointer; font-weight: bold;">Ver detalles</button>
                        </div>
                    `;
                });
            } else {
                htmlResultados += `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                        <img src="https://img.icons8.com/ios-filled/50/cccccc/sad.png" alt="Triste" style="margin-bottom: 10px;">
                        <p style="color: #666; font-size: 1.1rem;">Lo sentimos, no encontramos dispositivos en este rango de precio.</p>
                        <button onclick="document.getElementById('modal-overlay').classList.add('hidden')" style="margin-top: 15px; padding: 8px 16px; background: #ff0076; color: white; border: none; border-radius: 4px; cursor: pointer;">Intentar otro presupuesto</button>
                    </div>
                `;
            }

            htmlResultados += `</div>`;

            // ==========================================
            // 4. INYECCIÓN Y APERTURA
            // ==========================================
            modalContenido.innerHTML = htmlResultados;
            modalOverlay.classList.remove('hidden');

        } catch (error) {
            console.error("Error al buscar por presupuesto:", error);
            btnValor.textContent = "Error de conexión";
            setTimeout(() => {
                btnValor.textContent = textoOriginal;
                btnValor.style.opacity = "1";
            }, 2000);
        }
    });
});