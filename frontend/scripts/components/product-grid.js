import { api } from '../services/api.js';
import { formatPrice, conditionLabel } from '../services/format.js';
import { addToCart, getCart } from '../services/cart.js';
import { toast } from './toast-notif.js';

class ProductGrid extends HTMLElement {
  constructor() {
    super();
    this._page = 1;
  }

  async connectedCallback() {
    this._limit = parseInt(this.dataset.limit) || 12;
    this._source = this.dataset.source || 'catalogo';
    this._queryMode = this.hasAttribute('data-query');
    await this.load();
    document.addEventListener('category:change', (e) => { this._category = e.detail; this._page = 1; this.load(); });
    document.addEventListener('search:change', (e) => { this._search = e.detail; this._page = 1; this.load(); });
    document.addEventListener('sort:change', (e) => { this._sort = e.detail; this._page = 1; this.load(); });
    document.addEventListener('condition:change', (e) => { this._condition = e.detail; this._page = 1; this.load(); });
    document.addEventListener('page:change', (e) => {
      if (e.detail.target === this._source) { this._page = e.detail.page; this.load(); }
    });
  }

  async load() {
    this.innerHTML = `<div class="grid-products">${'<div class="skeleton-card"><div class="skeleton-media skeleton"></div><div class="skeleton-body"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div></div>'.repeat(Math.min(this._limit, 4))}</div>`;
    try {
      const params = { limit: this._limit, page: this._page, category: this._category || '', q: this._search || '', sort: this._sort || '', condition: this._condition || '' };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await api.getProducts(params);
      const products = res.data || res.products || res || [];
      if (!Array.isArray(products)) {
        this.render([]);
        return;
      }
      this.render(products);
      if (res.pagination) {
        document.dispatchEvent(new CustomEvent('pagination:set', { detail: { target: this._source, pagination: res.pagination } }));
      }
    } catch (err) {
      this.render([]);
    }
  }

  render(products) {
    if (products.length === 0) {
      this.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <span class="material-symbols-outlined">search_off</span>
        <h3>No encontramos productos</h3>
        <p>Prueba ajustando los filtros o la búsqueda.</p>
      </div>`;
      return;
    }
    this.innerHTML = `<div class="grid-products">${products.map((p) => `
      <article class="product-card">
        <div class="product-card__media">
          <img src="${p.image_url || '/frontend/assets/product-placeholder.svg'}" alt="${p.title}" loading="lazy" onerror="this.src='/frontend/assets/product-placeholder.svg'" />
          <span class="product-card__badge badge ${p.condition === 'nuevo' ? 'badge-primary' : ''}">${conditionLabel(p.condition)}</span>
          <button class="product-card__fav" data-fav="${p.id}" aria-label="Favorito"><span class="material-symbols-outlined">favorite_border</span></button>
        </div>
        <div class="product-card__body">
          <h3 class="product-card__title line-clamp-2">${p.title}</h3>
          <div class="product-card__price-row">
            <span class="product-card__price">${formatPrice(p.price)}</span>
            <button class="product-card__add" data-add="${p.id}" data-title="${p.title}" data-price="${p.price}" data-image="${p.image_url || ''}" data-condition="${p.condition || ''}" data-category="${p.category || ''}" aria-label="Agregar al carrito">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </article>
    `).join('')}</div>`;

    this.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const data = { title: btn.dataset.title, price: Number(btn.dataset.price), image_url: btn.dataset.image, condition: btn.dataset.condition, category: btn.dataset.category };
        addToCart(btn.dataset.add, data);
        toast('Agregado al carrito');
      });
    });
  }
}
customElements.define('product-grid', ProductGrid);
