// ==========================================
// UI HELPERS
// ==========================================

function mostrarToast(mensaje, tipo = 'success') {
    const colores  = { success: '#16a34a', error: '#dc2626', info: '#2563eb' };
    const iconos   = {
        success: 'https://img.icons8.com/ios-filled/20/ffffff/checkmark--v1.png',
        error:   'https://img.icons8.com/ios-filled/20/ffffff/cancel.png',
        info:    'https://img.icons8.com/ios-filled/20/ffffff/info.png'
    };
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:${colores[tipo]};color:#fff;padding:12px 22px;
        border-radius:12px;font-size:0.88rem;font-weight:600;
        display:flex;align-items:center;gap:8px;
        box-shadow:0 6px 20px rgba(0,0,0,0.2);z-index:9999;
        animation:fadeInUp 0.3s ease;
    `;
    toast.innerHTML = `<img src="${iconos[tipo]}" style="width:16px;height:16px;"> ${mensaje}`;

    if (!document.getElementById('toast-style')) {
        const s = document.createElement('style');
        s.id = 'toast-style';
        s.textContent = `@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
        document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function abrirNotificaciones() {
    mostrarToast('Sin notificaciones nuevas', 'info');
}