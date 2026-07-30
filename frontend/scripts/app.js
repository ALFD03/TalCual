// ============================================================
// TAL CUAL · Entry point
// ============================================================
import './components/site-header.js';
import './components/site-footer.js';
import './components/mobile-menu.js';
import './components/toast-notif.js';
import './components/cart-drawer.js';
import './components/product-grid.js';
import './components/category-pills.js';
import './components/pagination-controls.js';

// Catálogo page: search, sort, condition filters
document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('[data-catalog-search]');
  const sort = document.querySelector('[data-catalog-sort]');
  const condition = document.querySelector('[data-catalog-condition]');

  if (search) {
    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => document.dispatchEvent(new CustomEvent('search:change', { detail: search.value.trim() })), 300);
    });
  }
  if (sort) {
    sort.addEventListener('change', () => document.dispatchEvent(new CustomEvent('sort:change', { detail: sort.value })));
  }
  if (condition) {
    condition.addEventListener('change', () => document.dispatchEvent(new CustomEvent('condition:change', { detail: condition.value })));
  }

  // WhatsApp links on vender/nosotros pages
  const wa = document.querySelector('#whatsappVender, #whatsappNosotros');
  if (wa) {
    wa.href = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola TAL CUAL, quiero más información sobre consignación.')}`;
  }
});
