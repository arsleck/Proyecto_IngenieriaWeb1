// ============================================================
// STAR PICKER + ENVÍO DE VALORACIÓN
// Depende de: modalUtils.js
// ============================================================

let estrellaSeleccionada = 0;

function inicializarStarPicker() {
    estrellaSeleccionada = 0;
    const stars = document.querySelectorAll('#pd-star-picker span');
    if (!stars.length) return;

    stars.forEach(s => {
        s.addEventListener('mouseenter', () =>
            stars.forEach(x => x.classList.toggle('on', x.dataset.v <= s.dataset.v)));
        s.addEventListener('mouseleave', () =>
            stars.forEach(x => x.classList.toggle('on', x.dataset.v <= estrellaSeleccionada)));
        s.addEventListener('click', () => {
            estrellaSeleccionada = s.dataset.v;
            stars.forEach(x => x.classList.toggle('on', x.dataset.v <= estrellaSeleccionada));
        });
    });
}

async function enviarValoracion(productoId) {
    const comentario = document.getElementById('pd-comentario').value.trim();
    const msg        = document.getElementById('pd-form-msg');

    if (!estrellaSeleccionada || estrellaSeleccionada == 0) {
        msg.style.color = '#e53935';
        msg.textContent = 'Selecciona una calificación de estrellas.';
        return;
    }
    if (!comentario) {
        msg.style.color = '#e53935';
        msg.textContent = 'Escribe un comentario antes de publicar.';
        return;
    }

    const btn = document.querySelector('.pd-btn-enviar');
    btn.disabled    = true;
    btn.textContent = 'Publicando...';

    try {
        const res  = await fetch('/api/valoraciones', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                producto_id: productoId,
                puntuacion:  parseInt(estrellaSeleccionada),
                comentario
            })
        });
        const data = await res.json();

        if (res.ok) {
            document.getElementById('pd-form-wrap').innerHTML = `
                <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;color:#16a34a;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <img src="https://img.icons8.com/ios-filled/50/16a34a/checkmark--v1.png" style="width:20px;">
                    ¡Gracias por tu reseña! Ya está publicada.
                </div>`;
            await recargarListaResenas(productoId);

        } else if (res.status === 403) {
            document.getElementById('pd-form-wrap').innerHTML = `
                <div style="text-align:center;padding:16px;background:#fff7ed;border-radius:12px;color:#c2410c;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <img src="https://img.icons8.com/ios-filled/50/c2410c/box-important--v1.png" style="width:20px;">
                    ${data.mensaje}
                </div>`;
        } else {
            msg.style.color = '#e53935';
            msg.textContent = data.mensaje || 'Error al publicar la reseña.';
            btn.disabled    = false;
            btn.textContent = 'Publicar reseña';
        }
    } catch (_) {
        msg.style.color = '#e53935';
        msg.textContent = 'Error de conexión. Inténtalo de nuevo.';
        btn.disabled    = false;
        btn.textContent = 'Publicar reseña';
    }
}

async function recargarListaResenas(productoId) {
    try {
        const res = await fetch(`/api/valoraciones/producto/${productoId}`);
        if (!res.ok) return;
        const nuevas = await res.json();
        document.getElementById('pd-lista-resenas').innerHTML =
            nuevas.length === 0
                ? `<p style="color:#aaa;text-align:center;padding:20px 0;">Aún no hay reseñas.</p>`
                : nuevas.map(v => construirTarjetaResena(v)).join('');
    } catch (_) {}
}