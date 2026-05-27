// ==========================================
// GESTIÓN DE ESTADÍSTICAS (ADMIN)
// ==========================================

// ==========================================
// GESTIÓN DE ESTADÍSTICAS (ADMIN)
// ==========================================

async function cargarEstadisticasAdmin() {
    try {
        const res = await fetch('/api/estadisticas/resumen', { credentials: 'include' });
        
        if (!res.ok) throw new Error('Error al obtener estadísticas');
        
        const data = await res.json();
        const stats = data.datos;

        // 1. Llenar las tarjetas superiores
        document.getElementById('stat-ingresos').innerText = `$${stats.ingresos.toLocaleString('es-CO')}`;
        document.getElementById('stat-pedidos').innerText = stats.pedidos;
        document.getElementById('stat-clientes').innerText = stats.clientes;

        // 2. Llenar la tabla del Top 3
        const tbody = document.getElementById('tabla-top-productos');
        tbody.innerHTML = '';

        if (!stats.ranking || stats.ranking.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">No hay ventas registradas aún.</td></tr>';
            return;
        }

        stats.ranking.forEach((prod, index) => {
        let iconoMedalla = '';
        let colorPosicion = '#4b5563'; 
        
        if (index === 0) {
            iconoMedalla = '<img src="https://img.icons8.com/ios-filled/50/d97706/medal.png" style="width:20px; vertical-align:middle; margin-right:5px;">';
            colorPosicion = '#d97706'; 
        } else if (index === 1) {
            iconoMedalla = '<img src="https://img.icons8.com/ios-filled/50/6b7280/medal.png" style="width:20px; vertical-align:middle; margin-right:5px;">';
            colorPosicion = '#6b7280'; 
        } else if (index === 2) {
            iconoMedalla = '<img src="https://img.icons8.com/ios-filled/50/92400e/medal.png" style="width:20px; vertical-align:middle; margin-right:5px;">';
            colorPosicion = '#92400e'; 
        }

        // Formateamos la recaudación como moneda
        const recaudacion = parseInt(prod.recaudacion_total || 0).toLocaleString('es-CO');

        tbody.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: ${colorPosicion};">
                    ${iconoMedalla} #${index + 1}
                </td>
                <td>
                    <img src="${prod.imagen_url}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: contain; margin-right: 10px; vertical-align: middle;">
                    <strong>${prod.nombre}</strong>
                </td>
                <td style="text-align: center;">${prod.ventas_totales} uds.</td>
                <td style="font-weight: bold; color: #10b981; text-align: right;">
                    $${recaudacion}
                </td>
            </tr>
        `;
    });

    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}