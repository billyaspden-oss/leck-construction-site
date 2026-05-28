// ── Mark the matching nav link active based on the current URL
(function(){
  const path = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
    const hrefPath = href.split('#')[0].split('/').pop().replace(/\.html$/, '') || 'index';
    if (hrefPath && hrefPath === path) a.classList.add('active');
  });
})();

// ── Hamburger / mobile menu (with focus trap, Escape, focus return)
(function(){
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  const links = menu.querySelectorAll('.mm-link, .mm-tel');
  let lastFocused = null;

  function focusable() {
    return menu.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
  }
  function open() {
    lastFocused = document.activeElement;
    btn.classList.add('open');
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = focusable()[0];
    if (first) first.focus();
  }
  function close() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    else btn.focus();
  }

  btn.addEventListener('click', () => {
    if (btn.classList.contains('open')) close(); else open();
  });

  links.forEach(l => l.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (!menu.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      const list = Array.from(focusable());
      if (list.length === 0) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

// ── Scroll progress bar (rAF-throttled, animates transform: scaleX)
(function(){
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;
  let ticking = false;
  function update() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? window.scrollY / total : 0;
    progressBar.style.transform = `scaleX(${pct})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// ── Reveal on scroll
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    // Fallback: show everything immediately if IO is unavailable
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => io.observe(el));
})();
