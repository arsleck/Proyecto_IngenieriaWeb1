// ============================================================
// RASTREO DE PEDIDO EN TIEMPO REAL VÍAS REALES — TECKCEL
// ============================================================

document.addEventListener('DOMContentLoaded', verificarAccesoARastreo);

// VARIABLES GLOBALES DEL MAPA
let mapaInteractivo    = null;
let marcadorRepartidor = null;
let trackingInterval   = null;
let rutaPolilinea      = null;
let puntosRutaOSRM     = []; 

const UMB = { lat: 4.6444, lng: -74.0539 };
const ESTADOS_ORDEN = ['Pendiente', 'En tránsito', 'En reparto', 'Entregado'];

// ICONOS PROFESIONALES (Globales para que historial.js los pueda usar)
window.ICON_URLS = {
    'Pendiente':   'https://img.icons8.com/ios-filled/50/666666/task.png',
    'En tránsito': 'https://img.icons8.com/ios-filled/50/666666/box.png',
    'En reparto':  'https://img.icons8.com/ios-filled/50/666666/scooter.png',
    'Entregado':   'https://img.icons8.com/ios-filled/50/666666/checked.png',
    'tránsito_active': 'https://img.icons8.com/ios-filled/50/ff0076/box.png',
    'reparto_active':  'https://img.icons8.com/ios-filled/50/ff0076/scooter.png',
    'entregado_active':'https://img.icons8.com/ios-filled/50/ff0076/checked.png',
    'repartidor': 'https://img.icons8.com/ios-filled/50/ffffff/scooter.png',
    'central':    'https://img.icons8.com/ios-filled/50/ffffff/university.png',
    'hogar':      'https://img.icons8.com/ios-filled/50/ffffff/home.png',
    'mapa':       'https://img.icons8.com/ios-filled/50/666666/map.png',
    'historial':  'https://img.icons8.com/ios-filled/50/ffffff/time-machine.png',
    'estrella':   'https://img.icons8.com/ios-filled/50/ffffff/star.png'
};

async function verificarAccesoARastreo() {
    const contenedor = document.getElementById('pantalla-rastreo-dinamica');
    if (!contenedor) return;

    let pedido = null;
    try {
        const res = await fetch('/api/pedidos/activo', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            pedido = data.pedido || null;
        }
    } catch (_) {}

    contenedor.innerHTML = '';
    const seccionPrincipal = document.createElement('div');
    contenedor.appendChild(seccionPrincipal);

    if (!pedido) {
        renderizarSinPedido(seccionPrincipal);
    } else {
        await renderizarPantallaRastreo(seccionPrincipal, pedido);
    }

    // Llamamos a la función de historial (que ahora vivirá en historial.js)
    if (typeof crearSeccionHistorial === 'function') {
        crearSeccionHistorial(contenedor);
    }
}

function renderizarSinPedido(contenedor) {
    contenedor.innerHTML = `
        <div class="no-order-card">
            <div class="no-order-icon" style="padding:15px; background:#fee2e2; border-radius:50%; width:70px; height:70px; margin:0 auto 20px;">
                <img src="https://img.icons8.com/ios-filled/96/ef4444/cancel.png" alt="X" style="width:100%; height:100%; object-fit:contain;">
            </div>
            <h2>Sin pedidos activos</h2>
            <p>No encontramos despachos vinculados a tu cuenta. El rastreo se activa automáticamente tras confirmar una compra.</p>
            <button class="btn-ir-catalogo" onclick="window.location.href='index.html'" style="display:flex; align-items:center; justify-content:center; gap:8px; width:auto; margin:25px auto 0; padding:12px 24px;">
                 <img src="https://img.icons8.com/ios-filled/50/ffffff/open-box.png" style="width:18px; height:18px;">
                Explorar Catálogo
            </button>
        </div>`;
}

async function renderizarPantallaRastreo(contenedor, pedido) {
    const estado = pedido.estado;
    const numeroPedido  = `#${pedido.id}`;
    const direccion     = pedido.direccion_envio || 'Bogotá, Colombia';
    const items         = pedido.items || [];
    const total         = new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0 }).format(pedido.total);

    let activeIconUrl = window.ICON_URLS['Pendiente'];
    if (estado === 'En tránsito') activeIconUrl = window.ICON_URLS['tránsito_active'];
    else if (estado === 'En reparto') activeIconUrl = window.ICON_URLS['reparto_active'];
    else if (estado === 'Entregado') activeIconUrl = window.ICON_URLS['entregado_active'];

    contenedor.innerHTML = `
        <div class="rastreo-container">
            <div class="rastreo-header">
                <h1>Sigue tu Pedido en Vivo</h1>
                <p>Nuestros repartidores siguen la ruta optimizada vía satélite.</p>
            </div>
            <div class="rastreo-layout">
                <div class="rastreo-col-info">
                    <div class="rastreo-pedido-id">
                        <div>
                            <span class="label">Pedido</span>
                            <span class="value">${numeroPedido}</span>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                            <span class="estado-badge" style="display:flex; align-items:center; gap:6px;">
                                <img src="${activeIconUrl}" alt="*" style="width:15px; height:15px; filter: saturate(2);"> 
                                ${estado}
                            </span>
                            <button onclick="refrescarEstado()" class="user-btn-refrescar">
                                <img src="https://img.icons8.com/ios-filled/50/9ca3af/update-left-rotation.png" alt="🔄"> Actualizar
                            </button>
                        </div>
                    </div>
                    <div class="rastreo-timeline">
                        <div class="rastreo-timeline-title">Progreso de entrega</div>
                        ${construirTimeline(estado, pedido)}
                    </div>
                    <div class="rastreo-origen" style="display:flex; align-items:center; gap:10px;">
                         <img src="https://img.icons8.com/ios-filled/50/666666/marker.png" alt="📍" style="width:20px; height:20px;">
                        <div><span class="label">Dirección de entrega</span><strong>${direccion} Bogotá.</strong></div>
                    </div>
                    <div class="rastreo-origen" style="display:flex; align-items:center; gap:10px;">
                         <img src="https://img.icons8.com/ios-filled/50/666666/university.png" alt="🏛️" style="width:20px; height:20px;">
                        <div><span class="label">Central de despacho</span><strong>Universidad Manuela Beltrán (UMB)</strong></div>
                    </div>
                    <div class="rastreo-footer-info">
                        <div class="rastreo-operador">
                            <span class="label">Repartidor</span><strong>Andrés Murcia.</strong>
                        </div>
                        <div class="rastreo-eta">
                            <span class="label">Tiempo estimado</span>
                            <strong id="tiempo-envio-txt">${estado === 'Entregado' ? '0' : '--'}</strong>
                            <span>${estado === 'Entregado' ? 'Entregado ✓' : 'min restantes'}</span>
                        </div>
                    </div>
                    ${construirSeccionProductos(items, total, estado)}
                </div>
                <div class="rastreo-col-mapa">
                    <div class="mapa-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <img src="${window.ICON_URLS['mapa']}" alt="🗺️" style="width:18px; height:18px;">
                            <span>Ruta en tiempo real</span>
                        </div>
                        <div class="mapa-live-badge"><div class="mapa-live-dot"></div> EN VIVO</div>
                    </div>
                    <div id="mapa-interactivo" style="border-radius:0 0 12px 12px;"></div>
                </div>
            </div>
        </div>`;

    setTimeout(async () => {
        const coordsDestino = await geocodificarDireccion(direccion);
        inicializarMapaRastreoReal(UMB.lat, UMB.lng, coordsDestino.lat, coordsDestino.lng, estado, pedido.id);
    }, 200);
}

function construirTimeline(estadoActual, pedido) {
    const pasos = [
        { key: 'Pendiente',   label: 'Pedido confirmado',        sub: pedido ? formatearHora(pedido.fecha_pedido) : '' },
        { key: 'En tránsito', label: 'Preparado y despachado',     sub: 'Sede Central UMB' },
        { key: 'En reparto',  label: 'Andrés en camino',  sub: 'Ruta TeckCel' },
        { key: 'Entregado',   label: 'Completado ✓',                sub: estadoActual === 'Entregado' ? 'Gracias por tu compra' : 'Pendiente' }
    ];

    const idxActual = ESTADOS_ORDEN.indexOf(estadoActual);

    return pasos.map((paso, i) => {
        let clase = 'pending';
        let iconoUrl = window.ICON_URLS[paso.key]; 

        if (i < idxActual) { 
            clase = 'done'; 
            iconoUrl = window.ICON_URLS[paso.key]; 
        } else if (i === idxActual) { 
            clase = 'active'; 
            if (paso.key === 'En tránsito') iconoUrl = window.ICON_URLS['tránsito_active'];
            else if (paso.key === 'En reparto') iconoUrl = window.ICON_URLS['reparto_active'];
            else if (paso.key === 'Entregado') iconoUrl = window.ICON_URLS['entregado_active'];
        }

        let dotContent = `<img src="${iconoUrl}" alt="*" style="width:16px; height:16px; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">`;
        if (i < idxActual) dotContent = `✓`; 

        return `
        <div class="timeline-step ${clase}">
            <div class="timeline-dot" style="position:relative;">${dotContent}</div>
            <div class="timeline-text">
                <span class="tl-name">${paso.label}</span>
                <span class="tl-hora">${paso.sub}</span>
            </div>
        </div>`;
    }).join('');
}

function construirSeccionProductos(items, total, estadoActual) {
    if (!items || items.length === 0) return '';
    const listaItems = items.map(item => {
        const precio = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.precio_unitario * item.cantidad);
        return `
        <div class="rastreo-producto-item">
            <img src="${item.imagen_url || 'https://via.placeholder.com/44'}" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/44'">
            <div class="rastreo-producto-info">
                <span class="rastreo-producto-nombre">${item.nombre}</span>
                <span class="rastreo-producto-marca">${item.marca} · x${item.cantidad}</span>
            </div>
            <span class="rastreo-producto-precio">${precio}</span>
        </div>`;
    }).join('');

    const accionEntrega = estadoActual === 'Entregado'
        ? `<a href="index.html" class="btn-ir-catalogo" style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:14px; font-size:0.85rem; padding:10px;">
                <img src="${window.ICON_URLS['estrella']}" style="width:16px; height:16px;"> ✍️ Ir al catálogo para dejar tu reseña
           </a>`
        : `<p style="text-align:center; font-size:0.78rem; color:#9ca3af; margin-top:12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                <img src="https://img.icons8.com/ios-filled/50/9ca3af/info.png" style="width:14px; height:14px;"> El botón de reseña se activa al entregar.
           </p>`;

    return `
    <div class="rastreo-productos-wrap">
        <div class="rastreo-timeline-title" style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
             <img src="https://img.icons8.com/ios-filled/50/666666/buy.png" style="width:18px; height:18px;"> Productos en este pedido
        </div>
        <div class="rastreo-productos-lista">${listaItems}</div>
        <div class="rastreo-productos-total"><span>Total pagado</span><strong>${total}</strong></div>
        ${accionEntrega}
    </div>`;
}

async function inicializarMapaRastreoReal(latCentral, lngCentral, latDestino, lngDestino, estadoActual, pedidoId) {
    if (mapaInteractivo) {
        mapaInteractivo.remove();
        if (trackingInterval) clearInterval(trackingInterval);
    }
    mapaInteractivo = L.map('mapa-interactivo').setView([(latCentral + latDestino) / 2, (lngCentral + lngDestino) / 2], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapaInteractivo);

    L.marker([latCentral, lngCentral], { icon: crearIcono('#111827', window.ICON_URLS['central']) }).addTo(mapaInteractivo).bindPopup('<b>Central TeckCel UMB</b>');
    L.marker([latDestino, lngDestino], { icon: crearIcono('#2563eb', window.ICON_URLS['hogar']) }).addTo(mapaInteractivo).bindPopup('<b>Tu dirección de entrega</b>');

    const url = `https://router.project-osrm.org/route/v1/driving/${lngCentral},${latCentral};${lngDestino},${latDestino}?overview=full&geometries=geojson`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            puntosRutaOSRM = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            rutaPolilinea = L.geoJSON(data.routes[0].geometry, { style: { color: '#ff0076', weight: 4, opacity: 0.7, dashArray: '8, 6' } }).addTo(mapaInteractivo);
            mapaInteractivo.fitBounds(rutaPolilinea.getBounds(), { padding: [40, 40] });
            arrancarAnimacionSeguimientoCalles(estadoActual, pedidoId);
        } else {
            dibujarRutaRecta(latCentral, lngCentral, latDestino, lngDestino, estadoActual, pedidoId);
        }
    } catch (e) {
        dibujarRutaRecta(latCentral, lngCentral, latDestino, lngDestino, estadoActual, pedidoId);
    }
}

function arrancarAnimacionSeguimientoCalles(estadoActual, pedidoId) {
    if (puntosRutaOSRM.length < 2) return;
    if (estadoActual === 'Entregado') {
        const destinoFinal = puntosRutaOSRM[puntosRutaOSRM.length - 1];
        marcadorRepartidor = L.marker(destinoFinal, { icon: crearIcono('#16a34a', window.ICON_URLS['entregado_active']) })
            .addTo(mapaInteractivo).bindPopup('<b style="color:#16a34a">¡Paquete entregado! ✓</b>').openPopup();
        return;
    }

    marcadorRepartidor = L.marker(UMB, { icon: crearIcono('#ff0076', window.ICON_URLS['repartidor']) })
        .addTo(mapaInteractivo).bindPopup('<b>Andrés Murcia</b><br>En camino').openPopup();

    let indexActual = 0;
    const totalPuntos = puntosRutaOSRM.length;
    const estadosDisparados = new Set([estadoActual]);

    if (estadoActual === 'Pendiente') cambiarEstadoPorMapa(pedidoId, 'En tránsito', estadosDisparados);

    trackingInterval = setInterval(() => {
        indexActual++;
        if (indexActual >= totalPuntos) {
            clearInterval(trackingInterval);
            const destino = puntosRutaOSRM[totalPuntos - 1];
            marcadorRepartidor.setLatLng(destino);
            mapaInteractivo.setView(destino);
            marcadorRepartidor.bindPopup('<b style="color:#16a34a">¡Paquete entregado! ✓</b>').openPopup();
            cambiarEstadoPorMapa(pedidoId, 'Entregado', estadosDisparados);
            return;
        }
        const nuevoPunto = puntosRutaOSRM[indexActual];
        marcadorRepartidor.setLatLng(nuevoPunto);
        if (!mapaInteractivo.getBounds().contains(nuevoPunto)) mapaInteractivo.panTo(nuevoPunto);

        const progreso = indexActual / totalPuntos;
        if (progreso >= 0.5 && !estadosDisparados.has('En reparto')) cambiarEstadoPorMapa(pedidoId, 'En reparto', estadosDisparados);

        const txt = document.getElementById('tiempo-envio-txt');
        if (txt) txt.textContent = Math.ceil((totalPuntos - indexActual) * 0.4);
    }, 2000);
}

async function cambiarEstadoPorMapa(pedidoId, nuevoEstado, estadosDisparados) {
    if (!pedidoId || estadosDisparados.has(nuevoEstado)) return;
    estadosDisparados.add(nuevoEstado);
    try {
        const res = await fetch('/api/pedidos/avanzar', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ pedido_id: pedidoId, nuevo_estado: nuevoEstado })
        });
        if (res.ok) {
            const badge = document.querySelector('.estado-badge');
            if (badge) {
                let activeIconUrl = window.ICON_URLS['Pendiente'];
                if (nuevoEstado === 'En tránsito') activeIconUrl = window.ICON_URLS['tránsito_active'];
                else if (nuevoEstado === 'En reparto') activeIconUrl = window.ICON_URLS['reparto_active'];
                else if (nuevoEstado === 'Entregado') activeIconUrl = window.ICON_URLS['entregado_active'];
                badge.innerHTML = `<img src="${activeIconUrl}" alt="*" style="width:15px; height:15px; filter: saturate(2);"> ${nuevoEstado}`;
            }
            actualizarTimelineFrontend(nuevoEstado);
            if (nuevoEstado === 'Entregado') {
                const wrapProductos = document.querySelector('.rastreo-productos-wrap');
                if (wrapProductos) {
                    const msg = wrapProductos.querySelector('p[style*="9ca3af"]');
                    if (msg) msg.outerHTML = `<a href="index.html" class="btn-ir-catalogo" style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:14px; font-size:0.85rem; padding:10px;"><img src="${window.ICON_URLS['estrella']}" style="width:16px; height:16px;">✍️ Ir al catálogo para dejar tu reseña</a>`;
                }
                const etaTxt = document.getElementById('tiempo-envio-txt');
                if (etaTxt) { etaTxt.textContent = '0'; etaTxt.nextElementSibling.textContent = 'Entregado ✓'; }
            }
        }
    } catch (_) {}
}

function dibujarRutaRecta(lat1, lng1, lat2, lng2, estadoActual, pedidoId) {
    if (rutaPolilinea) mapaInteractivo.removeLayer(rutaPolilinea);
    rutaPolilinea = L.polyline([[lat1, lng1], [lat2, lng2]], { color: '#ff0076', weight: 4, dashArray: '8, 6', opacity: 0.7 }).addTo(mapaInteractivo);
    mapaInteractivo.fitBounds(rutaPolilinea.getBounds(), { padding: [40, 40] });
    
    puntosRutaOSRM = [];
    for (let i = 0; i <= 20; i++) {
        puntosRutaOSRM.push([lat1 + (lat2 - lat1) * (i / 20), lng1 + (lng2 - lng1) * (i / 20)]);
    }
    arrancarAnimacionSeguimientoCalles(estadoActual, pedidoId);
}

function actualizarTimelineFrontend(nuevoEstado) {
    const pasos = document.querySelectorAll('.timeline-step');
    const idxNuevo = ESTADOS_ORDEN.indexOf(nuevoEstado);
    pasos.forEach((paso, i) => {
        paso.classList.remove('done', 'active', 'pending');
        let iconoUrl = window.ICON_URLS[ESTADOS_ORDEN[i]]; 
        if (i < idxNuevo) paso.classList.add('done');
        else if (i === idxNuevo) {
            paso.classList.add('active');
            if (nuevoEstado === 'En tránsito') iconoUrl = window.ICON_URLS['tránsito_active'];
            else if (nuevoEstado === 'En reparto') iconoUrl = window.ICON_URLS['reparto_active'];
            else if (nuevoEstado === 'Entregado') iconoUrl = window.ICON_URLS['entregado_active'];
        } else paso.classList.add('pending');

        const dot = paso.querySelector('.timeline-dot');
        if (dot) {
            if (i < idxNuevo) dot.textContent = '✓'; 
            else dot.innerHTML = `<img src="${iconoUrl}" alt="*" style="width:16px; height:16px; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">`;
        }
    });
}
// ── FUNCIÓN GEOCODIFICADORA ANTI-FALLOS (SISTEMA HEURÍSTICO) ──────────
async function geocodificarDireccion(direccion) {
    // 1. DICCIONARIO DE LOCALIDADES (Red de seguridad interna)
    // Si la API colapsa o no encuentra la calle, buscaremos estas palabras clave.
    const ZONAS_BOGOTA = {
        'usaquen': {lat: 4.7300, lng: -74.0300},
        'chapinero': {lat: 4.6460, lng: -74.0600},
        'santa fe': {lat: 4.6050, lng: -74.0660},
        'san cristobal': {lat: 4.5600, lng: -74.0800},
        'usme': {lat: 4.4500, lng: -74.1100},
        'tunjuelito': {lat: 4.5800, lng: -74.1400},
        'bosa': {lat: 4.6100, lng: -74.1900},
        'kennedy': {lat: 4.6300, lng: -74.1500},
        'fontibon': {lat: 4.6700, lng: -74.1400},
        'engativa': {lat: 4.7000, lng: -74.1000},
        'suba': {lat: 4.7400, lng: -74.0800},
        'barrios unidos': {lat: 4.6600, lng: -74.0700},
        'teusaquillo': {lat: 4.6400, lng: -74.0850},
        'martires': {lat: 4.6000, lng: -74.0850},
        'antonio narino': {lat: 4.5850, lng: -74.1000},
        'puente aranda': {lat: 4.6150, lng: -74.1100},
        'candelaria': {lat: 4.5950, lng: -74.0750},
        'rafael uribe': {lat: 4.5650, lng: -74.1150},
        'ciudad bolivar': {lat: 4.5300, lng: -74.1600}
    };

    // Coordenada absoluta de emergencia (Centro de la ciudad)
    const fallbackAbsoluto = { lat: 4.6097, lng: -74.0817 }; 
    if (!direccion || direccion.trim() === '') return fallbackAbsoluto;

    // 2. LIMPIEZA Y NORMALIZACIÓN EXTREMA
    let limpia = direccion
        .replace(/\bAc\.?\b/gi, 'Calle')        
        .replace(/\bAk\.?\b/gi, 'Carrera')      
        .replace(/\bCl\.?\b/gi, 'Calle')
        .replace(/\bCra?\.?\b|\bKr\.?\b|\bKrr\.?\b/gi, 'Carrera')
        .replace(/\bAv\.?\b/gi, 'Avenida')
        .replace(/\bDg\.?\b/gi, 'Diagonal')
        .replace(/\bTv\.?\b/gi, 'Transversal')
        .replace(/\bMz\.?\b|\bManzana\b/gi, ' ') // Mapas libres odian Mz, Lt, Int
        .replace(/\bLt\.?\b|\bLote\b/gi, ' ')
        .replace(/\bInt\.?\b|\bInterior\b/gi, ' ')
        .replace(/\bBl\.?\b|\bBloque\b/gi, ' ')
        // Quitamos la lista de zonas de la cadena de búsqueda exacta
        .replace(/bogot[aá]|colombia/gi, '')
        .replace(/chapinero|usaqu[eé]n|suba|engativ[aá]|fontib[oó]n|kennedy|bosa|tunjuelito|usme|ciudad bol[ií]var|teusaquillo/gi, '') 
        .replace(/#/g, '')          
        .replace(/\s*-\s*/g, ' ')   
        .replace(/No\.?\s*/gi, '')  
        .replace(/,/g, ' ')         
        .replace(/\s{2,}/g, ' ')    
        .trim();

    // 3. ESTRATEGIA DE DEGRADACIÓN ESPACIAL
    let partes = limpia.split(' ');
    
    // Variante A: Esquina
    let interseccion = limpia;
    if (partes.length >= 3 && !isNaN(partes[partes.length - 1])) {
        interseccion = partes.slice(0, -1).join(' '); 
    }

    // Variante B: Vía Principal
    let callePrincipal = limpia;
    if (partes.length >= 4) {
        callePrincipal = partes.slice(0, 4).join(' ');
    }

    const variantes = [
        `${limpia}, Bogotá, Colombia`,           // Nivel 1: Dirección completa
        `${interseccion}, Bogotá, Colombia`,     // Nivel 2: Intersección (Esquina)
        `${callePrincipal}, Bogotá, Colombia`    // Nivel 3: Solo la vía principal
    ];

    // 4. CONSULTAS A LA API
    for (const query of variantes) {
        try {
            const queryLimpia = query.replace(/\s{2,}/g, ' ').trim();
            const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryLimpia)}&format=json&limit=1&countrycodes=co`;
            
            const res  = await fetch(url, {
                headers: { 'Accept-Language': 'es', 'User-Agent': 'TeckcelUMB/2.0' }
            });
            const data = await res.json();

            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                // Validación estricta: Cuadro delimitador (Bounding Box) de la ciudad
                if (lat > 4.45 && lat < 4.85 && lng > -74.25 && lng < -73.99) {
                    console.log(`✅ Coordenada API encontrada vía: "${queryLimpia}"`);
                    return { lat, lng };
                }
            }
        } catch (_) {
            // Ignoramos errores de red y pasamos a la siguiente variante
        }
    }

    // 5. SISTEMA HEURÍSTICO (El salvavidas si la API falla por completo)
    // Escaneamos el texto que escribió el cliente buscando coincidencias con las zonas conocidas.
    const dirMinusculas = direccion.toLowerCase();
    
    for (const [zona, coordenadas] of Object.entries(ZONAS_BOGOTA)) {
        // Normalizamos la zona quitando tildes para la comparación
        const zonaNormalizada = zona.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (dirMinusculas.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(zonaNormalizada)) {
            console.warn(`⚠️ API falló. Usando centro de localidad [${zona.toUpperCase()}] por inferencia de texto.`);
            return coordenadas;
        }
    }

    // 6. ÚLTIMO RECURSO ABSOLUTO
    console.error(`🚨 Fallo total de rastreo para "${direccion}". Usando punto cero.`);
    return fallbackAbsoluto;
}
// ── NUEVA FUNCIÓN GEOCODIFICADORA (ESPECIAL PARA COLOMBIA) ──────────
async function geocodificarDireccion(direccion) {
    const fallback = { lat: 4.6950, lng: -74.0820 }; // Engativá solo si todo falla
    if (!direccion || direccion.trim() === '') return fallback;

    // 1. Limpiamos y estandarizamos la dirección
    let limpia = direccion
        .replace(/\bCl\.?\b/gi,  'Calle')
        .replace(/\bCra?\.?\b|\bKr\.?\b|\bKrr\.?\b/gi, 'Carrera')
        .replace(/\bAv\.?\b/gi,  'Avenida')
        .replace(/\bDg\.?\b/gi,  'Diagonal')
        .replace(/\bTv\.?\b/gi,  'Transversal')
        .replace(/bogot[aá]/gi, '') 
        .replace(/#/g, '')          
        .replace(/\s*-\s*/g, ' ')   
        .replace(/No\.?\s*/gi, '')  
        .replace(/\s{2,}/g, ' ')    
        .trim();

    // 2. TRUCO PARA COLOMBIA: Extraer solo la intersección
    // Si dice "Carrera 13 54 56", le quitamos el "56" para que busque "Carrera 13 54" (la esquina)
    let partes = limpia.split(' ');
    let interseccion = limpia;
    
    // Verificamos si la última parte es un número (la puerta) y se la quitamos
    if (partes.length >= 3 && !isNaN(partes[partes.length - 1])) {
        interseccion = partes.slice(0, - 1).join(' '); 
    }

    // 3. Intentamos 3 variantes, de más exacta a más general
    const variantes = [
        `${limpia}, Bogotá, Colombia`,        // Intento 1: La casa exacta (Ej: Carrera 13 54 56)
        `${interseccion}, Bogotá, Colombia`,  // Intento 2: La esquina de la cuadra (Ej: Carrera 13 54)
        `${direccion}, Bogotá, Colombia`      // Intento 3: Lo que escribió el usuario tal cual
    ];

    for (const query of variantes) {
        try {
            const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=co`;
            const res  = await fetch(url, {
                headers: { 'Accept-Language': 'es', 'User-Agent': 'TeckcelUMB/1.0' }
            });
            const data = await res.json();

            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                // Verificamos que no nos mande a otra ciudad por error
                const enBogota = lat > 4.45 && lat < 4.85 && lng > -74.25 && lng < -73.99;
                
                if (enBogota) {
                    console.log(`✅ Ubicado en el mapa usando: "${query}"`);
                    return { lat, lng };
                }
            }
        } catch (_) {}
    }

    console.warn(`⚠️ OpenStreetMap no reconoce "${direccion}". Usando coordenada por defecto.`);
    return fallback;
}

function crearIcono(color, iconUrl) {
    return L.divIcon({
        html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.25);position:relative;">
                <img src="${iconUrl}" alt="*" style="width:16px; height:16px; object-fit:contain;">
               </div>`,
        className: '', iconSize: [34, 34], iconAnchor: [17, 17]
    });
}

async function refrescarEstado() {
    const btn = document.querySelector('.user-btn-refrescar');
    if (btn) { btn.innerHTML = '...'; btn.disabled = true; }
    try {
        const res = await fetch('/api/pedidos/activo', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.pedido) {
                const badge = document.querySelector('.estado-badge');
                if (badge) {
                     let activeIconUrl = window.ICON_URLS['Pendiente'];
                    if (data.pedido.estado === 'En tránsito') activeIconUrl = window.ICON_URLS['tránsito_active'];
                    else if (data.pedido.estado === 'En reparto') activeIconUrl = window.ICON_URLS['reparto_active'];
                    else if (data.pedido.estado === 'Entregado') activeIconUrl = window.ICON_URLS['entregado_active'];
                    badge.innerHTML = `<img src="${activeIconUrl}" alt="*" style="width:15px; height:15px; filter: saturate(2);"> ${data.pedido.estado}`;
                }
                document.querySelector('.rastreo-timeline').innerHTML = `<div class="rastreo-timeline-title">Progreso de entrega</div>` + construirTimeline(data.pedido.estado, data.pedido);
            }
        }
    } catch (_) {}
    if (btn) { btn.innerHTML = '<img src="https://img.icons8.com/ios-filled/50/9ca3af/update-left-rotation.png" alt="🔄">Actualizar'; btn.disabled = false; }
}

function formatearHora(fecha) {
    return new Date(fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}