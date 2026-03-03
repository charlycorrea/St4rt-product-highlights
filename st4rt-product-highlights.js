/* Product Highlights - JS */

(() => {
  const SELECTORS = {
    section: '[data-st4rt-pd]',
    viewport: '[data-st4rt-pd-viewport]',
    track: '[data-st4rt-pd-track]',
    slide: '[data-st4rt-pd-slide]',
    prev: '[data-st4rt-pd-prev]',
    next: '[data-st4rt-pd-next]',
    copy: '[data-st4rt-pd-copy]'
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const getBehavior = () => (prefersReducedMotion ? 'auto' : 'smooth');

  const getStep = (track) => {
    const slide = track.querySelector(SELECTORS.slide);
    if (!slide) return track.clientWidth;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return slide.getBoundingClientRect().width + gap;
  };

  const updateButtons = (track, prevBtn, nextBtn) => {
    if (!prevBtn || !nextBtn) return;

    const max = Math.max(track.scrollWidth - track.clientWidth, 0);
    prevBtn.disabled = track.scrollLeft <= 1;
    nextBtn.disabled = track.scrollLeft >= max - 1;
  };


  const copyText = async (text) => {
    if (!text) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const initSection = (section) => {
    if (!(section instanceof HTMLElement)) return;
    if (section.dataset.st4rtPdInitialized === 'true') return;

    const viewport = section.querySelector(SELECTORS.viewport);
    const track = section.querySelector(SELECTORS.track);
    if (!viewport || !track) return;

    const prevBtn = section.querySelector(SELECTORS.prev);
    const nextBtn = section.querySelector(SELECTORS.next);

    const scrollByStep = (dir) => {
      track.scrollBy({ left: dir * getStep(track), behavior: getBehavior() });
    };

    prevBtn?.addEventListener('click', () => scrollByStep(-1));
    nextBtn?.addEventListener('click', () => scrollByStep(1));

    section.addEventListener('click', async (event) => {
      const copyBtn = event.target.closest(SELECTORS.copy);
      if (!copyBtn) return;

      const value = copyBtn.getAttribute('data-copy-value') || '';
      const ok = await copyText(value);
      if (!ok) return;

      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copiado';
      copyBtn.classList.add('is-copied');
      window.setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.classList.remove('is-copied');
      }, 1200);
    });

    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollByStep(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollByStep(1);
      }
    });

    track.addEventListener('scroll', () => updateButtons(track, prevBtn, nextBtn), { passive: true });
    window.addEventListener('resize', () => updateButtons(track, prevBtn, nextBtn), { passive: true });

    updateButtons(track, prevBtn, nextBtn);
    section.dataset.st4rtPdInitialized = 'true';
  };

  const initAll = (scope = document) => {
    if (!scope || !scope.querySelectorAll) return;
    scope.querySelectorAll(SELECTORS.section).forEach(initSection);
  };

  initAll();

  document.addEventListener('shopify:section:load', (event) => {
    initAll(event.target);
  });
})();
