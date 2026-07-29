const { query } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, q, category, condition, sort = 'recientes', page = 1, limit = 12 } = req.query;

  try {
    // Detalle de un producto individual
    if (id) {
      const result = await query(
        `SELECT p.*, c.name as category_name, cond.name as condition_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         LEFT JOIN conditions cond ON p.condition_id = cond.id 
         WHERE p.id = $1 AND p.status = 'active'`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    // Listado filtrado y paginado de productos
    let sqlParams = [];
    let sqlConditions = ["p.status = 'active'"];

    if (q) {
      sqlParams.push(`%${q}%`);
      sqlConditions.push(`(p.title ILIKE $${sqlParams.length} OR p.description ILIKE $${sqlParams.length})`);
    }

    if (category) {
      sqlParams.push(category);
      sqlConditions.push(`c.slug = $${sqlParams.length}`);
    }

    if (condition) {
      sqlParams.push(condition);
      sqlConditions.push(`cond.slug = $${sqlParams.length}`);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'precio-asc') orderBy = 'p.price ASC';
    if (sort === 'precio-desc') orderBy = 'p.price DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = sqlConditions.length ? `WHERE ${sqlConditions.join(' AND ')}` : '';

    const dataQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, cond.name as condition_name, cond.slug as condition_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN conditions cond ON p.condition_id = cond.id 
      ${whereClause} 
      ORDER BY ${orderBy} 
      LIMIT $${sqlParams.length + 1} OFFSET $${sqlParams.length + 2}`;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN conditions cond ON p.condition_id = cond.id 
      ${whereClause}`;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, [...sqlParams, limit, offset]),
      query(countQuery, sqlParams)
    ]);

    const total = parseInt(countResult.rows[0].total);

    return res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error en products:', error);
    return res.status(500).json({ success: false, message: 'Error en la consulta' });
  }
};