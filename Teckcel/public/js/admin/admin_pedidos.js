// ==========================================
// GESTIÓN DE PEDIDOS (ADMIN)
// ==========================================

async function cargarPedidosAdmin() {
    try {
        // CORRECCIÓN 1: La ruta correcta del backend es /todos
        const res = await fetch('/api/pedidos/todos', { credentials: 'include' });
        
        if (!res.ok) throw new Error('Error al obtener pedidos');
        
        const data = await res.json();
        const tbody = document.getElementById('tabla-pedidos-admin');
        tbody.innerHTML = '';

        // Ahora data.pedidos sí traerá la información correctamente
        if (!data.pedidos || data.pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">Aún no hay pedidos en el sistema.</td></tr>';
            return;
        }

        data.pedidos.forEach(p => {
            const total = parseFloat(p.total).toLocaleString('es-CO');
            const fecha = new Date(p.fecha_pedido).toLocaleDateString('es-CO', { 
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
            });
            
            // Colores semánticos para la logística local
            let colorEstado = '#f59e0b'; // Naranja: Pendiente (Recién entra)
            if (p.estado === 'En tránsito') colorEstado = '#3b82f6'; // Azul: Salió de bodega principal
            if (p.estado === 'En reparto') colorEstado = '#8b5cf6'; // Morado: El mensajero lo tiene en su ruta final
            if (p.estado === 'Entregado') colorEstado = '#10b981'; // Verde: Completado

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: bold; color: #4b5563;">#${p.id}</td>
                    <td><strong>${p.cliente}</strong><br><small style="color: #666;">${p.email}</small></td>
                    <td>${fecha}</td>
                    <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.direccion_envio}">${p.direccion_envio}</td>
                    <td style="font-weight: bold; color: #111827;">$${total}</td>
                    <td>
                        <select onchange="cambiarEstadoPedido(${p.id}, this.value)" style="padding: 6px; border-radius: 6px; border: 2px solid ${colorEstado}; color: ${colorEstado}; font-weight: bold; background: transparent; cursor: pointer; outline: none;">
                            <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''} style="color: black;">Pendiente</option>
                            <option value="En tránsito" ${p.estado === 'En tránsito' ? 'selected' : ''} style="color: black;">En tránsito</option>
                            <option value="En reparto" ${p.estado === 'En reparto' ? 'selected' : ''} style="color: black;">En reparto</option>
                            <option value="Entregado" ${p.estado === 'Entregado' ? 'selected' : ''} style="color: black;">Entregado</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    }
}

async function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    if (!confirm(`¿Actualizar el pedido #${pedidoId} a estado "${nuevoEstado}"?`)) {
        cargarPedidosAdmin(); // Si cancela, devolvemos el selector al estado original
        return;
    }

    try {
        // CORRECCIÓN 2: La ruta correcta del backend para el PUT es /actualizar
        const res = await fetch('/api/pedidos/actualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pedido_id: pedidoId, 
                nuevo_estado: nuevoEstado 
            }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            if (nuevoEstado === 'Entregado') {
                alert(`¡Estado actualizado!`);
            }
            // Recargamos la tabla para que se actualice el color del borde del selector
            cargarPedidosAdmin();
        } else {
            alert('Error: ' + data.mensaje);
            cargarPedidosAdmin();
        }
    } catch (error) {
        console.error(error);
        alert('Hubo un error de conexión al intentar actualizar el pedido.');
        cargarPedidosAdmin();
    }
}