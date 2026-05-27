const { pool } = require('../config/db');

// --- Crear reseña (solo compradores, solo 1 vez) ---
const agregarValoracion = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        const { producto_id, puntuacion, comentario } = req.body;

        if (!usuarioId) 
            return res.status(401).json({ mensaje: 'Inicia sesión para calificar' });
        if (puntuacion < 1 || puntuacion > 5) 
            return res.status(400).json({ mensaje: 'La puntuación debe ser entre 1 y 5 estrellas' });

        const verificacion = await pool.query(`
            SELECT p.id 
            FROM pedidos p
            JOIN pedido_items pi ON p.id = pi.pedido_id
            WHERE p.usuario_id = $1 
              AND pi.producto_id = $2 
              AND p.estado = 'Entregado'
            LIMIT 1
        `, [usuarioId, producto_id]);

        if (verificacion.rows.length === 0) {
            return res.status(403).json({ 
                mensaje: 'Solo puedes calificar productos que hayas comprado y recibido.' 
            });
        }

        await pool.query(
            'INSERT INTO valoraciones (usuario_id, producto_id, puntuacion, comentario) VALUES ($1, $2, $3, $4)',
            [usuarioId, producto_id, puntuacion, comentario]
        );

        await pool.query(`
            UPDATE productos 
            SET puntuacion_promedio = (
                SELECT ROUND(AVG(puntuacion), 2) FROM valoraciones WHERE producto_id = $1
            )
            WHERE id = $1
        `, [producto_id]);

        res.status(201).json({ mensaje: '¡Gracias por tu reseña!' });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ mensaje: 'Ya calificaste este producto.' });
        }
        console.error('Error al agregar valoración:', error);
        res.status(500).json({ mensaje: 'Error al procesar tu reseña' });
    }
};

// --- Obtener reseñas de un producto ---
const obtenerValoracionesProducto = async (req, res) => {
    try {
        const { producto_id } = req.params;

        const resultado = await pool.query(`
            SELECT 
                v.puntuacion, 
                v.comentario, 
                v.fecha,
                u.nombre AS autor
            FROM valoraciones v
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.producto_id = $1
            ORDER BY v.fecha DESC
        `, [producto_id]);

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener valoraciones:', error);
        res.status(500).json({ mensaje: 'Error al cargar las reseñas' });
    }
};

// --- Verificar si el usuario puede dejar reseña ---
const verificarPermisoResena = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        const { producto_id } = req.params;

        if (!usuarioId) return res.json({ puedeOpinar: false, motivo: 'no_sesion' });

        const yaReseno = await pool.query(
            'SELECT 1 FROM valoraciones WHERE usuario_id = $1 AND producto_id = $2',
            [usuarioId, producto_id]
        );
        if (yaReseno.rows.length > 0) 
            return res.json({ puedeOpinar: false, motivo: 'ya_reseno' });

        const compro = await pool.query(`
            SELECT 1
            FROM pedidos p
            JOIN pedido_items pi ON p.id = pi.pedido_id
            WHERE p.usuario_id = $1 
              AND pi.producto_id = $2 
              AND p.estado = 'Entregado'
            LIMIT 1
        `, [usuarioId, producto_id]);

        if (compro.rows.length === 0) 
            return res.json({ puedeOpinar: false, motivo: 'no_compro' });

        res.json({ puedeOpinar: true });

    } catch (error) {
        console.error('Error al verificar permiso de reseña:', error);
        res.status(500).json({ puedeOpinar: false, motivo: 'error' });
    }
};

// ← Solo funciones de valoraciones, nada de pedidos
module.exports = { 
    agregarValoracion, 
    obtenerValoracionesProducto,
    verificarPermisoResena     // ← nombre correcto, era verificarCompra antes
};