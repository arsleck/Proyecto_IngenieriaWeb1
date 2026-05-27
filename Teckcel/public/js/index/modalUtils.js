// ============================================================
// UTILIDADES COMPARTIDAS DEL MODAL
// ============================================================

function renderStars(puntuacion) {
    const llenas = Math.floor(puntuacion);
    const media  = puntuacion % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias);
}

function formatearFecha(fechaStr) {
    const diff = Date.now() - new Date(fechaStr).getTime();
    const dias  = Math.floor(diff / 86400000);
    if (dias === 0)  return 'hoy';
    if (dias === 1)  return 'hace 1 día';
    if (dias < 7)    return `hace ${dias} días`;
    if (dias < 30)   return `hace ${Math.floor(dias / 7)} semana${Math.floor(dias / 7) > 1 ? 's' : ''}`;
    return `hace ${Math.floor(dias / 30)} mes${Math.floor(dias / 30) > 1 ? 'es' : ''}`;
}