const express = require('express');
const router = express.Router();
const { agregarValoracion, obtenerValoracionesProducto, verificarPermisoResena } = require('../controllers/valoracionController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Ver reseñas de un producto
router.get('/producto/:producto_id', obtenerValoracionesProducto);

// NUEVA: Verificar si el usuario actual tiene permisos para reseñar
// Usamos una ruta pública (sin verificarAutenticacion) porque el controlador 
// ya se encarga de devolver 'no_sesion' si el usuario no está logueado.
router.get('/:producto_id/puede-opinar', verificarPermisoResena);

// Dejar una reseña
router.post('/', verificarAutenticacion, agregarValoracion);

module.exports = router;