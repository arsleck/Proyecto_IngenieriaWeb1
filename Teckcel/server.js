const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const { conectarDB, pool } = require('./src/config/db');

const app = express();
conectarDB();

// ✅ CORS correcto para desarrollo local con cookies
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ UNA SOLA sesión, completa y correcta
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'teckcel_secret_umb',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.get('/', (req, res) => {
    res.json({ mensaje: '🚀 Servidor de TeckcelUMB funcionando al 100%' });
});

// ✅ RUTAS (Todas agrupadas y ordenadas)
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', productoRoutes);

const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const favoritoRoutes = require('./src/routes/favoritoRoutes');
app.use('/api/favoritos', favoritoRoutes);

const pedidoRoutes = require('./src/routes/pedidoRoutes');
app.use('/api/pedidos', pedidoRoutes);

const carritoRoutes = require('./src/routes/carritoRoutes');
app.use('/api/carrito', carritoRoutes);

const estadisticasRoutes = require('./src/routes/estadisticasRoutes');
app.use('/api/estadisticas', estadisticasRoutes);

const valoracionRoutes = require('./src/routes/valoracionRoutes');
app.use('/api/valoraciones', valoracionRoutes);

// Las nuevas líneas que conectan el frontend con la base de datos
const notificacionRoutes = require('./src/routes/notificacionRoutes');
app.use('/api/notificaciones', notificacionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});