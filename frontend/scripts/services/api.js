// ============================================================
// TAL CUAL · Cliente API
// ============================================================
const BASE = '/api';

async function request(path, options = {}) {
  const opts = { headers: {}, ...options };
  if (opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  if (options.token) {
    opts.headers['Authorization'] = `Bearer ${options.token}`;
  }
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const payload = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const msg = (isJson && (payload.error || payload.message)) || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  } catch (err) {
    if (err.status) throw err;
    err.message = `No se pudo conectar con el servidor: ${err.message}`;
    throw err;
  }
}

export const api = {
  // Catálogo público
  getProducts(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/products${q ? `?${q}` : ''}`);
  },
  getProduct(id) { return request(`/products?id=${id}`); },
  getCategories() { return request('/meta?type=categories'); },
  getConditions() { return request('/meta?type=conditions'); },
  getConfig() { return request('/meta?type=config'); },

  // Pedidos (público)
  createOrder(payload) { return request('/orders', { method: 'POST', body: payload }); },

  // Auth admin
  login(email, password) { return request('/auth?action=login', { method: 'POST', body: { email, password } }); },
  me(token) {
    return request('/auth?action=me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin - productos
  listProductsAdmin(token, params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/admin-products${q ? `?${q}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  createProduct(token, payload) {
    return request('/admin-products', { method: 'POST', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
  },
  updateProduct(token, id, payload) {
    return request(`/admin-products?id=${id}`, { method: 'PUT', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
  },
  deleteProduct(token, id) {
    return request(`/admin-products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  },

  // Admin - usuarios
  listUsers(token) {
    return request('/admin-users', { headers: { 'Authorization': `Bearer ${token}` } });
  },
  createUser(token, payload) {
    return request('/admin-users', { method: 'POST', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
  },
  updateUser(token, id, payload) {
    return request(`/admin-users?id=${id}`, { method: 'PUT', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
  },
  deleteUser(token, id) {
    return request(`/admin-users?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  },

  // Admin - categorías
  listCategoriesAdmin(token) {
    return request('/admin-categories', { headers: { 'Authorization': `Bearer ${token}` } });
  },
  createCategory(token, payload) {
    return request('/admin-categories', { method: 'POST', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
  },
  updateCategory(token, id, payload) {
    return request(`/admin-categories?id=${id}`, { method: 'PUT', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
  },
  deleteCategory(token, id) {
    return request(`/admin-categories?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  },

  // Admin - pedidos
  listOrders(token) {
    return request('/orders', { headers: { 'Authorization': `Bearer ${token}` } });
  },

  // Upload a Vercel Blob
  upload(token, file, folder = 'products') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return request('/upload', { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${token}` } });
  },
};
