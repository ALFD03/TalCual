class SiteFooter extends HTMLElement {
  async connectedCallback() {
    let whatsappNumber = '584249039269';
    try {
      const r = await fetch('/api/meta?type=config');
      if (r.ok) {
        const json = await r.json();
        if (json.data?.whatsapp_number) whatsappNumber = json.data.whatsapp_number;
      }
    } catch (_) {}

    const msg = encodeURIComponent('Hola TAL CUAL, quiero más información sobre sus servicios.');

    this.innerHTML = `
      <footer class="site-footer">
        <div class="site-footer__inner">
          <div class="site-footer__col">
            <span class="site-footer__brand">TAL CUAL</span>
            <p style="color: var(--tc-on-surface-variant);">Porque cada objeto tiene una historia... y en Tal Cual puede comenzar una nueva.</p>
            <div style="display:flex; gap: var(--tc-sp-md); margin-top: 8px;">
              <a href="#" aria-label="Instagram" class="btn-icon"><span class="material-symbols-outlined">photo_camera</span></a>
              <a href="https://wa.me/${whatsappNumber}?text=${msg}" aria-label="WhatsApp" class="btn-icon" target="_blank" rel="noopener"><span class="material-symbols-outlined">chat</span></a>
            </div>
          </div>
          <div class="site-footer__col">
            <h4 style="color: var(--tc-primary); font-weight: 700;">Visítanos</h4>
            <div style="display:flex; align-items:flex-start; gap: 6px; color: var(--tc-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 18px; color: var(--tc-outline);">location_on</span>
              <span>CC Capadoro Local 19</span>
            </div>
            <div style="display:flex; align-items:flex-start; gap: 6px; color: var(--tc-on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 18px; color: var(--tc-outline);">schedule</span>
              <span>Lunes a Sábado: 9am - 6pm</span>
            </div>
          </div>
          <div class="site-footer__col">
            <h4 style="color: var(--tc-primary); font-weight: 700;">Contacto</h4>
            <a href="https://wa.me/${whatsappNumber}?text=${msg}" class="btn btn-whatsapp" style="align-self: flex-start; margin-bottom: var(--tc-sp-sm);" target="_blank" rel="noopener">
              <span class="material-symbols-outlined" style="font-size: 20px;">chat</span>
              WhatsApp
            </a>
            <a href="#" style="color: var(--tc-on-surface-variant); font-size: 14px;">Política de Devoluciones</a>
          </div>
        </div>
        <div class="site-footer__bottom">TAL CUAL © ${new Date().getFullYear()} - Conectamos Oportunidades</div>
      </footer>
    `;
  }
}
customElements.define('site-footer', SiteFooter);
