const nodemailer = require('nodemailer');
const path = require('path');

// 1. Configuración del transportador de correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 2. Función A: Correo de Compra Exitosa (Con imágenes y tabla dinámica)
const enviarConfirmacionCompra = async (emailCliente, nombreCliente, pedidoId, total, items) => {
    // Generamos las filas de la tabla dinámicamente
    const filasProductos = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="cid:prod_${item.producto_id}" width="50" style="vertical-align: middle; margin-right: 10px; border-radius: 4px;">
                ${item.nombre}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio.toLocaleString('es-CO')}</td>
        </tr>
    `).join('');

    // Preparamos las imágenes adjuntas para que se vean en el cuerpo del correo
    // Preparamos las imágenes adjuntas SOLO si el producto realmente tiene una imagen_url
    const adjuntos = items
        .filter(item => item.imagen_url) // Filtramos los vacíos para evitar errores
        .map(item => ({
            filename: path.basename(item.imagen_url),
            // Aseguramos la ruta correcta dentro de la carpeta public
            path: path.join(__dirname, '../../public', item.imagen_url.replace(/^\//, '')),
            cid: `prod_${item.producto_id}`
        }));

    const opciones = {
        from: '"Teckcel UMB" <noreply@teckcel.com>',
        to: emailCliente,
        subject: `Confirmación de Pedido #${pedidoId} - Teckcel`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">¡Gracias por tu compra!</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hola <strong>${nombreCliente}</strong>, tu pedido ha sido procesado con éxito.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Cant.</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>${filasProductos}</tbody>
                    </table>
                    <div style="text-align: right; padding: 20px 0 0 0; font-size: 1.2em;">
                        <strong>Total: $${total.toLocaleString('es-CO')}</strong>
                    </div>
                </div>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 0.8em; color: #777;">
                    Teckcel - Proyecto de Ingeniería de Software UMB
                </div>
            </div>
        `,
        attachments: adjuntos
    };

    try {
        await transporter.sendMail(opciones);
        console.log(`📧 Correo detallado de compra enviado a: ${emailCliente}`);
    } catch (error) {
        console.error('❌ Error al enviar correo detallado:', error);
    }
};


// 3. Función B: Correo Dinámico de Cambio de Estado
const enviarCorreoEstadoPedido = async (emailCliente, nombreCliente, pedidoId, estado) => {
    let titulo = '';
    let mensaje = '';
    let color = '#2c3e50';

    // Personalizamos el correo según el estado
    if (estado === 'En tránsito') {
        titulo = '🚚 Tu pedido está en camino';
        mensaje = 'Tu paquete ha salido de nuestra bodega principal y está viajando hacia tu dirección.';
        color = '#3b82f6'; // Azul
    } else if (estado === 'En reparto') {
        titulo = '🛵 Tu pedido está en reparto';
        mensaje = '¡Prepárate! Nuestro mensajero tiene tu paquete y lo entregará hoy en tu dirección.';
        color = '#8b5cf6'; // Morado
    } else if (estado === 'Entregado') {
        titulo = '🎉 ¡Paquete Entregado!';
        mensaje = 'Nos alegra informarte que tu pedido aparece como entregado en nuestro sistema. ¡Esperamos que lo disfrutes mucho!<br><br>Tu opinión es muy importante, te invitamos a dejar una reseña en tu cuenta de Teckcel.';
        color = '#10b981'; // Verde
    } else {
        // Si el estado es "Pendiente" o no reconocido, no enviamos correo
        return; 
    }

    const opciones = {
        from: '"Teckcel UMB" <noreply@teckcel.com>',
        to: emailCliente,
        subject: `Actualización de tu pedido #${pedidoId} - ${estado}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: ${color}; text-align: center;">${titulo}</h2>
                <p>Hola <strong>${nombreCliente}</strong>,</p>
                <p>${mensaje}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Puedes hacer seguimiento de tus compras accediendo a la sección "Mis Pedidos" en tu cuenta.</p>
                <p style="color: #777; font-size: 0.9em;">Saludos,<br>El equipo de Teckcel</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(opciones);
        console.log(`📧 Correo de estado (${estado}) enviado a: ${emailCliente}`);
    } catch (error) {
        console.error(`❌ Error al enviar el correo de estado (${estado}):`, error);
    }
};

// 4. Exportamos ambas funciones al resto del sistema
module.exports = { enviarConfirmacionCompra, enviarCorreoEstadoPedido };