class PaginationControls extends HTMLElement {
  constructor() {
    super();
    this._page = 1;
    this._total = 0;
    this._perPage = 12;
  }

  connectedCallback() {
    this._target = this.dataset.target || 'catalogo';
    this.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; gap: var(--tc-sp-md); margin-top: var(--tc-sp-xl); flex-wrap: wrap;"></div>`;
    document.addEventListener('pagination:set', (e) => {
      if (e.detail.target === this._target) {
        this._page = e.detail.pagination.page || 1;
        this._total = e.detail.pagination.total || 0;
        this._perPage = e.detail.pagination.per_page || this._perPage;
        this.render();
      }
    });
  }

  render() {
    const totalPages = Math.ceil(this._total / this._perPage);
    if (totalPages <= 1) { this.innerHTML = ''; return; }
    const wrap = this.firstElementChild;
    if (!wrap) return;
    wrap.innerHTML = `
      <span style="color: var(--tc-text-muted); font-size: 13px;">Mostrando <strong>${(this._page - 1) * this._perPage + 1}</strong> a <strong>${Math.min(this._page * this._perPage, this._total)}</strong> de <strong>${this._total}</strong> productos</span>
      <div style="display:flex; gap: 4px; align-items: center;">
        <button class="pagination__page" data-go="${this._page - 1}" ${this._page <= 1 ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size: 18px;">chevron_left</span></button>
        ${this._buildPages(totalPages)}
        <button class="pagination__page" data-go="${this._page + 1}" ${this._page >= totalPages ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span></button>
      </div>
    `;
    wrap.querySelectorAll('[data-go]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.go);
        if (page >= 1 && page <= totalPages) {
          document.dispatchEvent(new CustomEvent('page:change', { detail: { target: this._target, page } }));
        }
      });
    });
  }

  _buildPages(total) {
    let html = '';
    const start = Math.max(1, this._page - 2);
    const end = Math.min(total, this._page + 2);
    if (start > 1) html += `<button class="pagination__page" data-go="1">1</button>`;
    if (start > 2) html += `<span style="color: var(--tc-text-muted); padding: 0 4px;">...</span>`;
    for (let i = start; i <= end; i++) {
      html += `<button class="pagination__page${i === this._page ? ' active' : ''}" data-go="${i}">${i}</button>`;
    }
    if (end < total - 1) html += `<span style="color: var(--tc-text-muted); padding: 0 4px;">...</span>`;
    if (end < total) html += `<button class="pagination__page" data-go="${total}">${total}</button>`;
    return html;
  }
}
customElements.define('pagination-controls', PaginationControls);
