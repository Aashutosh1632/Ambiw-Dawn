/* Custom Nav — desktop mega menu + mobile drawer
 * Self-contained custom element. Registers as <custom-nav>.
 * Idempotent: skips re-defining if already registered (safe under section reload).
 */
(function () {
  if (customElements.get('custom-nav')) return;

  const HOVER_OPEN_DELAY = 80;
  const HOVER_CLOSE_DELAY = 160;
  const DRAWER_TRANSITION_MS = 280;

  class CustomNav extends HTMLElement {
    constructor() {
      super();
      this._closeTimer = null;
      this._openItem = null;
    }

    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this._bindMega();
      this._bindGlobalDismiss();
      this._bindMobileDrawer();
    }

    /* -------- Desktop mega menu -------- */

    _bindMega() {
      this.querySelectorAll('.ds-nav__item--has-mega').forEach((item) => {
        const trigger = item.querySelector('.ds-nav__trigger');
        const mega = item.querySelector('[data-mega]');
        if (!trigger || !mega) return;

        // Hover (desktop)
        item.addEventListener('mouseenter', () => {
          if (!this._isDesktop()) return;
          this._cancelClose();
          this._openMega(item);
        });
        item.addEventListener('mouseleave', () => {
          if (!this._isDesktop()) return;
          this._scheduleClose(item);
        });

        // Click / keyboard (works on touch + a11y)
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          if (this._isOpen(item)) this._closeMega(item);
          else this._openMega(item);
        });

        // L2 sidebar pane switching
        item.querySelectorAll('.ds-mega__l2').forEach((l2) => {
          const idx = l2.dataset.l2;
          const activate = () => this._activatePane(item, idx);
          l2.addEventListener('mouseenter', activate);
          const link = l2.querySelector('a');
          if (link) link.addEventListener('focus', activate);
        });
      });
    }

    _isDesktop() {
      return window.matchMedia('(min-width: 990px)').matches;
    }

    _isOpen(item) {
      return item.classList.contains('is-open');
    }

    _openMega(item) {
      // Close other open items
      this.querySelectorAll('.ds-nav__item--has-mega.is-open').forEach((other) => {
        if (other !== item) this._closeMega(other);
      });
      const trigger = item.querySelector('.ds-nav__trigger');
      const mega = item.querySelector('[data-mega]');
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      mega.classList.add('is-open');
      this._openItem = item;
    }

    _closeMega(item) {
      const trigger = item.querySelector('.ds-nav__trigger');
      const mega = item.querySelector('[data-mega]');
      item.classList.remove('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (mega) mega.classList.remove('is-open');
      if (this._openItem === item) this._openItem = null;
    }

    _scheduleClose(item) {
      this._cancelClose();
      this._closeTimer = setTimeout(() => this._closeMega(item), HOVER_CLOSE_DELAY);
    }

    _cancelClose() {
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
    }

    _activatePane(item, idx) {
      item.querySelectorAll('.ds-mega__l2').forEach((l2) => {
        l2.classList.toggle('is-active', l2.dataset.l2 === idx);
      });
      item.querySelectorAll('.ds-mega__pane').forEach((pane) => {
        pane.classList.toggle('is-active', pane.dataset.pane === idx);
      });
    }

    _bindGlobalDismiss() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.querySelectorAll('.ds-nav__item--has-mega.is-open').forEach((item) => this._closeMega(item));
          this._closeDrawer();
        }
      });
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) {
          this.querySelectorAll('.ds-nav__item--has-mega.is-open').forEach((item) => this._closeMega(item));
        }
      });
    }

    /* -------- Mobile drawer -------- */

    _bindMobileDrawer() {
      this._hamburger = this.querySelector('.ds-nav__hamburger');
      this._drawer = this.querySelector('[data-drawer]');
      if (!this._hamburger || !this._drawer) return;

      this._hamburger.addEventListener('click', () => this._openDrawer());

      this._drawer.querySelectorAll('[data-drawer-close]').forEach((el) => {
        el.addEventListener('click', () => this._closeDrawer());
      });
    }

    _openDrawer() {
      if (!this._drawer) return;
      this._hamburger.setAttribute('aria-expanded', 'true');
      this._drawer.removeAttribute('hidden');
      // Force layout, then animate
      // eslint-disable-next-line no-unused-expressions
      this._drawer.offsetWidth;
      this._drawer.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
    }

    _closeDrawer() {
      if (!this._drawer || !this._drawer.classList.contains('is-open')) return;
      this._hamburger.setAttribute('aria-expanded', 'false');
      this._drawer.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      setTimeout(() => {
        if (!this._drawer.classList.contains('is-open')) {
          this._drawer.setAttribute('hidden', '');
        }
      }, DRAWER_TRANSITION_MS);
    }
  }

  customElements.define('custom-nav', CustomNav);
})();
