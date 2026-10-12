/* CA Móveis — interações da landing page */
(() => {
  const WHATSAPP = '5551986221610';
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menu-toggle');
  const waFloat = document.querySelector('.wa-float');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Header + botão flutuante ---------- */
  const contato = document.getElementById('contato');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    const r = contato.getBoundingClientRect();
    waFloat.classList.toggle('is-hidden', r.top < window.innerHeight * 0.6 && r.bottom > 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });

  /* ---------- Link ativo na navegação ---------- */
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Revelar ao rolar ---------- */
  const revealTargets = document.querySelectorAll(
    '.section__head, .room, .feature__media, .feature__copy, .process__intro, .step, .perk, .contact__info, .form, .cta__inner'
  );
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('is-visible');
        io.unobserve(el);
        // libera o delay para não atrasar o hover depois da entrada
        setTimeout(() => { el.style.transitionDelay = ''; el.classList.remove('reveal', 'is-visible'); }, 1100);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => {
      // escalonar itens de listas (ambientes, etapas, diferenciais)
      const li = el.matches('.room') ? el.parentElement : el;
      const idx = el.matches('.room, .step, .perk') ? [...li.parentElement.children].indexOf(li) : 0;
      if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 4) * 70}ms`;
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- Filtro da galeria ---------- */
  const chips = [...document.querySelectorAll('.chip')];
  const items = [...document.querySelectorAll('.gallery__item')];
  const moreBtn = document.getElementById('more');
  const PAGE = 9;
  let filter = 'todos';
  let expanded = false;
  const applyFilter = (cat, animate = true) => {
    filter = cat;
    chips.forEach((c) => {
      const on = c.dataset.filter === cat;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    const matches = items.filter((it) => cat === 'todos' || it.dataset.cat === cat);
    items.forEach((it) => {
      const show = matches.indexOf(it) > -1 && (expanded || matches.indexOf(it) < PAGE);
      const wasHidden = it.classList.contains('is-hidden');
      it.classList.toggle('is-hidden', !show);
      it.classList.remove('is-entering');
      if (show && animate && (wasHidden || cat !== 'todos') && !reduceMotion) { void it.offsetWidth; it.classList.add('is-entering'); }
    });
    moreBtn.hidden = expanded || matches.length <= PAGE;
  };
  chips.forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.filter)));
  moreBtn.addEventListener('click', () => {
    expanded = true;
    const firstNew = items.find((it) => it.classList.contains('is-hidden') && (filter === 'todos' || it.dataset.cat === filter));
    applyFilter(filter);
    if (firstNew) firstNew.querySelector('.shot').focus({ preventScroll: true });
  });
  applyFilter('todos', false);
  document.querySelectorAll('[data-goto-filter]').forEach((a) =>
    a.addEventListener('click', () => applyFilter(a.dataset.gotoFilter))
  );

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-caption');
  let current = 0;
  let lastFocus = null;
  const visibleShots = () => items.filter((it) => !it.classList.contains('is-hidden')).map((it) => it.querySelector('.shot'));

  const show = (i) => {
    const shots = visibleShots();
    current = (i + shots.length) % shots.length;
    const s = shots[current];
    lbImg.src = s.dataset.src;
    lbImg.alt = s.querySelector('img').alt;
    lbCap.textContent = `${s.dataset.caption}  ·  ${current + 1}/${shots.length}`;
  };
  const open = (shot) => {
    lastFocus = shot;
    show(visibleShots().indexOf(shot));
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  document.getElementById('gallery').addEventListener('click', (e) => {
    const shot = e.target.closest('.shot');
    if (shot) open(shot);
  });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => show(current - 1));
  document.getElementById('lb-next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Formulário → WhatsApp ---------- */
  const form = document.getElementById('form');
  const nome = document.getElementById('f-nome');
  const nomeErr = document.getElementById('f-nome-err');
  const validateNome = () => {
    const ok = nome.value.trim().length >= 2;
    nome.setAttribute('aria-invalid', String(!ok));
    nome.setAttribute('aria-describedby', ok ? '' : 'f-nome-err');
    nomeErr.textContent = ok ? '' : 'Informe seu nome para continuarmos.';
    return ok;
  };
  nome.addEventListener('blur', () => { if (nome.value) validateNome(); });
  nome.addEventListener('input', () => { if (nome.getAttribute('aria-invalid') === 'true') validateNome(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateNome()) { nome.focus(); return; }
    const d = new FormData(form);
    const cidade = d.get('cidade').trim();
    const msg = d.get('mensagem').trim();
    const lines = [
      'Olá! Vim pelo site e gostaria de um orçamento.',
      '',
      `*Nome:* ${d.get('nome').trim()}`,
      cidade ? `*Cidade:* ${cidade}` : null,
      `*Ambiente:* ${d.get('ambiente')}`,
      msg ? `*Projeto:* ${msg}` : null,
    ].filter((l) => l !== null);
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();
