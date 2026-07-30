import { getCart, addToCart, setQty, removeItem, clearCart, checkoutWhatsApp, loadConfig } from '../services/cart.js';
import { formatPrice, conditionLabel } from '../services/format.js';
import { toast } from './toast-notif.js';

class CartDrawer extends HTMLElement {
  async connectedCallback() {
    await loadConfig();
    this.innerHTML = `
      <div class="drawer-backdrop" data-close></div>
      <aside class="drawer" id="cartDrawer" aria-label="Carrito de compras">
        <div class="drawer__header">
          <div class="drawer__title">
            <span class="material-symbols-outlined" style="color: var(--tc-primary); font-size: 28px;">shopping_cart</span>
            <h2>Tu Oportunidad</h2>
            <span class="drawer__count" data-count>0</span>
          </div>
          <button class="btn-icon" data-close aria-label="Cerrar"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="drawer__body" data-body>
          <div class="empty-state">
            <span class="material-symbols-outlined">shopping_bag</span>
            <h3>Tu carrito está vacío</h3>
            <p>Explora el catálogo y conecta oportunidades.</p>
          </div>
        </div>
        <div class="drawer__footer" data-footer style="display:none;">
          <div class="cart-summary">
            <div class="cart-summary__row"><span data-subtotal-label>Subtotal (0 artículos)</span><span data-subtotal>$0.00</span></div>
            <div class="cart-summary__row"><span>Costo de envío</span><span style="color: var(--tc-text-muted); font-size: 13px; font-style: italic;">A coordinar</span></div>
            <div class="cart-summary__total"><span class="cart-summary__total-label">Total</span><span class="cart-summary__total-value" data-total>$0.00</span></div>
          </div>
          <div class="field" style="margin-bottom: 12px;">
            <input class="input" id="custName" type="text" placeholder="Nombre y Apellido" />
          </div>
          <div class="field" style="margin-bottom: 12px;">
            <textarea class="textarea" id="custNote" rows="2" placeholder="Nota sobre el pedido (opcional)"></textarea>
          </div>
          <button class="btn btn-whatsapp btn-block btn-lg" id="checkoutBtn" style="font-weight:700;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
            Confirmar Pedido por WhatsApp
          </button>
          <p style="text-align:center; color: var(--tc-text-muted); font-size: 12px; margin-top: 12px; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span class="material-symbols-outlined" style="font-size:14px;">info</span>
            Al presionar serás redirigido para coordinar pago y entrega.
          </p>
        </div>
      </aside>
    `;
    this.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => this.close()));
    this.querySelector('#checkoutBtn').addEventListener('click', () => this.checkout());
    document.addEventListener('cart:checkout-complete', () => this.closeAndClear());
    document.addEventListener('cart:open', () => this.open());
    document.addEventListener('cart:change', () => this.render());
    this.render();
  }

  open() {
    this.querySelector('.drawer-backdrop').classList.add('open');
    this.querySelector('.drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  close() {
    this.querySelector('.drawer-backdrop').classList.remove('open');
    this.querySelector('.drawer').classList.remove('open');
    document.body.style.overflow = '';
  }

  render() {
    const { items, total, count } = getCart();
    const body = this.querySelector('[data-body]');
    const footer = this.querySelector('[data-footer]');
    this.querySelector('[data-count]').textContent = count;
    if (items.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined">shopping_bag</span>
          <h3>Tu carrito está vacío</h3>
          <p>Explora el catálogo y conecta oportunidades.</p>
        </div>`;
      footer.style.display = 'none';
      return;
    }
    footer.style.display = 'block';
    this.querySelector('[data-subtotal-label]').textContent = `Subtotal (${count} ${count === 1 ? 'artículo' : 'artículos'})`;
    this.querySelector('[data-subtotal]').textContent = formatPrice(total);
    this.querySelector('[data-total]').textContent = formatPrice(total);

    body.innerHTML = items.map((item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__media">
          <img src="${item.image_url || '/frontend/assets/product-placeholder.svg'}" alt="" onerror="this.src='/frontend/assets/product-placeholder.svg'" />
          <span class="badge ${item.condition === 'nuevo' ? 'badge-primary' : ''}" style="position:absolute; top:0; right:0; font-size: 9px; padding: 2px 6px; border-bottom-left-radius: 8px; border-top-right-radius: 8px;">${conditionLabel(item.condition)}</span>
        </div>
        <div class="cart-item__body">
          <div>
            <div style="display:flex; justify-content: space-between; gap: 8px;">
              <h3 class="cart-item__title">${item.title}</h3>
              <button class="cart-item__remove" data-action="remove" aria-label="Eliminar"><span class="material-symbols-outlined" style="font-size:20px;">delete</span></button>
            </div>
            <p class="cart-item__price">${formatPrice(item.price)}</p>
          </div>
          <div class="cart-item__row">
            <div class="cart-item__qty">
              <button data-action="dec" aria-label="Restar"><span class="material-symbols-outlined" style="font-size:16px;">remove</span></button>
              <span>${item.qty}</span>
              <button data-action="inc" aria-label="Sumar"><span class="material-symbols-outlined" style="font-size:16px;">add</span></button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    body.querySelectorAll('.cart-item').forEach((el) => {
      const id = el.dataset.id;
      el.querySelector('[data-action="inc"]').addEventListener('click', () => {
        const cur = getCart().items.find((i) => i.id === id);
        setQty(id, cur.qty + 1);
      });
      el.querySelector('[data-action="dec"]').addEventListener('click', () => {
        const cur = getCart().items.find((i) => i.id === id);
        setQty(id, cur.qty - 1);
      });
      el.querySelector('[data-action="remove"]').addEventListener('click', () => {
        removeItem(id);
        toast('Producto eliminado');
      });
    });
  }

  async checkout() {
    const name = this.querySelector('#custName')?.value?.trim() || '';
    const note = this.querySelector('#custNote')?.value?.trim() || '';
    const { count } = getCart();
    if (count === 0) { toast('Tu carrito está vacío'); return; }
    this.querySelector('#checkoutBtn').disabled = true;
    try {
      await checkoutWhatsApp({ name, note });
      clearCart();
      toast('Pedido enviado. Abriendo WhatsApp...');
    } catch (e) {
      toast('Error al procesar el pedido');
    } finally {
      this.querySelector('#checkoutBtn').disabled = false;
    }
  }

  closeAndClear() {
    this.close();
    clearCart();
  }
}
customElements.define('cart-drawer', CartDrawer);
