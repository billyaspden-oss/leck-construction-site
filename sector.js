// ── Mark "Sectors" nav link active on all sector pages
document.querySelectorAll(
  '.nav-links a[href="index.html#services"], .mobile-menu a[href="index.html#services"]'
).forEach(el => el.classList.add('active'));

// ── Hamburger / mobile menu
const btn   = document.getElementById('hamburger');
const menu  = document.getElementById('mobileMenu');
const links = menu.querySelectorAll('.mm-link, .mm-tel');

btn.addEventListener('click', () => {
  const open = btn.classList.toggle('open');
  menu.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

links.forEach(l => l.addEventListener('click', () => {
  btn.classList.remove('open');
  menu.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

// ── Scroll progress bar
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
  }, { passive: true });
}

// ── Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
revealEls.forEach(el => io.observe(el));
