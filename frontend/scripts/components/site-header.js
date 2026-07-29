// ============================================================
// <site-header data-active="inicio|catalogo|vender|nosotros"></site-header>
// ============================================================
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.dataset.active || '';
    this.innerHTML = `
      <header class="site-header">
        <div class="site-header__inner">
          <button class="site-header__menu-btn btn-icon" id="mobileMenuBtn" aria-label="Menú">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <a class="site-header__brand" href="/" aria-label="TAL CUAL - Inicio">
            <img src="/frontend/assets/logo.svg" alt="TAL CUAL" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
            <span class="site-header__brand-name" style="display:none;">TAL CUAL</span>
          </a>
          <nav class="site-header__nav">
            <a class="site-header__link ${active === 'inicio' ? 'active' : ''}" href="/">Inicio</a>
            <a class="site-header__link ${active === 'catalogo' ? 'active' : ''}" href="/catalogo">Catálogo</a>
            <a class="site-header__link ${active === 'vender' ? 'active' : ''}" href="/vender">Vender</a>
            <a class="site-header__link ${active === 'nosotros' ? 'active' : ''}" href="/nosotros">Nosotros</a>
          </nav>
          <div class="site-header__actions">
            <div class="search-box">
              <span class="material-symbols-outlined" style="color: var(--tc-text-muted); font-size: 20px;">search</span>
              <input class="search-box__input" type="search" placeholder="Buscar..." aria-label="Buscar" />
            </div>
            <button class="btn-icon cart-trigger" id="cartBtn" aria-label="Carrito">
              <span class="material-symbols-outlined">shopping_cart</span>
              <span class="cart-trigger__count empty" data-cart-count>0</span>
            </button>
            <a class="btn-icon" href="/admin" aria-label="Admin" style="display:none" id="adminLink">
              <span class="material-symbols-outlined">account_circle</span>
            </a>
          </div>
        </div>
      </header>
    `;

    this.querySelector('#cartBtn').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('cart:open'));
    });
    this.querySelector('#mobileMenuBtn').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('menu:open'));
    });
    const search = this.querySelector('.search-box__input');
    if (search) {
      search.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && search.value.trim()) {
          window.location.href = `/catalogo?q=${encodeURIComponent(search.value.trim())}`;
        }
      });
    }

    // Document listeners
    const update = () => {
      const c = JSON.parse(localStorage.getItem('talcual-cart-v1') || '[]').reduce((n, i) => n + i.qty, 0);
      const el = this.querySelector('[data-cart-count]');
      el.textContent = c;
      el.classList.toggle('empty', c === 0);
      if (localStorage.getItem('talcual-admin-token')) {
        this.querySelector('#adminLink').style.display = 'inline-flex';
      }
    };
    document.addEventListener('cart:change', update);
    update();
  }
}
customElements.define('site-header', SiteHeader);
