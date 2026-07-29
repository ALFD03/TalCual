-- ============================================================
-- TAL CUAL · Schema SQL para Neon
-- Ejecutar en el panel de Neon: SQL Editor
-- ============================================================

-- Categorías
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0
);

-- Condiciones de producto
CREATE TABLE IF NOT EXISTS conditions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  condition VARCHAR(50) REFERENCES conditions(id) ON DELETE SET NULL,
  image_url TEXT DEFAULT '',
  image_blob_url TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, sold
  reference VARCHAR(50) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',  -- admin, editor, viewer
  avatar_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) DEFAULT '',
  customer_note TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) DEFAULT 0,
  item_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, contacted, completed, cancelled
  source VARCHAR(50) DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Seed data inicial
-- ============================================================
INSERT INTO categories (id, name, display_order) VALUES
  ('ropa', 'Ropa', 1),
  ('muebles', 'Muebles', 2),
  ('zapatos', 'Zapatos', 3),
  ('cocina', 'Cocina', 4),
  ('accesorios', 'Accesorios', 5),
  ('libros', 'Libros', 6),
  ('decoracion', 'Decoración', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO conditions (id, name) VALUES
  ('nuevo', 'Nuevo'),
  ('como_nuevo', 'Como nuevo'),
  ('segunda_mano', 'Segunda mano')
ON CONFLICT (id) DO NOTHING;
