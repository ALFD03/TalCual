const { query } = require('../lib/db');
const { comparePassword, signToken, verifyToken } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    // LOGIN
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
      }

      const result = await query('SELECT * FROM admin_users WHERE email = $1 AND is_active = true', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      const user = result.rows[0];
      const match = await comparePassword(password, user.password);

      if (!match) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }

    // ME (Verificación de Token)
    if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
      }

      return res.status(200).json({ success: true, user: decoded });
    }

    return res.status(400).json({ success: false, message: 'Acción no soportada' });
  } catch (error) {
    console.error('Error en auth:', error);
    return res.status(500).json({ success: false, message: 'Error de servidor' });
  }
};