// Utilidades de formato
export function formatPrice(value) {
  const n = Number(value || 0);
  return n.toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).replace('US$', '$');
}

export function conditionLabel(cond) {
  const map = { nuevo: 'Nuevo', como_nuevo: 'Como Nuevo', segunda_mano: 'Segunda Mano' };
  return map[cond] || cond || '';
}

export function conditionBadgeClass(cond) {
  return cond === 'nuevo' ? 'badge-primary' : 'badge';
}

export function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;' }[c]));
}
