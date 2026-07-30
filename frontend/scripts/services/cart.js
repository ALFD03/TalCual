// ============================================================
// TAL CUAL · Carrito (localStorage)
// ============================================================
import { api } from './api.js';

const STORAGE_KEY = 'talcual-cart-v1';
const CONFIG_URL = '/api/meta?type=config';

let config = { whatsappNumber: '584249039269' };

export async function loadConfig() {
  try {
    const r = await fetch(CONFIG_URL);
    if (r.ok) {
      const json = await r.json();
      if (json.data?.whatsapp_number) config.whatsappNumber = json.data.whatsapp_number;
    }
  } catch (_) { /* fallback por defecto */ }
  return config;
}

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function write(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  notify();
}
function notify() {
  document.dispatchEvent(new CustomEvent('cart:change', { detail: getCart() }));
}

export function getCart() {
  const items = read();
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  return { items, count, total: Number(total.toFixed(2)) };
}

export function addToCart(productId, productData) {
  const cart = read();
  const existing = cart.find((i) => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1, title: productData.title, price: Number(productData.price), image_url: productData.image_url, condition: productData.condition, category: productData.category });
  write(cart);
}

export function setQty(productId, qty) {
  let cart = read();
  if (qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  } else {
    const item = cart.find((i) => i.id === productId);
    if (item) item.qty = qty;
  }
  write(cart);
}

export function removeItem(productId) {
  const cart = read().filter((i) => i.id !== productId);
  write(cart);
  const remaining = getCartEmpty();
}

export function clearCart() { write([]); }

function getCartEmpty() { return 0; }

export async function checkoutWhatsApp(customer = {}) {
  const { items, total, count } = getCart();
  if (items.length === 0) return null;

  // Guardar el pedido en backend (no bloquea WhatsApp si falla)
  try {
    await api.createOrder({ items, total, count, customer });
  } catch (_) { /* si el backend falla, igual abre WhatsApp */ }

  const lines = items.map((i, idx) => `${idx + 1}. ${i.title} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`).join('%0A');
  const customerMsg = customer.name ? `%0A%0A*Cliente:* ${encodeURIComponent(customer.name)}${customer.note ? `%0A*Nota:* ${encodeURIComponent(customer.note)}` : ''}` : '';
  const msg = `¡Hola TAL CUAL! 👋%0AQuiero confirmar este pedido:%0A%0A${lines}%0A%0A*Total: $${total.toFixed(2)}*${customerMsg}`;
  const url = `https://wa.me/${config.whatsappNumber}?text=${msg}`;
  window.open(url, '_blank', 'noopener');
  return url;
}
