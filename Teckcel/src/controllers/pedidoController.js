const { pool } = require('../config/db');
const { enviarCorreoEstadoPedido } = require('../services/emailService');

const rastrearMisPedidos = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'Inicia sesión' });

        const resultado = await pool.query(
            'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY fecha_pedido DESC',
            [usuarioId]
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar pedidos' });
    }
};

const obtenerPedidoActivo = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'Inicia sesión' });

        const resPedido = await pool.query(`
            SELECT id, estado, direccion_envio, total, fecha_pedido, fecha_actualizacion
            FROM pedidos
            WHERE usuario_id = $1
              AND estado IN ('Pendiente', 'En tránsito', 'En reparto')
            ORDER BY fecha_pedido DESC
            LIMIT 1
        `, [usuarioId]);

        if (resPedido.rows.length === 0) {
            return res.status(404).json({ pedido: null });
        }

        const pedido = resPedido.rows[0];

        const resItems = await pool.query(`
            SELECT 
                pi.cantidad,
                pi.precio_unitario,
                pr.id        AS producto_id,
                pr.nombre,
                pr.marca,
                pr.imagen_url,
                pr.categoria
            FROM pedido_items pi
            JOIN productos pr ON pi.producto_id = pr.id
            WHERE pi.pedido_id = $1
        `, [pedido.id]);

        pedido.items = resItems.rows;
        res.status(200).json({ pedido });
    } catch (error) {
        console.error('Error al obtener pedido activo:', error);
        res.status(500).json({ mensaje: 'Error al buscar pedido activo' });
    }
};

const avanzarEstadoPedido = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'No autorizado' });

        const { pedido_id, nuevo_estado } = req.body;

        const progresion = ['Pendiente', 'En tránsito', 'En reparto', 'Entregado'];
        if (!progresion.includes(nuevo_estado)) {
            return res.status(400).json({ mensaje: 'Estado no válido' });
        }

        const resPedido = await pool.query(
            'SELECT id, estado FROM pedidos WHERE id = $1 AND usuario_id = $2',
            [pedido_id, usuarioId]
        );
        if (resPedido.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        const idxActual = progresion.indexOf(resPedido.rows[0].estado);
        const idxNuevo  = progresion.indexOf(nuevo_estado);

        if (idxNuevo <= idxActual) {
            return res.status(200).json({ mensaje: 'Estado ya alcanzado', estado: resPedido.rows[0].estado });
        }

        await pool.query(
            'UPDATE pedidos SET estado = $1, fecha_actualizacion = NOW() WHERE id = $2',
            [nuevo_estado, pedido_id]
        );

        if (nuevo_estado !== 'Pendiente') {
            const resUsuario = await pool.query(
                'SELECT nombre, email FROM usuarios WHERE id = $1', [usuarioId]
            );
            if (resUsuario.rows.length > 0) {
                const { nombre, email } = resUsuario.rows[0];
                enviarCorreoEstadoPedido(email, nombre, pedido_id, nuevo_estado);
            }
        }

        res.status(200).json({ mensaje: 'Estado actualizado', estado: nuevo_estado });
    } catch (error) {
        console.error('Error al avanzar estado:', error);
        res.status(500).json({ mensaje: 'Error interno' });
    }
};

const actualizarEstadoPedido = async (req, res) => {
    try {
        if (req.session.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo administradores.' });
        }

        const { pedido_id, nuevo_estado } = req.body;

        const resultado = await pool.query(
            'UPDATE pedidos SET estado = $1, fecha_actualizacion = NOW() WHERE id = $2 RETURNING *',
            [nuevo_estado, pedido_id]
        );

        const pedidoActualizado = resultado.rows[0];

        if (nuevo_estado !== 'Pendiente') {
            const usuarioResult = await pool.query(
                'SELECT nombre, email FROM usuarios WHERE id = $1',
                [pedidoActualizado.usuario_id]
            );
            if (usuarioResult.rows.length > 0) {
                const { nombre, email } = usuarioResult.rows[0];
                enviarCorreoEstadoPedido(email, nombre, pedidoActualizado.id, nuevo_estado);
            }
        }

        res.status(200).json({ mensaje: 'Estado actualizado', pedido: pedidoActualizado });
    } catch (error) {
        console.error('Error al actualizar el pedido:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el pedido' });
    }
};

const obtenerTodosLosPedidos = async (req, res) => {
    try {
        if (req.session.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo administradores.' });
        }

        const resultado = await pool.query(`
            SELECT p.id, p.estado, p.direccion_envio, p.total, p.fecha_pedido,
                   u.nombre AS cliente, u.email
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_pedido DESC
        `);

        res.status(200).json({ pedidos: resultado.rows });
    } catch (error) {
        console.error('Error al obtener todos los pedidos:', error);
        res.status(500).json({ mensaje: 'Error al buscar los pedidos del sistema' });
    }
};

// ← exports siempre al final, después de todas las funciones
module.exports = {
    rastrearMisPedidos,
    obtenerPedidoActivo,
    avanzarEstadoPedido,
    actualizarEstadoPedido,
    obtenerTodosLosPedidos
};