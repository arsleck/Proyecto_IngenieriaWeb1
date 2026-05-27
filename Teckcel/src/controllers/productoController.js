const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');

// 👇 1. Importamos el disparador de notificaciones
const { dispararNotificacionCambioProducto } = require('./notificacionController');

// Ruta absoluta a la carpeta donde se guardarán las imágenes
const uploadDir = path.join(__dirname, '../../public/img/uploads/');

// Si la carpeta no existe, Node la crea automáticamente al iniciar el servidor
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- OBTENER TODOS LOS PRODUCTOS ---
const obtenerProductos = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        const pagina = parseInt(req.query.pagina) || 1;
        const offset = (pagina - 1) * limite; 
        const categoria = req.query.categoria;

        let queryBase = 'SELECT * FROM productos';
        let valores = [];

        if (categoria) {
            queryBase += ' WHERE categoria = $1';
            valores.push(categoria);
        }

        queryBase += ` ORDER BY fecha_creacion DESC LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`;
        valores.push(limite, offset);

        const resultado = await pool.query(queryBase, valores);

        res.status(200).json({
            pagina_actual: pagina,
            resultados_mostrados: resultado.rows.length,
            productos: resultado.rows
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ mensaje: 'Error al cargar el catálogo' });
    }
};

// --- CREAR UN PRODUCTO NUEVO ---
const crearProducto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ mensaje: 'La imagen del producto es obligatoria' });
    }

    try {
        const { nombre, descripcion, categoria, marca, precio, stock } = req.body;
        const imagen_url = `/img/uploads/${req.file.filename}`;

        const nuevoProducto = await pool.query(
            `INSERT INTO productos (nombre, descripcion, categoria, marca, precio, imagen_url, stock) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre, descripcion, categoria, marca, precio, imagen_url, stock]
        );

        res.status(201).json({
            mensaje: 'Producto agregado exitosamente al catálogo',
            producto: nuevoProducto.rows[0]
        });

    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al guardar el producto' });
    }
};

// --- ACTUALIZAR PRODUCTO (CON NOTIFICACIONES INTEGRADAS) ---
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, categoria, marca, precio, stock } = req.body;
        
        let query;
        let valores;

        if (req.file) {
            const nueva_imagen_url = `/img/uploads/${req.file.filename}`;
            query = `
                UPDATE productos 
                SET nombre = $1, descripcion = $2, categoria = $3, marca = $4, precio = $5, stock = $6, imagen_url = $7 
                WHERE id = $8
            `;
            valores = [nombre, descripcion, categoria, marca, precio, stock, nueva_imagen_url, id];
        } else {
            query = `
                UPDATE productos 
                SET nombre = $1, descripcion = $2, categoria = $3, marca = $4, precio = $5, stock = $6 
                WHERE id = $7
            `;
            valores = [nombre, descripcion, categoria, marca, precio, stock, id];
        }

        // Ejecutamos la actualización en la BD
        await pool.query(query, valores);

        // 👇 2. LÓGICA AUTOMÁTICA: Disparamos la notificación a los seguidores
        await dispararNotificacionCambioProducto(
            id, 
            `El producto "${nombre}" que tienes en tus Listas de Deseos ha sido actualizado (precio o stock modificado).`
        );

        res.json({ mensaje: "Producto actualizado correctamente" });

    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: "Error al actualizar el producto en la base de datos" });
    }
};

// --- ELIMINAR PRODUCTO ---
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ mensaje: "Producto eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};

// --- OBTENER LOS 5 MÁS VENDIDOS ---
const obtenerTopVendidos = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM productos ORDER BY ventas_totales DESC NULLS LAST LIMIT 5');
        res.json({ productos: resultado.rows });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener top vendidos' });
    }
};

// --- OBTENER LOS 5 MÁS DESEADOS ---
const obtenerTopDeseados = async (req, res) => {
    try {
        const query = `
            SELECT p.*, COUNT(f.producto_id) as total_likes 
            FROM productos p
            LEFT JOIN favoritos f ON p.id = f.producto_id
            GROUP BY p.id
            ORDER BY total_likes DESC
            LIMIT 5
        `;
        const resultado = await pool.query(query);
        res.json({ productos: resultado.rows });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener top deseados' });
    }
};

module.exports = { crearProducto, obtenerProductos, actualizarProducto, eliminarProducto, obtenerTopVendidos, obtenerTopDeseados };