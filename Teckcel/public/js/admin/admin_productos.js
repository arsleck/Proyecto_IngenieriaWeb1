// ==========================================
// GESTIÓN DE PRODUCTOS (CRUD)
// ==========================================

let editandoId = null; // Variable global para saber si creamos o editamos

async function cargarProductosAdmin() {
    try {
        const res = await fetch('/api/productos?limite=50');
        const data = await res.json();
        const tbody = document.getElementById('tabla-productos-admin');
        tbody.innerHTML = '';

        data.productos.forEach(p => {
            const precioFormateado = parseFloat(p.precio).toLocaleString('es-CO');
            const productoJSON = JSON.stringify(p).replace(/"/g, '&quot;');
            
            tbody.innerHTML += `
                <tr>
                    <td style="color:#666; font-size:0.9rem;">#${p.id}</td>
                    <td><img src="${p.imagen_url}" alt="${p.nombre}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 4px; border: 1px solid #f3f4f6;"></td>
                    <td>
                        <strong style="color:#111827; font-size:1rem;">${p.nombre}</strong><br>
                        <small style="color:#6b7280;">${p.marca}</small>
                    </td>
                    <td style="color:#4b5563;">${p.categoria}</td>
                    <td style="color: #10b981; font-weight: bold; font-size:1.05rem;">$${precioFormateado}</td>
                    <td>
                        <span style="background:${p.stock > 5 ? '#f0fdf4' : '#fef2f2'}; color:${p.stock > 5 ? '#16a34a' : '#ef4444'}; padding: 4px 8px; border-radius: 4px; font-weight:600; font-size:0.85rem;">
                            ${p.stock} uds.
                        </span>
                    </td>
                    <td style="display:flex; gap:8px;">
                        <button class="btn-edit" onclick="prepararEdicion(${productoJSON})" title="Editar producto" style="background:#f3f4f6; border:none; padding:8px; border-radius:6px; cursor:pointer;">
                            <img src="https://img.icons8.com/ios-filled/50/4b5563/edit--v1.png" alt="Editar" style="width:18px;">
                        </button>
                        <button class="btn-danger" onclick="eliminarProducto(${p.id})" title="Eliminar permanentemente" style="background:#fef2f2; border:none; padding:8px; border-radius:6px; cursor:pointer;">
                            <img src="https://img.icons8.com/ios-filled/50/ef4444/trash.png" alt="Eliminar" style="width:18px;">
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando inventario:", error);
    }
}

// Funciones del Modal
function abrirModalProducto() {
    editandoId = null; 
    document.getElementById('modal-titulo').innerText = "Agregar Nuevo Producto";
    document.getElementById('form-producto').reset();
    document.getElementById('prod-imagen-file').required = true; 
    document.getElementById('modal-producto').classList.remove('hidden');
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').classList.add('hidden');
}

function prepararEdicion(producto) {
    editandoId = producto.id;
    document.getElementById('modal-titulo').innerText = "Editar: " + producto.nombre;
    
    document.getElementById('prod-nombre').value = producto.nombre;
    document.getElementById('prod-marca').value = producto.marca;
    document.getElementById('prod-categoria').value = producto.categoria;
    document.getElementById('prod-precio').value = producto.precio;
    document.getElementById('prod-stock').value = producto.stock;
    document.getElementById('prod-descripcion').value = producto.descripcion;
    
    document.getElementById('prod-imagen-file').required = false; 
    document.getElementById('modal-producto').classList.remove('hidden');
}

async function guardarProducto(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('nombre', document.getElementById('prod-nombre').value);
    formData.append('marca', document.getElementById('prod-marca').value);
    formData.append('categoria', document.getElementById('prod-categoria').value);
    
    // ✅ CORRECCIÓN: Limpiamos el precio de puntos y comas antes de enviarlo
    const precioBruto = document.getElementById('prod-precio').value;
    const precioLimpio = precioBruto.replace(/\./g, '').replace(/,/g, '');
    formData.append('precio', precioLimpio);

    formData.append('stock', document.getElementById('prod-stock').value);
    formData.append('descripcion', document.getElementById('prod-descripcion').value);

    const inputImagen = document.getElementById('prod-imagen-file');
    if (inputImagen.files.length > 0) {
        formData.append('imagen', inputImagen.files[0]);
    }

    const url = editandoId ? `/api/productos/${editandoId}` : '/api/productos';
    const metodo = editandoId ? 'PUT' : 'POST';
    const botonSubmit = document.querySelector('#form-producto button[type="submit"]');

    try {
        botonSubmit.disabled = true;
        botonSubmit.innerText = 'Guardando...';

        const respuesta = await fetch(url, {
            method: metodo,
            body: formData, 
            credentials: 'include'
        });

        if (respuesta.ok) {
            cerrarModalProducto();
            cargarProductosAdmin(); 
        } else {
            const data = await respuesta.json();
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Hubo un error de conexión con el servidor.');
    } finally {
        botonSubmit.disabled = false;
        botonSubmit.innerText = 'Guardar Producto';
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente? Esta acción no se puede deshacer.')) return;

    try {
        const respuesta = await fetch(`/api/productos/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (respuesta.ok) {
            cargarProductosAdmin();
        } else {
            alert('No se pudo eliminar el producto.');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}