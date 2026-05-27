-- ========================================================================
-- 1. LIMPIEZA INICIAL (Ideal para entorno de desarrollo)
-- Elimina las tablas si ya existen para evitar errores al recrear el script
-- ========================================================================
DROP TABLE IF EXISTS carrito_items CASCADE;
DROP TABLE IF EXISTS carritos CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS valoraciones CASCADE;
DROP TABLE IF EXISTS busquedas CASCADE;
DROP TABLE IF EXISTS contacto CASCADE;
DROP TABLE IF EXISTS pedido_items CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
-- ========================================================================
-- 2. TABLA DE SESIONES (Express-session / Connect-pg-simple)
-- ========================================================================
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- ========================================================================
-- 3. CREACIÓN DE TABLAS PRINCIPALES
-- ========================================================================

-- Tabla de usuarios (Gestiona tanto clientes como al administrador)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente', -- Puede ser 'cliente' o 'admin'
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla del catálogo de dispositivos (La pieza central del proyecto)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL, -- Ej: 'celular', 'laptop'
    marca VARCHAR(50),              -- Ej: 'Samsung', 'Apple', 'Xiaomi'
    precio BIGINT NOT NULL,
    imagen_url VARCHAR(500),
    stock INTEGER DEFAULT 1,
    ventas_totales INTEGER DEFAULT 0,              -- Para la sección "Lo más vendido"
    puntuacion_promedio DECIMAL(3,2) DEFAULT 0.00, -- Para la sección "Mejor valorado"
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de valoraciones (Reseñas y puntajes de los usuarios)
CREATE TABLE valoraciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id) -- Garantiza que un usuario solo califique un producto una vez
);

-- Tabla de favoritos (Guardados para después)
CREATE TABLE favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- ========================================================================
-- 4. SISTEMA DE CARRITO DE COMPRAS
-- ========================================================================

-- Cabecera del carrito (De quién es)
CREATE TABLE carritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle del carrito (Qué productos tiene adentro)
CREATE TABLE carrito_items (
    id SERIAL PRIMARY KEY,
    carrito_id INTEGER REFERENCES carritos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    UNIQUE(carrito_id, producto_id) -- Si agrega el mismo, se actualiza 'cantidad', no se crea otra fila
);

-- ========================================================================
-- 5. SISTEMA DE PEDIDOS (HISTORIAL DE COMPRAS)
-- ========================================================================

-- Tabla principal del pedido (Rastreo)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'Pendiente', -- Estados: 'Pendiente', 'En tránsito', 'Entregado'
    direccion_envio TEXT NOT NULL,
    total BIGINT NOT NULL,
    fecha_pedido TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle de qué productos van en ese pedido
CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    cantidad INTEGER DEFAULT 1,
    precio_unitario BIGINT NOT NULL
);

-- ========================================================================
-- 6. TABLAS SECUNDARIAS
-- ========================================================================

-- Tabla de mensajes del formulario de contacto
CREATE TABLE contacto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mensaje TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial de búsquedas realizadas
CREATE TABLE busquedas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo VARCHAR(50),
    marca VARCHAR(50),
    presupuesto BIGINT,
    comentario TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- 7. ÍNDICES DE RENDIMIENTO
-- Aceleran las búsquedas frecuentes en la base de datos
-- ========================================================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_busquedas_usuario ON busquedas(usuario_id);
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);


-- ========================================================================
-- SISTEMA DE NOTIFICACIONES
-- ========================================================================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- 8. CONSULTAS DE CONFIGURACIÓN / PRUEBA
-- ========================================================================

-- Ejecuta esto para darte el poder de Admin si el usuario ya existe:
UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@teckcel.com';

-- Verifica el estado actual de los usuarios:
SELECT nombre, email, rol FROM usuarios;