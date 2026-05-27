// ==========================================
// BÚSQUEDA AVANZADA (A PRUEBA DE FALLOS)
// ==========================================

let inventarioBuscador = []; 

// Forzamos la carga de productos apenas el script es leído por el navegador
(async function inicializarBuscadorSilencioso() {
    try {
        const res = await fetch('/api/productos?limite=1000');
        const data = await res.json();
        inventarioBuscador = data.productos || [];
    } catch (error) {
        console.warn("El buscador tardará un poco más en cargar los datos.");
    }
})();

function abrirBuscador() {
    const modal = document.getElementById('modal-buscador');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Forzamos el display flex
        setTimeout(() => document.getElementById('input-buscador-modal')?.focus(), 100);
        document.getElementById('resultados-busqueda').innerHTML = '';
    }
}

function cerrarBuscador() {
    const modal = document.getElementById('modal-buscador');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.getElementById('input-buscador-modal').value = '';
    }
}

function ejecutarBusquedaModal(textoBusqueda) {
    const texto = textoBusqueda.toLowerCase().trim();
    const resultadosDiv = document.getElementById('resultados-busqueda');
    if (!resultadosDiv) return;

    if (texto === '') {
        resultadosDiv.innerHTML = '<p style="text-align:center; color:#86868b; padding:20px;">Comienza a escribir para buscar...</p>';
        return;
    }

    const filtrados = inventarioBuscador.filter(p => 
        p.nombre.toLowerCase().includes(texto) || p.marca.toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
        resultadosDiv.innerHTML = '<p style="text-align:center; color:#ff3b30; padding:20px; font-weight:500;">No se encontraron resultados.</p>';
        return;
    }

    const categorias = { 'celulares': [], 'laptops': [], 'tablets': [] };

    filtrados.forEach(p => {
        const cat = p.categoria ? p.categoria.toLowerCase().trim() : 'celulares';
        if (categorias[cat] !== undefined) categorias[cat].push(p);
        else categorias['celulares'].push(p);
    });

    let html = '';
    const nombresCat = { 'celulares': 'Móviles', 'laptops': 'Portátiles', 'tablets': 'Tablets' };

    for (let cat in categorias) {
        if (categorias[cat].length > 0) {
            html += `<div class="search-col"><h4>${nombresCat[cat]}</h4>`;
            
            categorias[cat].forEach(p => {
                const precio = parseFloat(p.precio).toLocaleString('es-CO');
                const score = p.puntuacion_promedio ? parseFloat(p.puntuacion_promedio).toFixed(1) : 'Nuevo';
                const scoreColor = score >= 4.0 ? '#34c759' : (score === 'Nuevo' ? '#007aff' : '#ff9500');

                html += `
                    <a href="#" class="search-item" onclick="cerrarBuscador(); abrirDetalleProducto(${JSON.stringify(p).replace(/"/g, '&quot;')}); return false;">
                        <img src="${p.imagen_url}" alt="${p.nombre}">
                        <div class="search-item-info">
                            <span class="search-item-name">${p.nombre}</span>
                            <span class="search-item-price">$${precio} COP</span>
                        </div>
                        <span class="search-item-score" style="background:${scoreColor}; color:white; padding:4px 8px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${score}</span>
                    </a>
                `;
            });
            html += `</div>`;
        }
    }
    
    resultadosDiv.innerHTML = html;
}