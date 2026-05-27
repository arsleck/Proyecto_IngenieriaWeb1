const express = require('express');
const router = express.Router();

// Importamos las funciones desde tu controlador de pedidos
const {
    rastrearMisPedidos,
    obtenerPedidoActivo,
    avanzarEstadoPedido,
    actualizarEstadoPedido,
    obtenerTodosLosPedidos
} = require('../controllers/pedidoController'); // Ajusta la ruta si tu controlador se llama distinto

// ==========================================
// RUTAS DE PEDIDOS
// ==========================================

// Rutas para el cliente
router.get('/', rastrearMisPedidos);
router.get('/activo', obtenerPedidoActivo);
router.post('/avanzar', avanzarEstadoPedido);

// Rutas para el administrador
router.put('/actualizar', actualizarEstadoPedido);
router.get('/todos', obtenerTodosLosPedidos);

// Exportamos el router para que server.js lo pueda leer
module.exports = router;