// ============================================================
// TAL CUAL · Admin Panel JavaScript
// ============================================================
import { api } from './services/api.js';
import { formatPrice, conditionLabel } from './services/format.js';

// ---- Auth helpers ----
function getToken() {
  const t = localStorage.getItem('talcual-admin-token');
  if (!t) return null;
  try { JSON.parse(atob(t.split('.')[1])); return t; } catch { return null; }
}
function redirectLogin() { window.location.href = '/admin/login'; }
function checkAuth() {
  if (!getToken() && !window.location.pathname.includes('/admin/login')) redirectLogin();
}
checkAuth();

// ---- Admin Topbar Component ----
class AdminTopbar extends HTMLElement {
  connectedCallback() {
    const page = this.dataset.page || '';
    const user = (() => { try { const t = getToken(); return t ? JSON.parse(atob(t.split('.')[1])) : null; } catch { return null; } })();
    this.innerHTML = `
      <header class="admin-header">
        <div class="admin-header__inner">
          <div style="display:flex; align-items:center; gap: var(--tc-sp-sm);">
            <button class="admin-menu-btn btn-icon"><span class="material-symbols-outlined">menu</span></button>
            <a href="/admin" class="admin-header__brand">
              <span class="admin-header__brand-text">TAL CUAL</span>
            </a>
            <nav class="admin-nav">
              <a class="admin-nav__link ${page === 'dashboard' ? 'active' : ''}" href="/admin"><span class="material-symbols-outlined">dashboard</span> Dashboard</a>
              <a class="admin-nav__link ${page === 'catalogo' ? 'active' : ''}" href="/admin/catalogo"><span class="material-symbols-outlined">inventory_2</span> Catálogo</a>
              <a class="admin-nav__link ${page === 'usuarios' ? 'active' : ''}" href="/admin/usuarios"><span class="material-symbols-outlined">people</span> Usuarios</a>
            </nav>
          </div>
          <div class="admin-profile">
            <span style="font-size: 14px; color: var(--tc-on-surface-variant);">${user?.name || 'Admin'}</span>
            <button class="admin-profile__btn" id="logoutBtn" title="Cerrar sesión">
              <span class="material-symbols-outlined" style="color: var(--tc-text-muted);">logout</span>
            </button>
          </div>
        </div>
      </header>
    `;
    this.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('talcual-admin-token');
      redirectLogin();
    });
  }
}
customElements.define('admin-topbar', AdminTopbar);

// ---- Login ----
const loginForm = document.querySelector('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    const alertEl = document.querySelector('#loginAlert');
    try {
      const res = await api.login(email, password);
      localStorage.setItem('talcual-admin-token', res.token);
      window.location.href = '/admin';
    } catch (err) {
      alertEl.textContent = err.message || 'Credenciales inválidas';
      alertEl.classList.add('show');
    }
  });
}

// ---- Dashboard ----
const statsGrid = document.querySelector('#statsGrid');
if (statsGrid) {
  (async () => {
    try {
      const token = getToken();
      const [prods, users] = await Promise.all([
        api.listProductsAdmin(token, { limit: '1' }).catch(() => ({ pagination: { total: 0 } })),
        api.listUsers(token).catch(() => ({ data: [] })),
      ]);
      document.querySelector('#statProducts').textContent = prods.pagination?.total || 0;
      document.querySelector('#statUsers').textContent = (users.data || []).length;
    } catch { /* ignore */ }
  })();
}

// ---- Catalog Management ----
const catalogTable = document.querySelector('#catalogTable');
if (catalogTable) {
  let currentPage = 1;
  let currentQuery = '';
  let currentStatus = '';

  async function loadCatalog() {
    const tbody = document.querySelector('#catalogBody');
    const pag = document.querySelector('#catalogPagination');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tc-text-muted);padding:40px;">Cargando...</td></tr>';
    try {
      const token = getToken();
      const params = { page: currentPage, limit: '20', q: currentQuery };
      if (currentStatus) params.status = currentStatus;
      const res = await api.listProductsAdmin(token, params);
      const products = res.data || [];
      if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tc-text-muted);padding:40px;">No hay productos</td></tr>';
        pag.innerHTML = '';
        return;
      }
      tbody.innerHTML = products.map(p => `
        <tr>
          <td><img src="${p.image_url || '/frontend/assets/product-placeholder.svg'}" alt="" class="tc-table__thumb" onerror="this.src='/frontend/assets/product-placeholder.svg'" /></td>
          <td><div class="tc-table__product">${p.title}</div><div class="tc-table__ref">Ref: ${p.reference || '-'}</div></td>
          <td><span class="role-tag" style="background:var(--tc-surface-container);">${p.category || '-'}</span></td>
          <td class="tc-table__price">${formatPrice(p.price)}</td>
          <td><span class="status-pill ${p.status === 'active' ? 'active' : 'inactive'}"><span class="status-pill__dot"></span>${p.status === 'active' ? 'Activo' : p.status === 'sold' ? 'Vendido' : 'Inactivo'}</span></td>
          <td class="tc-table__actions">
            <a href="/admin/productos/${p.id}" class="tc-table__action-btn" title="Editar"><span class="material-symbols-outlined">edit</span></a>
            <button class="tc-table__action-btn danger" data-del="${p.id}" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
          </td>
        </tr>
      `).join('');
      // Pagination
      const total = res.pagination?.total || 0;
      const perPage = 20;
      const totalPages = Math.ceil(total / perPage);
      if (totalPages <= 1) { pag.innerHTML = ''; return; }
      pag.innerHTML = `
        <span class="pagination__info">Mostrando ${(currentPage - 1) * perPage + 1} a ${Math.min(currentPage * perPage, total)} de ${total}</span>
        <div class="pagination__pages">
          <button class="pagination__page" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span></button>
          ${Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return `<button class="pagination__page ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
          }).join('')}
          <button class="pagination__page" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span></button>
        </div>
      `;
      pag.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = parseInt(btn.dataset.page);
          if (p >= 1 && p <= totalPages) { currentPage = p; loadCatalog(); }
        });
      });
      // Delete handlers
      tbody.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este producto?')) return;
          try {
            await api.deleteProduct(getToken(), btn.dataset.del);
            loadCatalog();
          } catch (err) { alert(err.message); }
        });
      });
    } catch (err) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--tc-error);">Error: ${err.message}</td></tr>`; }
  }

  // Filters
  const search = document.querySelector('#catalogSearch');
  const statusFilter = document.querySelector('#statusFilter');
  if (search) {
    let timer;
    search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { currentQuery = search.value; currentPage = 1; loadCatalog(); }, 300); });
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', () => { currentStatus = statusFilter.value; currentPage = 1; loadCatalog(); });
  }
  loadCatalog();
}

// ---- New Product ----
const productForm = document.querySelector('#productForm');
if (productForm) {
  // Load categories
  api.getCategories().then(cats => {
    const sel = document.querySelector('#prodCategory');
    if (Array.isArray(cats)) cats.forEach(c => { sel.innerHTML += `<option value="${c.id}">${c.name}</option>`; });
  }).catch(() => {});
  // Load conditions
  api.getConditions().then(conds => {
    const group = document.querySelector('#conditionGroup');
    if (Array.isArray(conds)) group.innerHTML = conds.map(c => `
      <label class="radio-item"><input type="radio" name="condition" value="${c.id}" ${c.id === 'como_nuevo' ? 'checked' : ''} /><span class="radio-item__label">${c.name}</span></label>
    `).join('');
  }).catch(() => {});

  // Image upload via Vercel Blob
  const dropzone = document.querySelector('#imageDropzone');
  const fileInput = document.querySelector('#imageInput');
  const previewWrap = document.querySelector('#imagePreviewWrap');
  const preview = document.querySelector('#imagePreview');
  const urlPreview = document.querySelector('#imageUrlPreview');
  const hiddenInput = document.querySelector('#prodImage');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  }

  async function handleFile(file) {
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    const token = getToken();
    if (!token) { alert('Debes iniciar sesión'); return; }
    try {
      const res = await api.upload(token, file);
      if (res.url) {
        hiddenInput.value = res.url;
        preview.src = res.url;
        previewWrap.style.display = 'block';
        urlPreview.textContent = res.url;
      }
    } catch (err) {
      alert('Error al subir imagen: ' + err.message);
    }
  }

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      title: document.querySelector('#prodTitle').value.trim(),
      category: document.querySelector('#prodCategory').value,
      price: parseFloat(document.querySelector('#prodPrice').value),
      description: document.querySelector('#prodDescription').value.trim(),
      condition: document.querySelector('[name="condition"]:checked')?.value || 'como_nuevo',
      image_url: hiddenInput.value,
    };
    if (!data.title || !data.price) { alert('Título y precio requeridos'); return; }
    try {
      await api.createProduct(getToken(), data);
      window.location.href = '/admin/catalogo';
    } catch (err) { alert(err.message); }
  });
}

// ---- Edit Product ----
const editForm = document.querySelector('#productEditForm');
if (editForm) {
  const productId = window.location.pathname.split('/').pop();

  // Load categories and conditions first
  Promise.all([api.getCategories(), api.getConditions()]).then(([cats, conds]) => {
    const catSel = document.querySelector('#editCategory');
    if (Array.isArray(cats)) cats.forEach(c => { catSel.innerHTML += `<option value="${c.id}">${c.name}</option>`; });
    const condGroup = document.querySelector('#editConditionGroup');
    if (Array.isArray(conds)) condGroup.innerHTML = conds.map(c => `
      <label class="radio-item"><input type="radio" name="editCondition" value="${c.id}" /><span class="radio-item__label">${c.name}</span></label>
    `).join('');
    loadProduct();
  }).catch(() => loadProduct());

  async function loadProduct() {
    try {
      const p = await api.getProduct(productId);
      document.querySelector('#editTitle').value = p.title || '';
      document.querySelector('#editCategory').value = p.category || '';
      document.querySelector('#editPrice').value = p.price || '';
      document.querySelector('#editDescription').value = p.description || '';
      document.querySelector('#editStatus').value = p.status || 'active';
      document.querySelector('#editImage').value = p.image_url || '';
      document.querySelector('#editImagePreview').src = p.image_url || '/frontend/assets/product-placeholder.svg';
      const conditionRadios = document.querySelectorAll('[name="editCondition"]');
      conditionRadios.forEach(r => { if (r.value === p.condition) r.checked = true; });
    } catch (err) {
      document.querySelector('[style*="max-width: 800px"] > div:first-child h1').textContent = 'Producto no encontrado';
    }
  }

  document.querySelector('#editImage').addEventListener('input', () => {
    document.querySelector('#editImagePreview').src = document.querySelector('#editImage').value || '/frontend/assets/product-placeholder.svg';
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      title: document.querySelector('#editTitle').value.trim(),
      category: document.querySelector('#editCategory').value,
      price: parseFloat(document.querySelector('#editPrice').value),
      description: document.querySelector('#editDescription').value.trim(),
      status: document.querySelector('#editStatus').value,
      condition: document.querySelector('[name="editCondition"]:checked')?.value || null,
      image_url: document.querySelector('#editImage').value.trim(),
    };
    try {
      await api.updateProduct(getToken(), productId, data);
      window.location.href = '/admin/catalogo';
    } catch (err) { alert(err.message); }
  });
}

// ---- User Management ----
const userGrid = document.querySelector('#userGrid');
if (userGrid) {
  (async () => {
    try {
      const token = getToken();
      const res = await api.listUsers(token);
      const users = res.data || [];
      if (users.length === 0) {
        userGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--tc-text-muted); padding:var(--tc-sp-2xl);">No hay usuarios registrados</div>';
        return;
      }
      userGrid.innerHTML = users.map(u => `
        <div class="user-card ${!u.is_active ? 'inactive' : ''}">
          <div class="user-card__corner"></div>
          <div class="user-card__head">
            <div class="user-card__id">
              <div class="user-card__avatar">${u.avatar_url ? `<img src="${u.avatar_url}" alt="" />` : (u.name?.[0] || '?')}</div>
              <div><div class="user-card__name">${u.name}</div><div class="user-card__email">${u.email}</div></div>
            </div>
            <a href="/admin/usuarios/${u.id}" class="tc-table__action-btn" title="Editar"><span class="material-symbols-outlined">edit</span></a>
          </div>
          <div class="user-card__foot">
            <div><div class="user-card__label">Rol</div><span class="role-tag ${u.role}">${u.role === 'admin' ? 'Administrador' : u.role === 'editor' ? 'Editor' : 'Visualizador'}</span></div>
            <div style="text-align:right;"><div class="user-card__label">Estado</div><span class="status-pill ${u.is_active ? 'active' : 'inactive'}"><span class="status-pill__dot"></span>${u.is_active ? 'Activo' : 'Inactivo'}</span></div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      userGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--tc-error); padding:var(--tc-sp-xl);">Error: ${err.message}</div>`;
    }
  })();
}

// ---- New User ----
const userCreateForm = document.querySelector('#userCreateForm');
if (userCreateForm) {
  document.querySelector('#togglePass')?.addEventListener('click', () => {
    const inp = document.querySelector('#userPassword');
    const icon = document.querySelector('#togglePass .material-symbols-outlined');
    if (inp.type === 'password') { inp.type = 'text'; icon.textContent = 'visibility'; }
    else { inp.type = 'password'; icon.textContent = 'visibility_off'; }
  });

  userCreateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.querySelector('#userName').value.trim(),
      email: document.querySelector('#userEmail').value.trim(),
      password: document.querySelector('#userPassword').value,
      role: document.querySelector('#userRole').value,
    };
    if (data.password.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }
    try {
      await api.createUser(getToken(), data);
      window.location.href = '/admin/usuarios';
    } catch (err) { alert(err.message); }
  });
}

// ---- Edit User ----
const userEditForm = document.querySelector('#userEditForm');
if (userEditForm) {
  const userId = window.location.pathname.split('/').pop();
  (async () => {
    try {
      const token = getToken();
      const u = await api.listUsers(token).then(r => r.data?.find(x => x.id === userId));
      if (!u) { document.querySelector('h1').textContent = 'Usuario no encontrado'; return; }
      document.querySelector('#editUserName').value = u.name || '';
      document.querySelector('#editUserEmail').value = u.email || '';
      document.querySelector('#editUserRole').value = u.role || 'editor';
    } catch { /* ignore */ }
  })();

  userEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.querySelector('#editUserName').value.trim(),
      email: document.querySelector('#editUserEmail').value.trim(),
      role: document.querySelector('#editUserRole').value,
    };
    const pass = document.querySelector('#editUserPassword').value;
    if (pass) data.password = pass;
    try {
      await api.updateUser(getToken(), userId, data);
      window.location.href = '/admin/usuarios';
    } catch (err) { alert(err.message); }
  });
}
