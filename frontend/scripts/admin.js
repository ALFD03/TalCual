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
              <a class="admin-nav__link ${page === 'categorias' ? 'active' : ''}" href="/admin/categorias"><span class="material-symbols-outlined">category</span> Categorías</a>
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
      const [prods, users, cats] = await Promise.all([
        api.listProductsAdmin(token).catch(() => ({ data: [] })),
        api.listUsers(token).catch(() => ({ data: [] })),
        api.listCategoriesAdmin(token).catch(() => ({ data: [] })),
      ]);
      document.querySelector('#statProducts').textContent = (prods.data || []).length;
      document.querySelector('#statCategories').textContent = (cats.data || []).length;
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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--tc-text-muted);padding:40px;">Cargando...</td></tr>';
    try {
      const token = getToken();
      const params = { page: currentPage, limit: '20', q: currentQuery };
      if (currentStatus) params.status = currentStatus;
      const res = await api.listProductsAdmin(token, params);
      const products = res.data || [];
      if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--tc-text-muted);padding:40px;">No hay productos</td></tr>';
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
          <td><span class="role-tag" style="background:${p.type === 'consigned' ? 'rgba(217,115,40,0.2)' : 'var(--tc-surface-container)'}; color: ${p.type === 'consigned' ? 'var(--tc-cta)' : 'var(--tc-on-surface-variant)'};">${p.type === 'consigned' ? 'Consignado' : 'Regular'}</span></td>
          <td class="tc-table__actions">
            <a href="/admin/productos/${p.id}" class="tc-table__action-btn" title="Editar"><span class="material-symbols-outlined">edit</span></a>
            <button class="tc-table__action-btn danger" data-del="${p.id}" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
          </td>
        </tr>
      `).join('');
      // Delete handlers (delegación) - ANTES del early return de paginación
      tbody.onclick = (e) => {
        const btn = e.target.closest('[data-del]');
        if (!btn) return;
        e.preventDefault();
        if (!confirm('¿Eliminar este producto?')) return;
        api.deleteProduct(getToken(), btn.dataset.del).then(() => {
          loadCatalog();
        }).catch((err) => {
          alert(err.message);
        });
      };
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
    } catch (err) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--tc-error);">Error: ${err.message}</td></tr>`; }
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
  api.getCategories().then(res => {
    const cats = res.data || [];
    const sel = document.querySelector('#prodCategory');
    cats.forEach(c => { sel.innerHTML += `<option value="${c.id}">${c.name}</option>`; });
  }).catch(() => {});
  // Load conditions
  api.getConditions().then(res => {
    const conds = res.data || [];
    const group = document.querySelector('#conditionGroup');
    group.innerHTML = conds.map(c => `
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

  // Toggle owner fields for consigned
  const prodType = document.querySelector('#prodType');
  const prodOwnerFields = document.querySelector('#prodOwnerFields');
  if (prodType) {
    prodType.addEventListener('change', () => {
      prodOwnerFields.style.display = prodType.value === 'consigned' ? 'block' : 'none';
    });
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
      type: (document.querySelector('#prodType')?.value || 'regular'),
      owner_name: (document.querySelector('#prodOwnerName')?.value || '').trim(),
      owner_contact: (document.querySelector('#prodOwnerContact')?.value || '').trim(),
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
  Promise.all([api.getCategories(), api.getConditions()]).then(([catRes, condRes]) => {
    const cats = catRes.data || [];
    const conds = condRes.data || [];
    const catSel = document.querySelector('#editCategory');
    cats.forEach(c => { catSel.innerHTML += `<option value="${c.id}">${c.name}</option>`; });
    const condGroup = document.querySelector('#editConditionGroup');
    condGroup.innerHTML = conds.map(c => `
      <label class="radio-item"><input type="radio" name="editCondition" value="${c.id}" /><span class="radio-item__label">${c.name}</span></label>
    `).join('');
    loadProduct();
  }).catch(() => loadProduct());

  // Image dropzone for edit
  const editDropzone = document.querySelector('#editImageDropzone');
  const editFileInput = document.querySelector('#editImageInput');
  const editPreview = document.querySelector('#editImagePreview');
  const editPreviewWrap = document.querySelector('#editImagePreviewWrap');
  const editImageUrlPreview = document.querySelector('#editImageUrlPreview');
  const editHiddenInput = document.querySelector('#editImage');

  if (editDropzone && editFileInput) {
    editDropzone.addEventListener('click', () => editFileInput.click());
    editDropzone.addEventListener('dragover', (e) => { e.preventDefault(); editDropzone.classList.add('dragover'); });
    editDropzone.addEventListener('dragleave', () => editDropzone.classList.remove('dragover'));
    editDropzone.addEventListener('drop', (e) => {
      e.preventDefault(); editDropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleEditFile(e.dataTransfer.files[0]);
    });
    editFileInput.addEventListener('change', () => { if (editFileInput.files[0]) handleEditFile(editFileInput.files[0]); });
  }

  async function handleEditFile(file) {
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    const token = getToken();
    if (!token) { alert('Debes iniciar sesión'); return; }
    try {
      const res = await api.upload(token, file);
      if (res.url) {
        editHiddenInput.value = res.url;
        editPreview.src = res.url;
        editPreviewWrap.style.display = 'block';
        editImageUrlPreview.textContent = res.url;
      }
    } catch (err) { alert('Error al subir imagen: ' + err.message); }
  }

  document.querySelector('#editImageRemove')?.addEventListener('click', () => {
    editHiddenInput.value = '';
    editPreview.src = '/frontend/assets/product-placeholder.svg';
    editImageUrlPreview.textContent = '';
  });

  // Toggle owner fields for consigned
  const editType = document.querySelector('#editType');
  const editOwnerFields = document.querySelector('#editOwnerFields');
  if (editType) {
    editType.addEventListener('change', () => {
      editOwnerFields.style.display = editType.value === 'consigned' ? 'block' : 'none';
    });
  }

  async function loadProduct() {
    try {
      const res = await api.getProduct(productId);
      const p = res.data || res;
      document.querySelector('#editTitle').value = p.title || '';
      document.querySelector('#editCategory').value = p.category || '';
      document.querySelector('#editPrice').value = p.price || '';
      document.querySelector('#editDescription').value = p.description || '';
      document.querySelector('#editStatus').value = p.status || 'active';
      editHiddenInput.value = p.image_url || '';
      editPreview.src = p.image_url || '/frontend/assets/product-placeholder.svg';
      editPreviewWrap.style.display = 'block';
      editImageUrlPreview.textContent = p.image_url || '';
      if (editType) {
        editType.value = p.type || 'regular';
        editOwnerFields.style.display = p.type === 'consigned' ? 'block' : 'none';
      }
      if (document.querySelector('#editOwnerName')) document.querySelector('#editOwnerName').value = p.owner_name || '';
      if (document.querySelector('#editOwnerContact')) document.querySelector('#editOwnerContact').value = p.owner_contact || '';
      const conditionRadios = document.querySelectorAll('[name="editCondition"]');
      conditionRadios.forEach(r => { if (r.value === p.condition) r.checked = true; });
    } catch (err) {
      document.querySelector('[style*="max-width: 800px"] > div:first-child h1').textContent = 'Producto no encontrado';
    }
  }

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      title: document.querySelector('#editTitle').value.trim(),
      category: document.querySelector('#editCategory').value,
      price: parseFloat(document.querySelector('#editPrice').value),
      description: document.querySelector('#editDescription').value.trim(),
      status: document.querySelector('#editStatus').value,
      condition: document.querySelector('[name="editCondition"]:checked')?.value || null,
      image_url: editHiddenInput.value.trim(),
      type: (document.querySelector('#editType')?.value || 'regular'),
      owner_name: (document.querySelector('#editOwnerName')?.value || '').trim(),
      owner_contact: (document.querySelector('#editOwnerContact')?.value || '').trim(),
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

// ---- Categories Management ----
const categoriesTable = document.querySelector('#categoriesTable');
if (categoriesTable) {
  const modal = document.querySelector('#categoryModal');
  const form = document.querySelector('#categoryForm');
  const modalTitle = document.querySelector('#modalTitle');
  const editId = document.querySelector('#editId');
  const catId = document.querySelector('#catId');
  const catName = document.querySelector('#catName');
  const catOrder = document.querySelector('#catOrder');
  const tbody = document.querySelector('#categoriesBody');

  function openModal(cat = null) {
    if (cat) {
      modalTitle.textContent = 'Editar Categoría';
      editId.value = cat.id;
      catId.value = cat.id;
      catId.readOnly = true;
      catName.value = cat.name;
      catOrder.value = cat.display_order || 0;
    } else {
      modalTitle.textContent = 'Nueva Categoría';
      editId.value = '';
      catId.value = '';
      catId.readOnly = false;
      catName.value = '';
      catOrder.value = '0';
    }
    modal.style.display = 'flex';
    catId.focus();
  }

  function closeModal() { modal.style.display = 'none'; }

  document.querySelector('#addCategoryBtn').addEventListener('click', () => openModal());
  document.querySelector('#modalClose').addEventListener('click', closeModal);
  document.querySelector('#modalCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();
    const payload = { id: catId.value.trim(), name: catName.value.trim(), display_order: parseInt(catOrder.value) || 0 };
    try {
      if (editId.value) {
        await api.updateCategory(token, editId.value, payload);
      } else {
        await api.createCategory(token, payload);
      }
      closeModal();
      loadCategories();
    } catch (err) { alert(err.message); }
  });

  async function loadCategories() {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tc-text-muted);padding:40px;">Cargando...</td></tr>';
    try {
      const res = await api.listCategoriesAdmin(getToken());
      const cats = res.data || [];
      if (cats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tc-text-muted);padding:40px;">No hay categorías</td></tr>';
        return;
      }
      tbody.innerHTML = cats.map(c => `
        <tr>
          <td><code style="background:var(--tc-surface-container);padding:2px 8px;border-radius:var(--tc-radius-sm);font-size:13px;">${c.id}</code></td>
          <td><strong>${c.name}</strong></td>
          <td>${c.display_order}</td>
          <td class="tc-table__actions">
            <button class="tc-table__action-btn" data-edit="${c.id}" title="Editar"><span class="material-symbols-outlined">edit</span></button>
            <button class="tc-table__action-btn danger" data-del="${c.id}" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = cats.find(x => x.id === btn.dataset.edit);
          if (c) openModal(c);
        });
      });

      tbody.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta categoría?')) return;
          try {
            await api.deleteCategory(getToken(), btn.dataset.del);
            loadCategories();
          } catch (err) { alert(err.message); }
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--tc-error);">Error: ${err.message}</td></tr>`;
    }
  }

  loadCategories();
}
