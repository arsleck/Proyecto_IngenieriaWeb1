const { pool } = require('../config/db');
const bcrypt = require('bcryptjs'); // Solo dejamos una importación limpia

// --- FUNCIÓN DE REGISTRO ---
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email, rol',
            [nombre, email, passwordHash]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

// --- FUNCIÓN DE LOGIN ---
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (resultado.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const usuario = resultado.rows[0];
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        req.session.usuarioId = usuario.id;
        req.session.rol = usuario.rol;

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

// --- FUNCIÓN DE ACTUALIZAR PERFIL ---
const actualizarPerfil = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensaje: "Inicia sesión primero" });

        const { nombre, password } = req.body;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            await pool.query('UPDATE usuarios SET nombre = $1, password_hash = $2 WHERE id = $3', [nombre, hashed, usuarioId]);
        } else {
            await pool.query('UPDATE usuarios SET nombre = $1 WHERE id = $2', [nombre, usuarioId]);
        }
        res.json({ mensaje: "Perfil actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar perfil" });
    }
};

// --- FUNCIÓN DE CERRAR SESIÓN ---
const cerrarSesion = (req, res) => {
    // req.session.destroy elimina la sesión de la base de datos de PostgreSQL
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).json({ mensaje: 'No se pudo cerrar la sesión' });
        }
        // Limpiamos la cookie del navegador (o de tu archivo cookies.txt)
        res.clearCookie('connect.sid'); 
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    });
};

// --- FUNCIÓN OBTENER PERFIL ---
const obtenerMiPerfil = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;
        
        // Si no hay sesión en la base de datos, le decimos a la web que no hay nadie logueado
        if (!usuarioId) {
            return res.status(401).json({ mensaje: 'No hay sesión activa' });
        }

        // Si sí hay sesión, buscamos su nombre y datos
        const resultado = await pool.query('SELECT nombre, email, rol FROM usuarios WHERE id = $1', [usuarioId]);
        
        if (resultado.rows.length > 0) {
            res.status(200).json(resultado.rows[0]);
        } else {
            res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ mensaje: 'Error al obtener perfil' });
    }
};

// Agrega obtenerMiPerfil al final
module.exports = { registrarUsuario, loginUsuario, actualizarPerfil, cerrarSesion, obtenerMiPerfil };