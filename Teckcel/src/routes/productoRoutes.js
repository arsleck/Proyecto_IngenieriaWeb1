const express = require('express');
const router = express.Router();
const { 
    crearProducto, 
    obtenerProductos, 
    actualizarProducto, 
    eliminarProducto, 
    obtenerTopVendidos, 
    obtenerTopDeseados 
} = require('../controllers/productoController');

// Importamos tus middlewares personalizados
const upload = require('../middlewares/uploadMiddleware');
const { verificarAdmin } = require('../middlewares/authMiddleware');

// --- RUTAS PÚBLICAS ---
// Cualquier cliente puede ver el catálogo y los tops
router.get('/', obtenerProductos);
router.get('/top-vendidos', obtenerTopVendidos);
router.get('/top-deseados', obtenerTopDeseados);

// --- RUTAS PRIVADAS (Solo Administrador) ---
// Orden de ejecución: 1. Verifica Admin -> 2. Procesa la foto (si hay) -> 3. Ejecuta Controlador

// Crear un nuevo producto
router.post('/', verificarAdmin, upload.single('imagen'), crearProducto);

// Actualizar un producto existente (Añadimos upload.single aquí también)
router.put('/:id', verificarAdmin, upload.single('imagen'), actualizarProducto);

// Eliminar un producto
router.delete('/:id', verificarAdmin, eliminarProducto);

module.exports = router;