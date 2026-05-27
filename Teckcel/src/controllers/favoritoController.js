const { pool } = require('../config/db');

// Alterna un producto en la lista de favoritos (añadir/quitar)
const alternarFavorito = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        const { producto_id } = req.body;

        if (!usuarioId) return res.status(401).json({ mensaje: 'Inicia sesión para gestionar tus listas' });

        const existe = await pool.query(
            'SELECT 1 FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
            [usuarioId, producto_id]
        );

        if (existe.rows.length > 0) {
            await pool.query('DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2', [usuarioId, producto_id]);
            return res.status(200).json({ mensaje: 'Eliminado de tus listas', esFavorito: false });
        } else {
            await pool.query('INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2)', [usuarioId, producto_id]);
            return res.status(201).json({ mensaje: 'Agregado a tus listas', esFavorito: true });
        }
    } catch (error) {
        console.error('Error en favoritos:', error);
        res.status(500).json({ mensaje: 'Error al procesar la lista' });
    }
};

// Obtiene todos los productos favoritos del usuario logueado
const obtenerFavoritos = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'No autenticado' });

        const resultado = await pool.query(`
            SELECT p.id, p.nombre, p.precio, p.imagen_url, p.marca
            FROM favoritos f
            JOIN productos p ON f.producto_id = p.id
            WHERE f.usuario_id = $1
        `, [usuarioId]);

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ mensaje: 'Error al cargar tus listas' });
    }
};

module.exports = { alternarFavorito, obtenerFavoritos };