const express = require('express');
const router = express.Router();
const { agregarAlCarrito, confirmarCompra, obtenerCarrito, eliminarDelCarrito } = require('../controllers/carritoController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware'); // Tu validador de sesión

// Obtener los productos del carrito
router.get('/', verificarAutenticacion, obtenerCarrito);

// Agregar producto
router.post('/', verificarAutenticacion, agregarAlCarrito);

// Eliminar producto
router.delete('/:producto_id', verificarAutenticacion, eliminarDelCarrito);

// Confirmar compra (Checkout)
router.post('/confirmar', verificarAutenticacion, confirmarCompra);

module.exports = router;