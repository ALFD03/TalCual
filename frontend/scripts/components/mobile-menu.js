class MobileMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu__backdrop" data-close></div>
        <div class="mobile-menu__panel">
          <a class="site-header__brand" href="/" style="margin-bottom: var(--tc-sp-lg);">
            <span class="site-header__brand-name">TAL CUAL</span>
          </a>
          <a class="mobile-menu__link" href="/">Inicio</a>
          <a class="mobile-menu__link" href="/catalogo">Catálogo</a>
          <a class="mobile-menu__link" href="/vender">Vender</a>
          <a class="mobile-menu__link" href="/nosotros">Nosotros</a>
          <a class="mobile-menu__link" href="/admin" style="color: var(--tc-secondary);">Admin</a>
          <button class="btn btn-ghost" data-close style="margin-top: auto;">Cerrar</button>
        </div>
      </div>
    `;
    this.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => this.close()));
    document.addEventListener('menu:open', () => this.open());
  }
  open() { this.querySelector('#mobileMenu').classList.add('open'); document.body.style.overflow = 'hidden'; }
  close() { this.querySelector('#mobileMenu').classList.remove('open'); document.body.style.overflow = ''; }
}
customElements.define('mobile-menu', MobileMenu);
