/* =========================================================
   Kanchan Priya | Portfolio scripts
   ========================================================= */

// Your WhatsApp number (country code + number, no "+" or spaces)
const WHATSAPP_NUMBER = '917257866897';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

$$('.js-year').forEach(el => (el.textContent = new Date().getFullYear()));

/* ---------- Smooth scrolling (Lenis) ---------- */
let lenis = null;
if (window.Lenis && !reduceMotion) {
  lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4) });
  lenis.stop();
  (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
}
function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -20 });
  else if (target === 0) window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
  else target.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  const el = id === '#home' ? 0 : $(id);
  if (el === null) return;
  e.preventDefault();
  setMenu(false);
  scrollToTarget(el);
}));
$('#toTop').addEventListener('click', () => scrollToTarget(0));

lenis && lenis.start();
document.body.classList.add('ready');

/* ---------- Mobile menu ---------- */
const nav = $('#nav');
const burger = $('#burger');
const menu = $('#navMenu');
function setMenu(open) {
  menu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  nav.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (lenis) open ? lenis.stop() : lenis.start();
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    setMenu(false);
    burger.focus();
  }
});
window.matchMedia('(max-width: 900px)').addEventListener('change', () => setMenu(false));

/* ---------- Typing ---------- */
const roles = ['Frontend Developer', 'React.js Developer', 'UI Craftsperson', 'Landing Page Specialist'];
function startTyping() {
  const el = $('#typed');
  if (reduceMotion) return;
  let r = 0, i = roles[0].length, deleting = true;
  setTimeout(function tick() {
    const word = roles[r];
    el.textContent = word.slice(0, i);
    if (!deleting && i === word.length) { deleting = true; return setTimeout(tick, 2000); }
    if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; }
    i += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 40 : 80);
  }, 2200);
}

/* ---------- Split headings into words ---------- */
$$('.split').forEach(el => {
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
          const w = document.createElement('span'); w.className = 'w';
          const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
          w.appendChild(wi); frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        // wrap whole inline elements (e.g. <em>) as one word
        const w = document.createElement('span'); w.className = 'w';
        const wi = document.createElement('span'); wi.className = 'wi';
        child.replaceWith(w); wi.appendChild(child); w.appendChild(wi);
      }
    });
  };
  walk(el);
  $$('.wi', el).forEach((wi, i) => (wi.style.transitionDelay = i * 70 + 'ms'));
});

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    // stagger siblings that enter together
    const sibs = $$(':scope > .up', el.parentElement);
    const idx = Math.max(0, sibs.indexOf(el));
    el.style.transitionDelay = (idx % 4) * 90 + 'ms';
    el.classList.add('in');
    $$('.count', el).forEach(countUp);
    setTimeout(() => (el.style.transitionDelay = ''), 1400);
    io.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
$$('.up, .split').forEach(el => io.observe(el));

function countUp(el) {
  el.textContent = el.dataset.to;
}

/* ---------- Active nav link + hide nav on scroll down ---------- */
const sections = $$('main section[id]');
const links = $$('.nav__link[href^="#"]');
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  let current = '';
  sections.forEach(s => { if (y >= s.offsetTop - innerHeight * 0.4) current = s.id; });
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Experience accordion ---------- */
$$('.job').forEach((job, i) => {
  const body = $('.job__body', job);
  body.id = `job-details-${i}`;
  body.inert = !job.classList.contains('open');
  $('.job__head', job).setAttribute('aria-controls', body.id);
});
$$('.job__head').forEach(head => head.addEventListener('click', () => {
  const job = head.parentElement;
  const open = !job.classList.contains('open');
  $$('.job').forEach(j => { j.classList.remove('open'); $('.job__head', j).setAttribute('aria-expanded', 'false'); $('.job__body', j).inert = true; });
  job.classList.toggle('open', open);
  head.setAttribute('aria-expanded', open);
  $('.job__body', job).inert = !open;
}));

/* ---------- Desktop cursor + magnetic buttons ---------- */
if (finePointer && !reduceMotion && !document.body.classList.contains('luxury')) {
  const cursor = $('#cursor');
  const label = $('#cursorLabel');
  let mx = -100, my = -100, cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const labelled = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, label, input, textarea');
    cursor.classList.toggle('is-label', !!labelled);
    cursor.classList.toggle('is-link', !labelled && !!link);
    label.textContent = labelled ? labelled.dataset.cursor : '';
  });
  document.addEventListener('mouseleave', () => { mx = my = -100; });

  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => (btn.style.transform = ''));
  });
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 5000);
}

/* ---------- Contact form → WhatsApp (+ Netlify Forms backup) ---------- */
const form = $('#contactForm');
const purposeBox = $('#purpose');

form.addEventListener('submit', e => {
  e.preventDefault();

  let ok = true;
  $$('.field [required]', form).forEach(input => {
    const v = input.value.trim();
    const valid = v !== '' && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    const field = input.closest('.field');
    field.classList.remove('error'); void field.offsetWidth;
    if (!valid) { field.classList.add('error'); ok = false; }
  });
  const purpose = $('input[name="purpose"]:checked', form);
  purposeBox.classList.remove('error'); void purposeBox.offsetWidth;
  if (!purpose) { purposeBox.classList.add('error'); ok = false; }

  if (!ok) {
    toast('Please fill in the highlighted fields.');
    const first = $('.field.error input, .field.error textarea', form);
    first && first.focus();
    return;
  }

  const d = Object.fromEntries(new FormData(form));
  const lines = [
    '*New message from your Portfolio* 🚀',
    '',
    `*Name:* ${d.name.trim()}`,
    `*Email:* ${d.email.trim()}`,
    d.phone.trim() ? `*Phone:* ${d.phone.trim()}` : null,
    d.company.trim() ? `*Company:* ${d.company.trim()}` : null,
    `*Purpose:* ${d.purpose}`,
    '',
    '*Message:*',
    d.message.trim(),
  ].filter(l => l !== null);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

  // Open WhatsApp synchronously so the browser doesn't block it
  const win = window.open(waUrl, '_blank');
  if (!win) window.location.href = waUrl;

  // Backup copy in the Netlify Forms dashboard (works once deployed on Netlify)
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(form)).toString(),
  }).catch(() => {}).finally(() => {
    form.reset();
    toast('Thank you! Just tap "Send" in WhatsApp and your message reaches me.');
  });
});

$$('.field input, .field textarea', form).forEach(el =>
  el.addEventListener('input', () => el.closest('.field').classList.remove('error'))
);
$$('input[name="purpose"]', form).forEach(el =>
  el.addEventListener('change', () => purposeBox.classList.remove('error'))
);
