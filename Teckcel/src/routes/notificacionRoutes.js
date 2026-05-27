const express = require('express');
const router = express.Router();
const { obtenerNotificaciones, marcarComoLeida } = require('../controllers/notificacionController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

router.get('/', verificarAutenticacion, obtenerNotificaciones);
router.put('/:id/leer', verificarAutenticacion, marcarComoLeida);

module.exports = router;