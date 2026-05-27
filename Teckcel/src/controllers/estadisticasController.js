const { pool } = require('../config/db');

const obtenerResumenAdmin = async (req, res) => {
    try {
        // Consultas paralelas para optimizar el rendimiento del servidor
        const [ingresos, totalPedidos, topVentas, totalClientes] = await Promise.all([
            pool.query('SELECT SUM(total) as total FROM pedidos'),
            pool.query('SELECT COUNT(*) as total FROM pedidos'),
            // Agregamos el cálculo matemático: (ventas_totales * precio)
            pool.query(`
                SELECT nombre, imagen_url, ventas_totales, 
                    (ventas_totales * precio) AS recaudacion_total 
                FROM productos 
                ORDER BY ventas_totales DESC 
                LIMIT 3
            `),
            pool.query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'cliente'")
        ]);
        res.status(200).json({
            mensaje: "Reporte ejecutivo generado",
            datos: {
                ingresos: parseInt(ingresos.rows[0].total || 0),
                pedidos: parseInt(totalPedidos.rows[0].total),
                clientes: parseInt(totalClientes.rows[0].total),
                ranking: topVentas.rows
            }
        });
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(500).json({ mensaje: 'Error al calcular métricas' });
    }
};

module.exports = { obtenerResumenAdmin };