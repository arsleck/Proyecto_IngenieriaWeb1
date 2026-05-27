const { pool } = require('../config/db');
// 1. Importamos el servicio de correos
const { enviarConfirmacionCompra } = require('../services/emailService');

const agregarAlCarrito = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'Inicia sesión para agregar productos al carrito' });

        const { producto_id, cantidad } = req.body;

        // 1. Verificamos si el usuario ya tiene un carrito activo
        let carrito = await pool.query('SELECT id FROM carritos WHERE usuario_id = $1', [usuarioId]);
        
        // Si no tiene, se lo creamos
        if (carrito.rows.length === 0) {
            carrito = await pool.query('INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING id', [usuarioId]);
        }
        const carritoId = carrito.rows[0].id;

        // 2. Agregamos el producto. Si ya estaba en el carrito, sumamos la cantidad
        await pool.query(
            `INSERT INTO carrito_items (carrito_id, producto_id, cantidad) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (carrito_id, producto_id) 
             DO UPDATE SET cantidad = carrito_items.cantidad + EXCLUDED.cantidad`,
            [carritoId, producto_id, cantidad || 1]
        );

        res.status(200).json({ mensaje: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const confirmarCompra = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        const { direccion_envio } = req.body; 
        
        if (!usuarioId) return res.status(401).json({ mensaje: 'Debes iniciar sesión para comprar' });
        if (!direccion_envio) return res.status(400).json({ mensaje: 'La dirección de envío es obligatoria' });

        // 1. Calculamos el total leyendo los productos que hay en el carrito
        // ¡AQUÍ ESTÁ LA MAGIA! Traemos de una vez el nombre y la foto (imagen_url)
        const items = await pool.query(`
            SELECT ci.producto_id, ci.cantidad, p.precio, p.nombre, p.imagen_url 
            FROM carrito_items ci
            JOIN carritos c ON ci.carrito_id = c.id
            JOIN productos p ON ci.producto_id = p.id
            WHERE c.usuario_id = $1
        `, [usuarioId]);

        if (items.rows.length === 0) return res.status(400).json({ mensaje: 'Tu carrito está vacío' });

        let total = 0;
        items.rows.forEach(item => total += (parseFloat(item.precio) * parseInt(item.cantidad)));

        // 2. CREAMOS EL PEDIDO
        const nuevoPedido = await pool.query(
            'INSERT INTO pedidos (usuario_id, direccion_envio, total, estado) VALUES ($1, $2, $3, $4) RETURNING id',
            [usuarioId, direccion_envio, total, 'Pendiente']
        );
        const pedidoId = nuevoPedido.rows[0].id;

        // 3. Movemos los items al historial y ACTUALIZAMOS VENTAS
        for (let item of items.rows) {
            // A. Guardamos el item en el pedido
            await pool.query(
                'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedidoId, item.producto_id, item.cantidad, item.precio]
            );
            
            // B. Actualizamos el contador de ventas de este producto en el catálogo
            await pool.query(
                'UPDATE productos SET ventas_totales = ventas_totales + $1 WHERE id = $2',
                [item.cantidad, item.producto_id]
            );
        }

        // 4. Vaciamos el carrito
        await pool.query('DELETE FROM carritos WHERE usuario_id = $1', [usuarioId]);

        // 5. NOTIFICACIÓN POR CORREO (Nodemailer)
        // Buscamos el nombre y correo del cliente
        const usuario = await pool.query('SELECT nombre, email FROM usuarios WHERE id = $1', [usuarioId]);
        
        if (usuario.rows.length > 0) {
            // Le pasamos 'items.rows' (que ahora sí tiene nombre e imagen) al correo
            enviarConfirmacionCompra(
                usuario.rows[0].email, 
                usuario.rows[0].nombre, 
                pedidoId, 
                total,
                items.rows 
            );
        }

        res.status(201).json({ 
            mensaje: 'Compra exitosa. Tu paquete está listo para ser asignado a un repartidor y recibiste un correo de confirmación.', 
            pedido_id: pedidoId 
        });
    } catch (error) {
        console.error('Error al confirmar compra:', error);
        res.status(500).json({ mensaje: 'Error al procesar la compra' });
    }
};

// --- NUEVO: Obtener los productos del carrito del usuario ---
const obtenerCarrito = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: 'No autenticado' });

        const items = await pool.query(`
            SELECT ci.producto_id as id, ci.cantidad, p.precio, p.nombre, p.imagen_url 
            FROM carrito_items ci
            JOIN carritos c ON ci.carrito_id = c.id
            JOIN productos p ON ci.producto_id = p.id
            WHERE c.usuario_id = $1
        `, [usuarioId]);

        res.status(200).json(items.rows);
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ mensaje: 'Error al cargar el carrito' });
    }
};

// --- NUEVO: Eliminar un producto del carrito ---
const eliminarDelCarrito = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        const { producto_id } = req.params;

        if (!usuarioId) return res.status(401).json({ mensaje: 'No autenticado' });

        await pool.query(`
            DELETE FROM carrito_items 
            WHERE producto_id = $1 AND carrito_id = (SELECT id FROM carritos WHERE usuario_id = $2)
        `, [producto_id, usuarioId]);

        res.status(200).json({ mensaje: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
};

// Asegúrate de exportar TODAS las funciones al final:
module.exports = { agregarAlCarrito, confirmarCompra, obtenerCarrito, eliminarDelCarrito };
