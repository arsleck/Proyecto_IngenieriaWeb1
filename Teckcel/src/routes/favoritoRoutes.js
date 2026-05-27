const express = require('express');
const router = express.Router();
const { alternarFavorito, obtenerFavoritos } = require('../controllers/favoritoController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

router.get('/', verificarAutenticacion, obtenerFavoritos);
router.post('/alternar', verificarAutenticacion, alternarFavorito);

module.exports = router;