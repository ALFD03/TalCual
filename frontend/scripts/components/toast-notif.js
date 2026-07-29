class ToastNotif extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="toast" id="toast"></div>`;
    document.addEventListener('toast:show', (e) => this.show(e.detail));
  }
  show(msg) {
    const t = this.querySelector('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => t.classList.remove('show'), 2600);
  }
}
customElements.define('toast-notif', ToastNotif);
export function toast(msg) {
  document.dispatchEvent(new CustomEvent('toast:show', { detail: msg }));
}
