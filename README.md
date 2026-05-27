# TeckCel - Plataforma Integral de E-Commerce y Rastreo Logístico

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2016-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D%2012-blue)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express-%E2%89%A54.22.2-000)](https://expressjs.com/)

## Tabla de Contenidos
- [TeckCel - Plataforma Integral de E-Commerce y Rastreo Logístico](#-teckcel---plataforma-integral-de-e-commerce-y-rastreo-logístico)
- [Tabla de Contenidos](#-tabla-de-contenidos)
- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso](#-uso)
- [API REST - Endpoints](#-api-rest---endpoints)
- [Base de Datos](#-base-de-datos)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Seguridad Implementada](#-seguridad-implementada)
- [Variables de Entorno](#-variables-de-entorno)
- [Pruebas](#-pruebas)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Changelog](#-changelog)
- [Notas de Seguridad](#-notas-de-seguridad)
- [Checklist Antes de Entregar](#-checklist-antes-de-entregar)
- [Recursos Adicionales](#-recursos-adicionales)

---

## Descripción del Proyecto

**TeckCel** es una aplicación web Full Stack diseñada para la consulta, compra y seguimiento logístico de dispositivos tecnológicos (teléfonos móviles y laptops). La plataforma integra funcionalidades de e-commerce, autenticación de usuarios, panel administrativo y simulación de rastreo satelital en tiempo real mediante mapas interactivos.

Desarrollado como proyecto final para la asignatura **Ingeniería Web I** en la Universidad Manuela Beltrán (UMB), este proyecto aplica arquitecturas cliente-servidor, APIs REST, geocodificación y persistencia de datos relacional utilizando PostgreSQL.

## Características Principales

### Módulo Cliente
- Catálogo dinámico de productos con filtros y búsqueda
- Carrito de compras funcional
- Registro e inicio de sesión seguro con JWT
- Rastreo satelital en tiempo real con Leaflet.js
- Estimación de tiempo de llegada (ETA) dinámico
- Historial de pedidos
- Sistema de calificaciones y reseñas
- Sistema de favoritos

### Módulo Administrativo
- Panel exclusivo para administradores
- Gestión global de pedidos
- Actualización manual de estados de pedidos
- Estadísticas de ventas y productos
- Sistema de notificaciones

## 🛠️ Tecnologías Utilizadas

| Tecnología | Descripción |
|------------|-------------|
| **HTML5** | Estructura semántica |
| **CSS3** | Diseño responsivo, Grid, Flexbox, animaciones |
| **JavaScript (ES6+)** | Fetch API, DOM, lógica cliente |
| **Leaflet.js** | Renderización de mapas interactivos |
| **Node.js** | Entorno backend |
| **Express.js** | API REST y servidor |
| **PostgreSQL** | Base de datos relacional |
| **node-postgres (pg)** | Integración con PostgreSQL |
| **bcryptjs** | Hash seguro de contraseñas |
| **express-session** | Manejo de sesiones |
| **connect-pg-simple** | Almacenamiento de sesiones en PostgreSQL |
| **CORS** | Configuración de recursos compartidos |
| **Dotenv** | Gestión de variables de entorno |
| **Nodemon** | Desarrollo con recarga automática |
| **OSRM API** | Cálculo de rutas y ETA logístico |
| **Nominatim API** | Geocodificación de direcciones |

## Requisitos Previos

Antes de instalar, asegúrate de tener instalado en tu sistema:

- **Node.js** (v16 o superior recomendado)
- **PostgreSQL** (v12 o superior)
- **pgAdmin 4** (opcional, para gestión gráfica de BD)
- **Git** (para clonar el repositorio)
- **npm** (v6 o superior, viene con Node.js)

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/arsleck/Proyecto_IngenieriaWeb1.git
cd Proyecto_IngenieriaWeb1/Teckcel
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Luego edita el archivo `.env` con tus configuraciones:

```env
# Configuración de la Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teckcel
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres

# Seguridad
SESSION_SECRET=tu_secreto_super_secreto_aqui_2026

# Servidor
PORT=3000
```

> **Importante**: Cambia `tu_contraseña_de_postgres` por tu contraseña real de PostgreSQL y `tu_secreto_super_secreto_aqui_2026` por una cadena aleatoria segura.

### 4. Configurar la base de datos

#### Opción A: Usando psql (línea de comandos)

```bash
# Conectar a PostgreSQL
psql -U postgres

# Dentro de psql, crear la base de datos
CREATE DATABASE teckcel;

# Salir de psql
\q

# Ejecutar el esquema de base de datos
psql -U postgres -d teckcel -f db/schema.sql
```

#### Opción B: Usando pgAdmin 4

1. Abrir **pgAdmin 4**
2. Conectar al servidor PostgreSQL
3. Crear una base de datos llamada `teckcel`
4. Abrir el **Query Tool**
5. Ejecutar el archivo `db/schema.sql`
6. Verificar que aparezca: `Query returned successfully`

### 5. Inicializar usuario administrador (opcional pero recomendado)

```bash
psql -U postgres -d teckcel -c "UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@teckcel.com';"
```

### 6. Ejecutar el servidor

```bash
npm run dev
```

Deberías ver en la consola:
```
✅ Conectado a PostgreSQL
🚀 Servidor corriendo en http://localhost:3000
```

### 7. Abrir la aplicación

Abre tu navegador y visita: [http://localhost:3000](http://localhost:3000)

## Uso

### Flujo típico de usuario

1. **Registro**: Crea una nueva cuenta en `/registro`
2. **Inicio de sesión**: Accede con tus credenciales en `/login`
3. **Navegación**: Explora el catálogo de productos
4. **Compra**: Agrega productos al carrito y realiza un pedido
5. **Rastreo**: Visualiza el estado y ubicación de tus pedidos en tiempo real
6. **Historial**: Revisa tus compras anteriores en tu perfil

### Funciones especiales

- **Administradores**: Acceden al panel admin en `/admin` para gestionar pedidos y ver estadísticas
- **Búsqueda**: Usa el buscador para encontrar productos específicos
- **Favoritos**: Guarda productos para comprar más tarde
- **Valoraciones**: Califica y comenta productos comprados

## API REST - Endpoints

### Autenticación (`/api/usuarios`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/registrar` | Registrar nuevo usuario | Público |
| `POST` | `/login` | Iniciar sesión | Público |
| `POST` | `/logout` | Cerrar sesión | Autenticado |
| `GET` | `/perfil` | Obtener datos del usuario autenticado | Autenticado |
| `PUT` | `/perfil` | Actualizar perfil de usuario | Autenticado |

### Productos (`/api/productos`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/` | Obtener todos los productos | Público |
| `GET` | `/:id` | Obtener producto por ID | Público |
| `POST` | `/` | Crear nuevo producto | Admin |
| `PUT` | `/:id` | Actualizar producto existente | Admin |
| `DELETE` | `/:id` | Eliminar producto | Admin |

### Carrito (`/api/carrito`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/` | Obtener carrito del usuario | Autenticado |
| `POST` | `/agregar` | Agregar producto al carrito | Autenticado |
| `PUT` | `/actualizar` | Actualizar cantidad de producto | Autenticado |
| `DELETE` | `/eliminar/:id` | Eliminar producto del carrito | Autenticado |

### Pedidos (`/api/pedidos`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/activo` | Obtener pedido activo | Cliente |
| `GET` | `/` | Historial de pedidos | Cliente |
| `POST` | `/` | Crear nuevo pedido | Cliente |
| `POST` | `/avanzar` | Avanzar estado automáticamente | Cliente |
| `GET` | `/todos` | Obtener todos los pedidos | Admin |
| `PUT` | `/actualizar` | Actualizar estado manualmente | Admin |

### Favoritos (`/api/favoritos`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/` | Obtener favoritos del usuario | Autenticado |
| `POST` | `/` | Agregar producto a favoritos | Autenticado |
| `DELETE` | `/:id` | Eliminar producto de favoritos | Autenticado |

### Valoraciones (`/api/valoraciones`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/producto/:id` | Obtener valoraciones de un producto | Público |
| `POST` | `/` | Crear nueva valoración | Cliente (solo si compró) |
| `PUT` | `/:id` | Actualizar valoración | Cliente |

### Notificaciones (`/api/notificaciones`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/` | Obtener notificaciones del usuario | Autenticado |
| `PUT` | `/:id/leer` | Marcar notificación como leída | Autenticado |

### Estadísticas (`/api/estadisticas`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/ventas` | Obtener estadísticas de ventas | Admin |
| `GET` | `/productos` | Obtener estadísticas de productos | Admin |

## Base de Datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Información de usuarios y roles (cliente/admin) |
| `productos` | Catálogo de dispositivos tecnológicos |
| `pedidos` | Información general de compras y envíos |
| `pedito_items` | Relación entre pedidos y productos |
| `carritos` | Carritos de compras por usuario |
| `carrito_items` | Items dentro de cada carrito |
| `favoritos` | Productos guardados por usuarios |
| `valoraciones` | Reseñas y calificaciones de productos |
| `notificaciones` | Sistema de notificaciones para usuarios |
| `session` | Almacenamiento de sesiones (express-session) |

### Diagrama simplificado de relaciones

```
usuarios 1----* pedidos
usuarios 1----* carritos
usuarios 1----* favoritos
usuarios 1----* valoraciones
usuarios 1----* notificaciones

productos 1----* pedido_items
productos 1----* carrito_items
productos 1----* favoritos
productos 1----* valoraciones

pedidos 1----* pedido_items
carritos 1----* carrito_items
```

## Arquitectura del Proyecto

### Estructura de carpetas

```
Teckcel/
├── src/
│   ├── controllers/     # Lógica de controladores
│   ├── routes/          # Definición de rutas API
│   └── config/          # Configuración (base de datos)
├── public/              # Archivos estáticos
│   ├── css/             # Hojas de estilo
│   ├── js/              # Lógica del cliente
│   │   ├── auth.js      # Autenticación
│   │   ├── rastreo.js   # Lógica de rastreo
│   │   ├── historial.js # Historial de pedidos
│   │   └── ui.js        # Interfaz de usuario
│   ├── img/             # Imágenes
│   └── html/            # Vistas HTML
├── db/                  # Esquema de base de datos
│   └── schema.sql
├── .env                 # Variables de entorno
├── server.js            # Punto de entrada del servidor
└── package.json         # Dependencias y scripts
```

### Flujo de datos

1. **Cliente (Navegador)** → Envía peticiones HTTP a través de Fetch/AJAX
2. **Servidor (Express.js)** → Recibe peticiones, valida y procesa
3. **Controladores** → Contienen la lógica de negocio
4. **Base de datos (PostgreSQL)** → Almacena y recupera datos
5. **Servidor** → Responde con JSON al cliente
6. **Cliente** → Actualiza la interfaz dinámicamente

## Seguridad Implementada

- **Contraseñas hasheadas**: Utiliza bcryptjs con salt factor de 10
- **Sesiones seguras**: Almacenadas en PostgreSQL mediante connect-pg-simple
- **Protección CSRF**: Configuración adecuada de cookies (httpOnly, sameSite)
- **Autenticación basada en sesiones**: Validación en cada ruta protegida
- **Inyección SQL prevenida**: Uso de consultas parametrizadas
- **Control de acceso basado en roles (RBAC)**: Diferenciación entre cliente y admin
- **CORS configurado**: Solo permite origen específico en desarrollo
- **Headers de seguridad**: Protección básica mediante configuración adecuada

## Variables de Entorno

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `DB_HOST` | Host de PostgreSQL | `localhost` | Sí |
| `DB_PORT` | Puerto de PostgreSQL | `5432` | Sí |
| `DB_NAME` | Nombre de la base de datos | `teckcel` | Sí |
| `DB_USER` | Usuario de PostgreSQL | `postgres` | Sí |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `tu_contraseña` | Sí |
| `SESSION_SECRET` | Secreto para firmar sesiones | `string_aleatorio_32_chars` | Sí |
| `PORT` | Puerto del servidor | `3000` | No (por defecto 3000) |

### Archivo .env.example

```env
# Configuración de la Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teckcel
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres

# Seguridad
SESSION_SECRET=tu_secreto_super_secreto_aqui_2026

# Servidor
PORT=3000
```

## Pruebas

Actualmente el proyecto no tiene un suite de pruebas automatizadas configurada. Sin embargo, puedes realizar pruebas manuales:

### Pruebas de API con cURL

#### Registro de usuario
```bash
curl -X POST http://localhost:3000/api/usuarios/registrar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@test.com","password":"123456"}'
```

#### Inicio de sesión
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"123456"}'
```

#### Obtener productos
```bash
curl -X GET http://localhost:3000/api/productos/
```

#### Crear producto (requiere admin)
```bash
curl -X POST http://localhost:3000/api/productos/ \
  -H "Content-Type: application/json" \
  -d '{"nombre":"iPhone 15","descripción":"Último modelo","categoria":"celular","marca":"Apple","precio":999900,"stock":10}'
```

## Despliegue

### Despliegue en producción (pasos básicos)

1. **Preparar entorno de producción**
   - Asegurar que PostgreSQL esté configurado para conexiones remotas si es necesario
   - Configurar variables de entorno apropiadas para producción
   - Asegurar que el servidor tenga los recursos necesarios

2. **Construir para producción**
   ```bash
   # No hay proceso de build especial, pero asegúrate de:
   npm install --only=production
   ```

3. **Iniciar en modo producción**
   ```bash
   npm start
   ```

4. **Configurar proxy inverso (opcional pero recomendado)**
   - Usar Nginx o Apache como proxy inverso
   - Configurar SSL/TLS para HTTPS
   - Configurar manejo de dominio

5. **Monitoreo y logs**
   - Monitorear el uso de recursos
   - Revisar logs de la aplicación y del servidor
   - Configurar rotación de logs

## Contribución

¡Gracias por tu interés en contribuir a TeckCel! Para contribuir:

1. **Haz un fork** del repositorio
2. **Crea una rama** para tu feature: `git checkout -b feature/AmazingFeature`
3. **Realiza tus cambios** y haz commits descriptivos
4. **Push a tu rama**: `git push origin feature/AmazingFeature`
5. **Abre un Pull Request** describiendo tus cambios

### Guía de estilo de código

- Usa **ESLint** para mantener consistencia
- Commits en español con formato: `tipo: descripción breve`
- Mantén las funciones pequeñas y enfocadas
- Documenta funciones complejas con JSDoc
- Siempre valida y sanitiza entradas de usuario

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

Desarrollado con fines académicos para la asignatura **Ingeniería Web I** en la Universidad Manuela Beltrán (UMB).

## Changelog

### [1.0.0] - 2026-05-27
- Lanzamiento inicial del README mejorado
- Reestructuración completa de la documentación
- Adición de secciones estándar de proyectos de software
- Mejora de ejemplos de uso y comandos
- Inclusión de diagramas de arquitectura y base de datos

### [0.1.0] - 2026-05-15
- Versión inicial del proyecto
- Implementación básica de funcionalidades de e-commerce
- Primera versión de la documentación

## Notas de Seguridad

### Antes de desplegar a producción

1. **Cambiar todas las credenciales por defecto**
   - Nunca usar contraseñas de ejemplo en producción
   - Usar secrets management para variables sensibles

2. **Deshabilitar debug y verbose logging**
   - En producción, reducir nivel de logs a solo errores críticos

3. **Configurar HTTPS**
   - Obtener certificado SSL/TLS válido
   - Redirigir todo el tráfico HTTP a HTTPS

4. **Actualizar dependencias regularmente**
   - Ejecutar `npm audit` y corregir vulnerabilidades
   - Mantener dependencias actualizadas

5. **Implementar rate limiting**
   - Considerar agregar limitación de peticiones por IP
   - Protección contra fuerza bruta en login

6. **Realizar copias de seguridad de la BD**
   - Programa regular de backups
   - Probar restauración de backups

### Buenas prácticas de seguridad aplicadas

- Contraseñas almacenadas como hash (never plain text)
- Sesiones almacenadas en base de datos segura
- Todas las consultas usan parámetros (evita SQL injection)
- Validación de tipos y rangos en datos de entrada
- CORS restringido a dominios específicos
- Cookies configuradas con flags de seguridad apropiados

## Checklist Antes de Entregar

Antes de considerar el proyecto completo, verifica:

### Credenciales y Seguridad
- [ ] Archivo `.env` no está versionado (en .gitignore)
- [ ] Variables de entorno configuradas correctamente
- [ ] Contraseñas de BD fuertes y únicas
- [ ] SECRET de sesión suficientemente complejo
- [ ] No hay credenciales hardcodeadas en el código

### Base de Datos
- [ ] Base de datos `teckcel` creada exitosamente
- [ ] Esquema `schema.sql` ejecutado sin errores
- [ ] Usuario administrador existe (opcional: `admin@teckcel.com`)
- [ ] Conexión a BD verificada desde la aplicación
- [ ] Tablas creadas correctamente (verificar con `\dt` en psql)

### Funcionalidad básica
- [ ] Servidor inicia sin errores (`npm run dev`)
- [ ] Página principal carga correctamente
- [ ] Registro de usuario funciona
- [ ] Inicio de sesión funciona
- [ ] Catálogo de productos se muestra
- [ ] Carrito de compras funciona básicamente
- [ ] Panel admin accesible para usuarios con rol admin

### Documentación
- [ ] README actualizado y completo
- [ ] Comentarios en el código donde sea necesario
- [ ] Instrucciones de instalación claras
- [ ] Ejemplos de uso proporcionados

### Limpieza
- [ ] No hay archivos temporales o de debug
- [ ] Consola sin warnings innecesarios
- [ ] Dependencias innecesarias removidas
- [ ] Código comentado o dead code removido

## Recursos Adicionales

- [Documentación de Leaflet.js](https://leafletjs.com/)
- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [API OSRM](http://project-osrm.org/)
- [API Nominatim](https://nominatim.org/release-docs/develop/)

---

*Documentación mejorada y estandarizada para facilitar el mantenimiento, colaboración y comprensión del proyecto.*