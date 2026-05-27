const { pool } = require('../config/db');

// 1. Guardia estricto: Solo para el panel de Administrador
const verificarAdmin = async (req, res, next) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) {
            return res.status(401).json({ mensaje: 'Acceso denegado. Debes iniciar sesión.' });
        }

        const resultado = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [usuarioId]);
        const rolUsuario = resultado.rows[0].rol;

        if (rolUsuario === 'admin') {
            next();
        } else {
            return res.status(403).json({ mensaje: 'Acceso prohibido. Requiere permisos de Administrador.' });
        }

    } catch (error) {
        console.error('Error en seguridad:', error);
        res.status(500).json({ mensaje: 'Error al verificar permisos' });
    }
};

// 2. Guardia normal: Para clientes (Carrito, Favoritos, Reseñas, etc.)
const verificarAutenticacion = (req, res, next) => {
    // Solo verificamos que la sesión exista, no importa el rol
    if (req.session && req.session.usuarioId) {
        next(); // Tiene sesión, lo dejamos pasar
    } else {
        res.status(401).json({ mensaje: 'Debes iniciar sesión para realizar esta acción' });
    }
};

// Exportamos AMBOS guardias
module.exports = { verificarAdmin, verificarAutenticacion };