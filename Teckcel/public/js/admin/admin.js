// ==========================================
// 1. SEGURIDAD Y ESTADO GLOBAL
// ==========================================

document.addEventListener('DOMContentLoaded', verificarAccesoAdmin);

async function verificarAccesoAdmin() {
    // ✅ try-catch SOLO para la verificación de seguridad
    try {
        const respuesta = await fetch('/api/usuarios/perfil', {
            method: 'GET',
            credentials: 'include'
        });

        console.log('Estado perfil:', respuesta.status);

        if (!respuesta.ok) {
            window.location.replace('/html/index.html');
            return;
        }

        const usuario = await respuesta.json();
        console.log('Usuario:', usuario);

        if (usuario.rol !== 'admin') {
            alert('Acceso denegado: Área exclusiva para la administración.');
            window.location.replace('/html/index.html');
            return;
        }

    } catch (error) {
        // Ahora solo llega aquí si FALLÓ la conexión al servidor
        console.error('Error verificando acceso:', error);
        window.location.replace('/html/index.html');
        return;
    }

    // ✅ Fuera del try-catch de seguridad
    // Si pasó la seguridad, cargamos la pantalla inicial (Productos)
    cargarProductosAdmin();
}

async function cerrarSesionAdmin() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        try {
            await fetch('/api/usuarios/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch(error) {
            console.error(error);
        }
        window.location.replace('/html/index.html');
    }
}

// ==========================================
// 2. NAVEGACIÓN DEL PANEL (LA FUNCIÓN QUE FALTABA)
// ==========================================

function mostrarSeccion(seccionId) {
    // 1. Ocultar todas las secciones
    document.getElementById('seccion-productos').classList.add('hidden');
    document.getElementById('seccion-pedidos').classList.add('hidden');
    document.getElementById('seccion-estadisticas').classList.add('hidden');
    
    // 2. Quitar la clase 'active' de todos los botones del menú lateral
    document.querySelectorAll('.admin-nav a').forEach(enlace => enlace.classList.remove('active'));

    // 3. Mostrar la sección seleccionada y activar su botón
    document.getElementById('seccion-' + seccionId).classList.remove('hidden');
    document.getElementById('nav-' + seccionId).classList.add('active');

    // 4. Cargar los datos correspondientes según la pestaña
    if (seccionId === 'productos') {
        cargarProductosAdmin(); // Función en admin_productos.js
    } 
    else if (seccionId === 'pedidos') {
        cargarPedidosAdmin();   // Función en admin_pedidos.js
    }
    else if (seccionId === 'estadisticas') {
        cargarEstadisticasAdmin();
    }
    // Más adelante pondremos la de estadísticas aquí
}