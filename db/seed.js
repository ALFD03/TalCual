// ============================================================
// TAL CUAL · Seed script
// Ejecutar: node db/seed.js
// Requiere DATABASE_URL en .env
// ============================================================
require('dotenv').config();
const { query } = require('../lib/db');
const { hashPassword } = require('../lib/auth');

async function seed() {
  console.log('🌱 Sembrando base de datos TAL CUAL...\n');

  // 1. Crear tablas
  console.log('📦 Creando tablas...');
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      display_order INT DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS conditions (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
      condition VARCHAR(50) REFERENCES conditions(id) ON DELETE SET NULL,
      image_url TEXT DEFAULT '',
      image_blob_url TEXT DEFAULT '',
      status VARCHAR(20) DEFAULT 'active',
      type VARCHAR(20) DEFAULT 'regular',
      owner_name VARCHAR(255) DEFAULT '',
      owner_contact VARCHAR(255) DEFAULT '',
      reference VARCHAR(50) DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'editor',
      avatar_url TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name VARCHAR(255) DEFAULT '',
      customer_note TEXT DEFAULT '',
      items JSONB DEFAULT '[]',
      total DECIMAL(10,2) DEFAULT 0,
      item_count INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
      source VARCHAR(50) DEFAULT 'whatsapp',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('   ✓ Tablas creadas/verificadas\n');

  // 2. Categorías
  console.log('🏷️ Insertando categorías...');
  const cats = [
    ['ropa', 'Ropa', 1], ['muebles', 'Muebles', 2], ['zapatos', 'Zapatos', 3],
    ['cocina', 'Cocina', 4], ['accesorios', 'Accesorios', 5], ['libros', 'Libros', 6], ['decoracion', 'Decoración', 7]
  ];
  for (const [id, name, order] of cats) {
    await query('INSERT INTO categories (id, name, display_order) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [id, name, order]);
  }
  console.log('   ✓ 7 categorías insertadas\n');

  // 3. Condiciones
  console.log('🏷️ Insertando condiciones...');
  const conds = [['nuevo', 'Nuevo'], ['como_nuevo', 'Como nuevo'], ['segunda_mano', 'Segunda mano']];
  for (const [id, name] of conds) {
    await query('INSERT INTO conditions (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [id, name]);
  }
  console.log('   ✓ 3 condiciones insertadas\n');

  // 4. Admin por defecto
  console.log('👤 Creando admin por defecto...');
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador';
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@talcual.com';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'talcual123';
  const hashed = hashPassword(adminPass);
  try {
    await query('INSERT INTO admin_users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password', [adminName, adminEmail, hashed, 'admin']);
    console.log(`   ✓ Admin creado: ${adminEmail} / ${adminPass}\n`);
  } catch (e) {
    console.log(`   ⚠️  Error: ${e.message}\n`);
  }

  // 5. Productos demo
  console.log('🛍️ Insertando productos demo...');
  const demo = [
    { title: 'Abrigo Trench Clásico Beige', price: 45.00, cat: 'ropa', cond: 'segunda_mano', desc: 'Abrigo trench en tono beige, elegante y atemporal. Perfecto para cualquier ocasión.' },
    { title: 'Sillón Vintage Restaurado Verde Oliva', price: 120.00, cat: 'muebles', cond: 'nuevo', desc: 'Sillón vintage completamente restaurado. Tapizado en verde oliva de alta calidad.' },
    { title: 'Zapatos Deportivos Blancos Premium', price: 35.00, cat: 'zapatos', cond: 'segunda_mano', desc: 'Zapatos deportivos blancos en excelente estado. Cómodos y versátiles.' },
    { title: 'Set de Vajilla Cerámica Artesanal', price: 55.00, cat: 'cocina', cond: 'nuevo', desc: 'Set de vajilla de cerámica hecha a mano. Incluye 4 platos y 4 bowls.' },
    { title: 'Bolso de Cuero Artesanal', price: 65.00, cat: 'accesorios', cond: 'como_nuevo', desc: 'Bolso de cuero genuino, hecho a mano. Color marrón oscuro.' },
    { title: 'Libro: Arte de la Economía Circular', price: 18.00, cat: 'libros', cond: 'nuevo', desc: 'Libro sobre economía circular y consumo consciente. Edición de tapa dura.' },
    { title: 'Lámpara de Mesa Vintage', price: 42.00, cat: 'decoracion', cond: 'segunda_mano', desc: 'Lámpara de mesa estilo vintage con pantalla de tela beige.' },
    { title: 'Chaqueta de Jean Clásica', price: 28.00, cat: 'ropa', cond: 'como_nuevo', desc: 'Chaqueta de jean en tono índigo. Talle M.' },
  ];
  for (const p of demo) {
    const ref = `TC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await query(
      'INSERT INTO products (title, description, price, category, condition, status, type, reference, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [p.title, p.desc, p.price, p.cat, p.cond, 'active', 'regular', ref, '']
    );
  }
  console.log(`   ✓ ${demo.length} productos demo insertados\n`);

  console.log('✅ Seed completado exitosamente.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});
