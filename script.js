// ==========================================================================
// AURA STUDIO — script ligero: menú móvil, navbar al hacer scroll,
// revelado de secciones y envío simulado del formulario de contacto.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Menú hamburguesa (móvil) ---------------------------------------
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function toggleMenu(forceClose = false) {
    const isOpen = !forceClose && !menuBtn.classList.contains('is-open');
    menuBtn.classList.toggle('is-open', isOpen);
    mobileMenu.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => toggleMenu());
  mobileLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(true)));

  // --- Sombra en la cabecera al hacer scroll ---------------------------
  const header = document.getElementById('header');

  function updateHeaderState() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  // --- Revelado suave de secciones al hacer scroll ----------------------
  const revealTargets = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // --- Envío simulado del formulario de contacto ------------------------
  const form = document.getElementById('contactForm');

  if (form) {
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const feedback = document.getElementById('formFeedback');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      btnText.textContent = 'Enviando...';
      btnSpinner.hidden = false;
      feedback.hidden = true;

      setTimeout(() => {
        btnText.textContent = 'Enviado';
        btnSpinner.hidden = true;
        feedback.hidden = false;
        form.reset();

        setTimeout(() => {
          btnText.textContent = 'Enviar Propuesta';
          feedback.hidden = true;
        }, 4000);
      }, 900);
    });
  }

  // --- Consentimiento de cookies (RGPD / LSSI-CE art. 22.2) --------------
  initCookieConsent();

});

/**
 * Gestiona el aviso de cookies: se muestra en la primera visita, guarda la
 * elección del usuario en localStorage y sólo activa la carga de scripts de
 * medición (p. ej. Google Analytics) si éste ha dado su consentimiento
 * explícito para la categoría "analytics". Las cookies técnicas necesarias
 * para el funcionamiento del sitio no requieren consentimiento (art. 22.2 LSSI-CE).
 */
function initCookieConsent() {
  const STORAGE_KEY = 'aura_cookie_consent';

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(consent) {
    const value = { necessary: true, analytics: !!consent.analytics, timestamp: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (e) {
      /* localStorage no disponible (modo privado, cookies bloqueadas, etc.) */
    }
    applyConsent(value);
  }

  function applyConsent(consent) {
    if (consent.analytics) {
      loadAnalytics();
    }
  }

  function loadAnalytics() {
    if (window.__auraAnalyticsLoaded) return;
    window.__auraAnalyticsLoaded = true;
    // Punto único de activación diferida de Google Analytics (u otra herramienta
    // de medición). Sólo se ejecuta tras consentimiento explícito del usuario.
    // Sustituye 'G-XXXXXXXXXX' por el ID de medición real antes de publicar:
    //
    // const gaScript = document.createElement('script');
    // gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    // gaScript.async = true;
    // document.head.appendChild(gaScript);
    // window.dataLayer = window.dataLayer || [];
    // function gtag() { dataLayer.push(arguments); }
    // gtag('js', new Date());
    // gtag('config', 'G-XXXXXXXXXX');
  }

  function buildModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'cookie-modal-backdrop';
    backdrop.id = 'cookieModalBackdrop';
    backdrop.innerHTML = `
      <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookieModalTitle">
        <h3 id="cookieModalTitle">Preferencias de cookies</h3>
        <p>Elige qué categorías de cookies permites. Puedes cambiar esta configuración cuando quieras desde "Configurar Cookies" en el pie de página.</p>

        <div class="cookie-modal__row">
          <div>
            <h4>Necesarias</h4>
            <p>Imprescindibles para el funcionamiento del sitio. Siempre activas.</p>
          </div>
          <label class="switch">
            <input type="checkbox" checked disabled aria-label="Cookies necesarias (siempre activas)">
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="cookie-modal__row">
          <div>
            <h4>Analítica</h4>
            <p>Miden el tráfico y el uso del sitio para poder mejorarlo (p. ej. Google Analytics).</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="analyticsToggle" aria-label="Cookies analíticas">
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="cookie-modal__actions">
          <button type="button" id="cookieModalSaveBtn" class="is-primary">Guardar preferencias</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookieBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <div class="cookie-banner__inner">
        <p class="cookie-banner__text">
          Utilizamos cookies propias y, en su caso, de terceros para el funcionamiento del sitio y,
          con tu consentimiento, para analizar la navegación. Puedes aceptarlas todas, rechazar las
          no esenciales o configurarlas. Más información en nuestra
          <a href="politica-cookies.html">Política de Cookies</a>.
        </p>
        <div class="cookie-banner__actions">
          <button type="button" id="cookieRejectBtn">Rechazar no esenciales</button>
          <button type="button" id="cookieSettingsOpenBtn">Personalizar</button>
          <button type="button" id="cookieAcceptBtn" class="is-primary">Aceptar todo</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));
    return banner;
  }

  const existingConsent = getConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
  }

  const modalBackdrop = buildModal();
  const analyticsToggle = modalBackdrop.querySelector('#analyticsToggle');

  function openModal() {
    const current = getConsent();
    analyticsToggle.checked = !!(current && current.analytics);
    modalBackdrop.classList.add('is-open');
  }

  function closeModal() {
    modalBackdrop.classList.remove('is-open');
  }

  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) closeModal();
  });

  modalBackdrop.querySelector('#cookieModalSaveBtn').addEventListener('click', () => {
    setConsent({ analytics: analyticsToggle.checked });
    closeModal();
    hideBanner();
  });

  let banner = null;

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => banner && banner.remove(), 500);
    banner = null;
  }

  if (!existingConsent) {
    banner = buildBanner();

    banner.querySelector('#cookieAcceptBtn').addEventListener('click', () => {
      setConsent({ analytics: true });
      hideBanner();
    });

    banner.querySelector('#cookieRejectBtn').addEventListener('click', () => {
      setConsent({ analytics: false });
      hideBanner();
    });

    banner.querySelector('#cookieSettingsOpenBtn').addEventListener('click', openModal);
  }

  // Botón "Configurar Cookies" del pie de página: reabre el panel en cualquier momento.
  const settingsBtn = document.getElementById('cookieSettingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openModal);
  }
}
