/* Featured Cards Carousel — pure-scroll-snap with arrow nav, dots, optional autoplay
 * Idempotent custom element. Safe under section reload.
 */
(function () {
  if (customElements.get('fcc-carousel')) return;

  class FccCarousel extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;

      this._track = this.querySelector('[data-fcc-track]');
      this._prev  = this.querySelector('[data-fcc-prev]');
      this._next  = this.querySelector('[data-fcc-next]');
      this._dots  = Array.prototype.slice.call(this.querySelectorAll('[data-fcc-dot]'));
      if (!this._track) return;

      this._onScroll = this._onScroll.bind(this);
      this._tick     = this._tick.bind(this);

      if (this._prev) this._prev.addEventListener('click', () => this._scrollByOne(-1));
      if (this._next) this._next.addEventListener('click', () => this._scrollByOne(1));
      this._dots.forEach((d, i) => d.addEventListener('click', () => this._scrollTo(i)));

      this._track.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('resize', this._onScroll);

      // Optional autoplay
      this._delay = parseInt(this.dataset.fccAutoplay, 10) || 0;
      if (this._delay > 0) {
        this._paused = false;
        this.addEventListener('mouseenter', () => { this._paused = true;  });
        this.addEventListener('mouseleave', () => { this._paused = false; });
        this._track.addEventListener('pointerdown', () => { this._paused = true; });
        if ('IntersectionObserver' in window) {
          this._io = new IntersectionObserver((entries) => {
            entries.forEach((e) => e.isIntersecting ? this._start() : this._stop());
          }, { threshold: 0.1 });
          this._io.observe(this);
        } else {
          this._start();
        }
      }

      this._update();
    }

    disconnectedCallback() {
      this._stop();
      if (this._io) this._io.disconnect();
    }

    _step() {
      const first = this._track.children[0];
      if (!first) return 0;
      const cs = getComputedStyle(this._track);
      const gap = parseFloat(cs.columnGap || cs.gap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    _scrollByOne(dir) {
      this._track.scrollBy({ left: dir * this._step(), behavior: 'smooth' });
    }

    _scrollTo(i) {
      this._track.scrollTo({ left: i * this._step(), behavior: 'smooth' });
    }

    _onScroll() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => this._update());
    }

    _update() {
      const step = this._step();
      if (!step) return;
      const idx = Math.max(0, Math.min(
        Math.round(this._track.scrollLeft / step),
        this._track.children.length - 1
      ));
      if (this._prev) this._prev.disabled = this._track.scrollLeft <= 1;
      if (this._next) this._next.disabled =
        this._track.scrollLeft + this._track.clientWidth >= this._track.scrollWidth - 1;
      this._dots.forEach((d, i) => {
        if (i === idx) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    _tick() {
      if (this._paused) return;
      const atEnd = this._track.scrollLeft + this._track.clientWidth >= this._track.scrollWidth - 1;
      if (atEnd) this._track.scrollTo({ left: 0, behavior: 'smooth' });
      else this._track.scrollBy({ left: this._step(), behavior: 'smooth' });
    }

    _start() {
      this._stop();
      this._timer = setInterval(this._tick, this._delay);
    }

    _stop() {
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
    }
  }

  customElements.define('fcc-carousel', FccCarousel);
})();
