# TAL CUAL - Web App

Tienda de economía circular. Frontend estático + API serverless con Neon y Vercel Blob.

## Estructura

```
├── api/             # Backend (serverless functions Vercel)
│   ├── products/    # GET público /api/products, /api/products/:id
│   ├── categories   # GET /api/categories
│   ├── conditions   # GET /api/conditions
│   ├── config       # GET /api/config (WhatsApp, etc)
│   ├── orders       # POST (público) + GET (admin) /api/orders
│   ├── auth/        # login + me
│   ├── admin/       # CRUD productos y usuarios admin
│   └── upload       # POST /api/upload (Vercel Blob)
├── frontend/        # Frontend (HTML/CSS/JS estático)
│   ├── pages/       # Páginas públicas (inicio, catálogo, vender, nosotros)
│   ├── admin/       # Páginas admin (login, dashboard, catálogo, usuarios)
│   ├── scripts/     # JS modular (componentes web, servicios)
│   ├── styles/      # CSS: tokens, base, componentes, admin, app
│   └── assets/      # SVG placeholder y logo
├── lib/             # Utilidades backend (db, blob, auth)
├── db/              # SQL schema + seed script
├── Referencia/      # Modelos de diseño originales
├── vercel.json      # Config de deploy Vercel
├── .env.example     # Variables de entorno requeridas
└── package.json     # Dependencias del proyecto
```

## Requisitos previos

1. Cuenta en [Vercel](https://vercel.com) (plan Hobby es suficiente)
2. Base de datos en [Neon](https://neon.tech) (tier Free)
3. Storage Blob en [Vercel](https://vercel.com/storage/blob) (plan Hobby)

## Configuración

### 1. Clonar e instalar

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `NEON_DATABASE_URL` | URL de conexión a Neon (PostgreSQL) |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob |
| `JWT_SECRET` | Cadena aleatoria para firmar JWT (`openssl rand -hex 32`) |
| `WHATSAPP_NUMBER` | Número de WhatsApp (ej: 584249039269) |
| `FRONTEND_URL` | URL pública del frontend |

### 3. Base de datos

1. Ve al panel de Neon > SQL Editor
2. Copia y pega el contenido de `db/schema.sql`
3. Ejecútalo

Opcional: para sembrar datos demo con Node:

```bash
node db/seed.js
```

Esto crea productos demo, categorías, condiciones y un admin por defecto:
- Email: `admin@talcual.com`
- Contraseña: `talcual123`

## Desarrollo local

```bash
npm run dev
```

Esto inicia `vercel dev` que sirve el frontend estático y las API functions.

## Deploy a producción

```bash
npm run deploy
```

O desde la UI de Vercel:
1. Conecta el repositorio
2. Añade las variables de entorno en Settings > Environment Variables
3. Deploy

## Endpoints API

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Lista productos (query: category, q, sort, condition, page, limit) |
| GET | `/api/products/:id` | Detalle de producto |
| GET | `/api/categories` | Lista categorías |
| GET | `/api/conditions` | Lista condiciones |
| GET | `/api/config` | Config de la tienda (WhatsApp) |
| POST | `/api/orders` | Crear pedido |

### Admin (requiere token JWT)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login (devuelve token) |
| GET | `/api/auth/me` | Usuario actual |
| GET/POST | `/api/admin/products` | CRUD productos |
| PUT/DELETE | `/api/admin/products/:id` | Actualizar/eliminar producto |
| GET/POST | `/api/admin/users` | CRUD usuarios admin |
| PUT/DELETE | `/api/admin/users/:id` | Actualizar/eliminar usuario |
| POST | `/api/upload` | Subir imagen a Vercel Blob |

## Admin Panel

Accede a `/admin/login` e inicia sesión con las credenciales del seed.

Páginas admin disponibles:
- `/admin` - Dashboard
- `/admin/catalogo` - Gestión de productos
- `/admin/productos/nuevo` - Nuevo producto
- `/admin/productos/:id` - Editar producto
- `/admin/usuarios` - Gestión de usuarios
- `/admin/usuarios/nuevo` - Nuevo usuario
- `/admin/usuarios/:id` - Editar usuario
