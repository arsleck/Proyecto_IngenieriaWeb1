const { Pool } = require('pg');
require('dotenv').config();

// Creamos un "Pool" de conexiones usando los datos de tu archivo .env
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Función para probar la conexión cuando arranquemos el servidor
const conectarDB = async () => {
    try {
        const cliente = await pool.connect();
        console.log('✅ Base de datos teckcelUMB conectada exitosamente');
        cliente.release(); // Soltamos la conexión para que no se quede colgada
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        process.exit(1); // Detenemos el servidor si no hay base de datos
    }
};

module.exports = { pool, conectarDB };