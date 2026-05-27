const express = require('express');
const router = express.Router();

// 1. Agregamos obtenerMiPerfil aquí:
const { registrarUsuario, loginUsuario, actualizarPerfil, cerrarSesion, obtenerMiPerfil } = require('../controllers/usuarioController');

// Rutas públicas
router.post('/registrar', registrarUsuario);
router.post('/login', loginUsuario);

// Ruta para saber quién está logueado (LA NUEVA)
router.get('/perfil', obtenerMiPerfil);

// Rutas privadas
router.put('/perfil', actualizarPerfil);
router.post('/logout', cerrarSesion);

module.exports = router;