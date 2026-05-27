// ==========================================
// GESTIÓN DEL CARRITO Y CHECKOUT
// ==========================================

async function manejarCarrito(productoId, nombreProducto) {
    try {
        const res = await fetch('/api/carrito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
        });

        if (res.status === 401) { guardarCarritoLocal(productoId, nombreProducto); return; }
        
        if (res.ok) {
            mostrarToast(`"${nombreProducto}" agregado al carrito`, 'success');
            actualizarBadgeCarrito();
        } else {
            const data = await res.json();
            mostrarToast(data.mensaje || 'Error al agregar', 'error');
        }
    } catch (_) {
        guardarCarritoLocal(productoId, nombreProducto);
    }
}

function guardarCarritoLocal(productoId, nombreProducto) {
    let carrito = JSON.parse(localStorage.getItem('carrito_temp') || '[]');
    const existe = carrito.find(i => i.id === productoId);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id: productoId, nombre: nombreProducto, cantidad: 1, precio: 0 });
    }
    localStorage.setItem('carrito_temp', JSON.stringify(carrito));
    mostrarToast(`"${nombreProducto}" guardado en tu carrito local`, 'success');
    actualizarBadgeCarrito();
}

async function agregarAlCarrito(productoId) {
    // Validación segura por si la variable todosLosProductos no existe en la página actual
    let producto = null;
    if (typeof todosLosProductos !== 'undefined') {
        producto = todosLosProductos.find(p => p.id === productoId);
    }
    await manejarCarrito(productoId, producto ? producto.nombre : 'Producto');
}

async function actualizarBadgeCarrito() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    let totalItems = 0;

    try {
        const res = await fetch('/api/carrito', { credentials: 'include' });
        if (res.ok) {
            const carrito = await res.json();
            totalItems = carrito.reduce((suma, item) => suma + parseInt(item.cantidad), 0);
        } else {
            const carritoLocal = JSON.parse(localStorage.getItem('carrito_temp') || '[]');
            totalItems = carritoLocal.reduce((suma, item) => suma + parseInt(item.cantidad), 0);
        }
    } catch (error) {
        const carritoLocal = JSON.parse(localStorage.getItem('carrito_temp') || '[]');
        totalItems = carritoLocal.reduce((suma, item) => suma + parseInt(item.cantidad), 0);
    }

    badge.textContent = totalItems;
    if (totalItems > 0) badge.style.display = 'flex';
}

// --- ABRIR EL CARRITO ---
async function abrirCarrito() {
    let carrito = [];
    let totalPrecio = 0;
    
    let overlay = document.getElementById('carrito-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'carrito-overlay';
        overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-end;justify-content:flex-end;`;
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }

    // Validación segura de sesión
    const usuarioActivo = typeof usuarioSesion !== 'undefined' && usuarioSesion !== null;

    if (usuarioActivo) {
        try {
            const res = await fetch('/api/carrito', { credentials: 'include' });
            if (res.ok) carrito = await res.json();
        } catch (error) {
            console.error('Error leyendo carrito BD', error);
        }
    } else {
        carrito = JSON.parse(localStorage.getItem('carrito_temp') || '[]');
    }

    const itemsHTML = carrito.length === 0
        ? `<p style="text-align:center;color:#888;padding:40px 0;">Tu carrito está vacío</p>`
        : carrito.map(i => {
            const precioItem = i.precio ? parseFloat(i.precio) : 0;
            totalPrecio += (precioItem * i.cantidad);
            const img = i.imagen_url ? `<img src="${i.imagen_url}" style="width:40px; height:40px; object-fit:contain; margin-right:10px;">` : '';
            
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
                <div style="display:flex; align-items:center; flex:1;">
                    ${img}
                    <div>
                        <div style="font-size:0.9rem; font-weight:600; color:#333;">${i.nombre}</div>
                        <div style="font-size:0.8rem; color:#666;">Cant: ${i.cantidad} ${precioItem > 0 ? `| $${precioItem.toLocaleString('es-CO')}` : ''}</div>
                    </div>
                </div>
                <button onclick="eliminarItemCarrito(${i.id})" title="Eliminar" style="background:none; border:none; cursor:pointer; padding:5px;">
                    <img src="https://img.icons8.com/ios-filled/50/ef4444/trash.png" style="width:20px; height:20px;">
                </button>
            </div>`;
        }).join('');

    const footerHTML = usuarioActivo
        ? `<div style="margin-top:20px;">
             <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.1rem; margin-bottom:15px;">
                <span>Total:</span> <span>$${totalPrecio.toLocaleString('es-CO')}</span>
             </div>
             <button onclick="irACheckout(${totalPrecio})" style="width:100%;padding:14px;background:#111827;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer; transition:0.3s;">Proceder al Pago</button>
           </div>`
        : `<button onclick="abrirModalCuenta(); document.getElementById('carrito-overlay').remove();" style="width:100%;padding:14px;background:#f3f4f6;color:#555;border:none;border-radius:8px;font-size:0.95rem;font-weight:600;cursor:pointer;margin-top:20px;">Inicia sesión para comprar</button>`;

    overlay.innerHTML = `
        <div id="carrito-panel" style="background:#fff;width:100%;max-width:400px;height:100vh;padding:25px;display:flex;flex-direction:column;box-shadow:-5px 0 25px rgba(0,0,0,0.15); animation: slideInRight 0.3s ease;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:15px;margin-bottom:10px;">
                <h2 style="font-size:1.3rem; margin:0; color:#111827;">Mi Carrito</h2>
                <button onclick="document.getElementById('carrito-overlay').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#9ca3af;">&times;</button>
            </div>
            <div style="flex:1; overflow-y:auto; padding-right:10px;" id="carrito-items-container">
                ${itemsHTML}
            </div>
            ${carrito.length > 0 ? footerHTML : ''}
        </div>
    `;
}

// --- ELIMINAR ITEM ---
async function eliminarItemCarrito(productoId) {
    const usuarioActivo = typeof usuarioSesion !== 'undefined' && usuarioSesion !== null;

    if (!usuarioActivo) {
        let carrito = JSON.parse(localStorage.getItem('carrito_temp') || '[]');
        carrito = carrito.filter(i => i.id !== productoId);
        localStorage.setItem('carrito_temp', JSON.stringify(carrito));
        abrirCarrito(); 
        return;
    }

    try {
        const res = await fetch(`/api/carrito/${productoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            abrirCarrito();
        }
    } catch (error) {
        console.error('Error eliminando producto', error);
    }
}

// --- PASO 1: MOSTRAR FORMULARIO DE CHECKOUT ---
function irACheckout(totalMonto) {
    const panel = document.getElementById('carrito-panel');
    
    panel.innerHTML = `
        <div style="display:flex; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px;">
            <button onclick="abrirCarrito()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;margin-right:10px;">←</button>
            <h2 style="font-size:1.3rem; margin:0; color:#111827;">Confirmar Pedido</h2>
        </div>
        
        <div style="flex:1;">
            <div style="background:#f9fafb; padding:20px; border-radius:8px; margin-bottom:20px; text-align:center;">
                <p style="margin:0; color:#6b7280; font-size:0.9rem;">Total a pagar</p>
                <h3 style="margin:5px 0 0 0; color:#10b981; font-size:1.8rem;">$${totalMonto.toLocaleString('es-CO')}</h3>
            </div>

            <form id="form-checkout" onsubmit="procesarPago(event)">
                <label style="display:block; margin-bottom:5px; font-weight:600; color:#374151; font-size:0.9rem;">Dirección de Envío:</label>
                <input type="text" id="direccion-envio" placeholder="Ej: Cra 15 # 12-34, Bogotá" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:6px; margin-bottom:20px; font-family:inherit;">
                
                <div style="background:#eff6ff; padding:15px; border-radius:6px; border:1px solid #bfdbfe; margin-bottom:20px; display:flex; gap:10px;">
                    <img src="https://img.icons8.com/ios-filled/50/1e40af/info.png" style="width:20px; height:20px;">
                    <p style="margin:0; font-size:0.85rem; color:#1e40af;">
                        <strong>Nota:</strong> Al confirmar, procesaremos tu pedido en nuestro sistema y te enviaremos la factura por correo electrónico.
                    </p>
                </div>

                <button type="submit" id="btn-confirmar-pago" style="width:100%;padding:14px;background:#2196F3;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer; transition:0.3s;">
                    Confirmar Compra
                </button>
            </form>
        </div>
    `;
}

// --- PASO 2: ENVIAR EL PAGO AL BACKEND ---
async function procesarPago(event) {
    event.preventDefault();
    const direccion = document.getElementById('direccion-envio').value;
    const btnSubmit = document.getElementById('btn-confirmar-pago');
    
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Procesando...';

    try {
        const res = await fetch('/api/carrito/confirmar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ direccion_envio: direccion })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('carrito-panel').innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center;">
                    <img src="https://img.icons8.com/color/96/000000/ok--v1.png" style="margin-bottom:20px;">
                    <h2 style="color:#10b981; margin:0 0 10px 0;">¡Compra Exitosa!</h2>
                    <p style="color:#6b7280; margin-bottom:30px;">Tu pedido <strong>#${data.pedido_id}</strong> ha sido registrado. Revisa tu correo.</p>
                    <button onclick="document.getElementById('carrito-overlay').remove()" style="padding:10px 25px;background:#111827;color:#fff;border:none;border-radius:6px;cursor:pointer;">Cerrar</button>
                </div>
            `;
            localStorage.removeItem('carrito_temp');
            actualizarBadgeCarrito();
        } else {
            alert(`Error: ${data.mensaje}`);
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Confirmar Compra';
        }
    } catch (error) {
        console.error('Error confirmando compra:', error);
        alert('Ocurrió un error de conexión.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Confirmar Compra';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeCarrito();
});