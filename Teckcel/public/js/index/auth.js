// ==========================================
// VERIFICAR SESIÓN AL CARGAR LA PÁGINA
// ==========================================

// Usamos el objeto global window para evitar choques fatales con ui.js o catalogo.js
window.usuarioSesion = null;

document.addEventListener('DOMContentLoaded', verificarSesionActual);

async function verificarSesionActual() {
    try {
        const respuesta = await fetch('/api/usuarios/perfil', {
            method: 'GET',
            credentials: 'include'
        });

        if (respuesta.ok) {
            window.usuarioSesion = await respuesta.json();
            actualizarUIConUsuario(window.usuarioSesion);
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

function actualizarUIConUsuario(usuario) {
    const btnCuenta = document.querySelector('.user-btn');
    if (btnCuenta) {
        const avatar = btnCuenta.querySelector('.avatar');
        if (avatar) avatar.textContent = usuario.nombre.charAt(0).toUpperCase();
        
        btnCuenta.onclick = () => abrirModalCuenta();
    }

    if (usuario.rol === 'admin') {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('btn-admin-nav')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'btn-admin-nav';
            adminLink.href = '/html/admin.html';
            adminLink.className = 'nav-item';
            adminLink.style.cssText = 'color: #ff0076; font-weight: 700;';
            adminLink.innerHTML = `
                <img src="https://img.icons8.com/ios-filled/50/ff0076/settings.png" alt="Admin" class="nav-icon-img">
                <span>Admin</span>
            `;
            navLinks.appendChild(adminLink);
        }
    }
}

// Se mantiene ejecutarLogout para evitar que ui.js o index.html fallen si intentan llamarla
async function ejecutarLogout() {
    try {
        await fetch('/api/usuarios/logout', { method: 'POST', credentials: 'include' });
    } catch(e) {}
    window.location.reload();
}

// Alias para el nuevo diseño del modal
async function cerrarSesion() {
    await ejecutarLogout();
}

// ==========================================
// AUTENTICACIÓN Y MODALES
// ==========================================

function cerrarModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('hidden');
}

async function abrirModalCuenta() {
    const modalExistente = document.getElementById('overlay-cuenta-usuario');
    if (modalExistente) modalExistente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'overlay-cuenta-usuario';
    overlay.className = 'modal-overlay'; 
    overlay.style.display = 'flex';
    overlay.style.zIndex = '9999';
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    let contenidoHTML = '';
    
    if (window.usuarioSesion) {
        contenidoHTML = `
            <div class="search-modal" style="width: 90%; max-width: 400px; padding: 40px 20px; text-align: center; border-radius: 20px;">
                <div style="background: linear-gradient(135deg, #ff0076, #9c27b0); color: white; width: 65px; height: 65px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; margin: 0 auto 15px; box-shadow: 0 4px 15px rgba(255,0,118,0.3);">
                    ${window.usuarioSesion.nombre.charAt(0).toUpperCase()}
                </div>
                <h2 style="margin: 0; color: #111827; font-size: 1.4rem;">Hola, ${window.usuarioSesion.nombre}</h2>
                <p style="color: #6b7280; margin: 5px 0 25px 0; font-size: 0.95rem;">${window.usuarioSesion.email}</p>
                
                <button onclick="window.location.href='rastreo.html'" style="width: 100%; padding: 12px; background: #111827; color: #ffffff; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/delivery.png" style="width: 16px;">
                    Monitorear mi pedido actual
                </button>

                <button onclick="cerrarSesion()" style="width: 100%; padding: 12px; background: #fee2e2; color: #ef4444; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                    Cerrar Sesión
                </button>
            </div>
        `;
    } else {
        contenidoHTML = `
            <div class="search-modal" style="width: 90%; max-width: 400px; padding: 30px; border-radius: 20px;">
                <h2 style="text-align:center; margin-bottom: 20px; font-weight: 700; color: #111827;">Iniciar Sesión</h2>
                <form onsubmit="ejecutarLogin(event)">
                    <input type="email" id="login-email" placeholder="Correo electrónico" required class="input-light" style="margin-bottom: 15px;">
                    <input type="password" id="login-password" placeholder="Contraseña" required class="input-light" style="margin-bottom: 20px;">
                    <button type="submit" class="btn-primary-light">Entrar</button>
                </form>
                <p style="text-align: center; font-size: 0.9rem; color: #6b7280; margin-top: 20px;">
                    ¿No tienes cuenta? <a href="#" onclick="mostrarFormularioRegistro()" style="color: #ff0076; font-weight: bold; text-decoration: none;">Regístrate</a>
                </p>
            </div>
        `;
    }

    overlay.innerHTML = contenidoHTML;
    document.body.appendChild(overlay);
}

function mostrarFormularioLogin() {
    const overlayCuenta = document.getElementById('overlay-cuenta-usuario');
    if (overlayCuenta) overlayCuenta.remove();
    
    const contenido = document.getElementById('modal-contenido');
    if (!contenido) return;
    
    document.getElementById('modal-overlay').classList.remove('hidden');

    contenido.innerHTML = `
        <div style="position: relative;">
            <button onclick="cerrarModal()" style="position: absolute; right: 0; top: -10px; border: none; background: none; color: #666; cursor: pointer; font-size: 1.5em;">&times;</button>
            <h2 style="margin-bottom: 20px; color: #333;">Iniciar Sesión</h2>
            <form id="login-form" onsubmit="ejecutarLogin(event)">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #666;">Correo Electrónico:</label>
                    <input type="email" id="login-email" class="input-light" required>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #666;">Contraseña:</label>
                    <input type="password" id="login-password" class="input-light" required>
                </div>
                <button type="submit" class="btn-primary-light" style="margin-bottom: 15px;">Ingresar</button>
            </form>
            <p style="text-align: center; font-size: 0.9em; color: #666;">
                ¿No tienes cuenta? <a href="#" onclick="mostrarFormularioRegistro()" style="color: #ff0076; text-decoration: none; font-weight: bold;">Regístrate aquí</a>
            </p>
        </div>
    `;
}

function mostrarFormularioRegistro() {
    const overlayCuenta = document.getElementById('overlay-cuenta-usuario');
    if (overlayCuenta) overlayCuenta.remove();

    const contenido = document.getElementById('modal-contenido');
    if (!contenido) return;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
    
    contenido.innerHTML = `
        <div style="position: relative;">
            <button onclick="cerrarModal()" style="position: absolute; right: 0; top: -10px; border: none; background: none; color: #666; cursor: pointer; font-size: 1.5em;">&times;</button>
            <h2 style="margin-bottom: 20px; color: #333;">Crear Cuenta</h2>
            <form id="registro-form" onsubmit="ejecutarRegistro(event)">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #666;">Nombre Completo:</label>
                    <input type="text" id="reg-nombre" class="input-light" required>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #666;">Correo Electrónico:</label>
                    <input type="email" id="reg-email" class="input-light" required>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #666;">Contraseña:</label>
                    <input type="password" id="reg-password" class="input-light" required>
                </div>
                <button type="submit" class="btn-primary-light" style="margin-bottom: 15px;">Registrarme</button>
            </form>
            <p style="text-align: center; font-size: 0.9em; color: #666;">
                ¿Ya tienes cuenta? <a href="#" onclick="mostrarFormularioLogin()" style="color: #2196F3; text-decoration: none; font-weight: bold;">Inicia sesión</a>
            </p>
        </div>
    `;
}

async function ejecutarRegistro(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const respuesta = await fetch('/api/usuarios/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, rol: 'cliente' })
        });
        const data = await respuesta.json();
        if (respuesta.ok) {
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            mostrarFormularioLogin();
        } else {
            alert(data.mensaje || 'Error al registrar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function ejecutarLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const respuesta = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        
        const data = await respuesta.json();

        if (respuesta.ok) {
            const overlay = document.getElementById('overlay-cuenta-usuario');
            if(overlay) overlay.remove();
            cerrarModal();
            
            if (data.usuario.rol === 'admin') {
                window.location.href = '/html/admin.html';
            } else {
                window.location.reload(); 
            }
        } else {
            alert(data.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor.');
    }
}