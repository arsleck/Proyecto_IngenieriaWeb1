const express = require('express');
const router = express.Router();
const { obtenerResumenAdmin } = require('../controllers/estadisticasController'); // Ajusta el nombre de tu archivo
const { verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/resumen', verificarAdmin, obtenerResumenAdmin);

module.exports = router;