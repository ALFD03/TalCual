import { api } from '../services/api.js';

class CategoryPills extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<div class="hide-scrollbar" style="display:flex; overflow-x:auto; gap: var(--tc-sp-xs); padding-bottom: 4px; justify-content: center;"><div class="skeleton skeleton-line" style="height:40px; width:120px;"></div><div class="skeleton skeleton-line" style="height:40px; width:100px;"></div></div>`;
    try {
      const cats = await api.getCategories();
      const categories = Array.isArray(cats) ? cats : cats?.data || [];
      this.render(categories);
    } catch {
      this.render([]);
    }
  }

  render(categories) {
    const all = [{ id: '', name: 'Todos' }, ...(Array.isArray(categories) ? categories : [])];
    this.innerHTML = `<div class="hide-scrollbar" style="display:flex; overflow-x:auto; gap: var(--tc-sp-xs); padding-bottom: 4px; justify-content: start;" style="justify-content: md:center;">${all.map((c) => `
      <button class="pill${c.id === '' ? ' active' : ''}" data-cat="${c.id}">${c.name}</button>
    `).join('')}</div>`;

    this.querySelectorAll('.pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.querySelector('.pill.active')?.classList.remove('active');
        btn.classList.add('active');
        document.dispatchEvent(new CustomEvent('category:change', { detail: btn.dataset.cat }));
      });
    });
  }
}
customElements.define('category-pills', CategoryPills);
