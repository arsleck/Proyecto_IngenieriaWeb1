const { pool } = require('../config/db');

// Obtener las notificaciones del usuario actual
const obtenerNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'No autenticado' });

        const resultado = await pool.query(
            'SELECT id, mensaje, leido, fecha_creacion FROM notificaciones WHERE usuario_id = $1 ORDER BY fecha_creacion DESC',
            [usuarioId]
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error al traer notificaciones:', error);
        res.status(500).json({ mensaje: 'Error al cargar notificaciones' });
    }
};

// Marcar una notificación como leída
const marcarComoLeida = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        const { id } = req.params;

        await pool.query(
            'UPDATE notificaciones SET leido = TRUE WHERE id = $1 AND usuario_id = $2',
            [id, usuarioId]
        );
        res.status(200).json({ mensaje: 'Notificación actualizada' });
    } catch (error) {
        console.error('Error al leer notificación:', error);
        res.status(500).json({ mensaje: 'Error al procesar la lectura' });
    }
};

// LÓGICA AUTOMÁTICA: Disparador para cambios en productos (Observer)
// Llama a esta función en tu productoController cuando el admin modifique precio o stock
// LÓGICA AUTOMÁTICA: Disparador para cambios en productos (Observer)
const dispararNotificacionCambioProducto = async (productoId, mensajeAlerta) => {
    try {
        // Encontramos todos los usuarios que tienen este producto guardado
        const seguidores = await pool.query('SELECT usuario_id FROM favoritos WHERE producto_id = $1', [productoId]);
        
        // 👇 ESTO ES NUEVO: Nos avisará en la terminal de Node
        console.log(`📣 [SISTEMA] El producto ID:${productoId} cambió. Se enviará alerta a ${seguidores.rows.length} seguidores.`);

        if (seguidores.rows.length === 0) return; // Si nadie lo sigue, terminamos aquí

        // Creamos la notificación personalizada
        const consultas = seguidores.rows.map(seguidor => {
            return pool.query(
                'INSERT INTO notificaciones (usuario_id, mensaje) VALUES ($1, $2)',
                [seguidor.usuario_id, mensajeAlerta]
            );
        });
        
        await Promise.all(consultas);
        console.log(`✅ [SISTEMA] Notificaciones guardadas en la BD exitosamente.`);
    } catch (error) {
        console.error('❌ Error en el disparador de notificaciones:', error);
    }
};



module.exports = { obtenerNotificaciones, marcarComoLeida, dispararNotificacionCambioProducto };