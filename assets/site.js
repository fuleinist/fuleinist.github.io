/* ==========================================================================
   fuleinist.github.io — interactions
   No dependencies. Progressive enhancement: everything degrades to static.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;

  const fmt = (n) => (n == null ? '—' : new Intl.NumberFormat('en-AU').format(n));

  /* ---------- fallback data (used only if the JSON fetch fails) ---------- */
  const FALLBACK = {
    login: 'fuleinist',
    generatedAt: null,
    profile: { publicRepos: 354, followers: 29 },
    stats: { ownRepos: 150, totalStars: 39, contributions: 1901 },
    languages: [
      { name: 'TypeScript', count: 44 }, { name: 'JavaScript', count: 29 },
      { name: 'Python', count: 22 }, { name: 'Rust', count: 16 },
      { name: 'Go', count: 7 }, { name: 'HTML', count: 4 }
    ],
    projects: [
      { name: 'skill-graph', description: 'Visual dependency graph for AI agent skills.', language: 'HTML', stars: 5, forks: 0, pushedAt: '2026-05-23T00:00:00Z', url: 'https://github.com/fuleinist/skill-graph' },
      { name: 'ai-session-diff', description: 'Git hook that captures AI agent coding sessions and generates visual diffs.', language: 'Go', stars: 4, forks: 1, pushedAt: '2026-05-18T00:00:00Z', url: 'https://github.com/fuleinist/ai-session-diff' },
      { name: 'context-prune', description: 'Token compression proxy for coding agents.', language: 'Rust', stars: 2, forks: 1, pushedAt: '2026-09-05T00:00:00Z', url: 'https://github.com/fuleinist/context-prune' },
      { name: 'video-to-skill', description: 'Turn any video into a structured Claude Code skill.', language: 'Python', stars: 2, forks: 1, pushedAt: '2026-05-19T00:00:00Z', url: 'https://github.com/fuleinist/video-to-skill' }
    ],
    contributions: null,
    experiments: [
      { title: 'star wars intro', path: 'star-wars-intro.html', desc: 'CSS 3D opening crawl — the previous landing page', tag: 'CSS 3D' },
      { title: 'earth & moon', path: 'aframe-earth-moon/', desc: 'Textured earth, moon and starfield in WebVR', tag: 'A-Frame' },
      { title: '360 video', path: 'aframe-360-video/', desc: 'Immersive 360° video playback in the browser', tag: 'A-Frame' }
    ]
  };

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), 1900);
  }

  /* ---------- theme ---------- */
  function applyTheme(theme, announce) {
    root.dataset.theme = theme;
    try { localStorage.setItem('fx-theme', theme); } catch (e) { /* private mode */ }
    const meta = $('#theme-color');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#fbfcfd' : '#0a0c0f');
    const btn = $('#theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    if (announce) toast(theme === 'light' ? 'light theme' : 'dark theme');
  }
  function toggleTheme() {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
  }
  const themeBtn = $('#theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  try {
    const mq = matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', (e) => {
      let stored = null;
      try { stored = localStorage.getItem('fx-theme'); } catch (err) {}
      if (!stored) applyTheme(e.matches ? 'light' : 'dark', false);
    });
  } catch (e) { /* older browsers */ }

  /* ---------- scroll progress + sticky bar ---------- */
  const progress = $('#progress');
  const topbar = $('#topbar');
  let scrolling = false;
  function onScroll() {
    if (scrolling) return;
    scrolling = true;
    requestAnimationFrame(() => {
      scrolling = false;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      if (progress) progress.style.setProperty('--p', p.toFixed(4));
      if (topbar) topbar.classList.toggle('stuck', el.scrollTop > 8);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- nav scrollspy ---------- */
  const navLinks = $$('.nav a');
  const navMap = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window && navLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          navLinks.forEach((a) => a.classList.remove('active'));
          const link = navMap.get(e.target.id);
          if (link) link.classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    navMap.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealer.observe(el));
  }

  /* ---------- hero pointer glow ---------- */
  if (finePointer && !reduceMotion) {
    const hero = $('.hero');
    const glow = $('#hero-glow');
    if (hero && glow) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        glow.style.setProperty('--gx', `${Math.round(e.clientX - r.left)}px`);
        glow.style.setProperty('--gy', `${Math.round(e.clientY - r.top)}px`);
      });
    }
  }

  /* ---------- typed focus line ---------- */
  const typedEl = $('#typed-text');
  const PHRASES = [
    'building tooling for ai-assisted development',
    'making context smaller and more useful',
    'shipping small sharp utilities',
    'fifteen years in, still allergic to bloat'
  ];
  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = PHRASES[0];
    } else {
      let phrase = 0;
      let char = 0;
      let deleting = false;

      const tick = () => {
        const text = PHRASES[phrase];
        if (!deleting) {
          char++;
          typedEl.textContent = text.slice(0, char);
          if (char === text.length) {
            deleting = true;
            return setTimeout(tick, 2400);
          }
          return setTimeout(tick, 34 + Math.random() * 30);
        }
        char--;
        typedEl.textContent = text.slice(0, char);
        if (char === 0) {
          deleting = false;
          phrase = (phrase + 1) % PHRASES.length;
          return setTimeout(tick, 320);
        }
        return setTimeout(tick, 16);
      };
      setTimeout(tick, 700);
    }
  }

  /* ---------- clipboard ---------- */
  async function copyText(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(msg);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast(msg); } catch (err) { toast('copy failed'); }
      ta.remove();
    }
  }
  const copyBtn = $('#copy-handle');
  if (copyBtn) copyBtn.addEventListener('click', () => copyText('@fuleinist', 'handle copied'));

  /* ---------- helpers ---------- */
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const LANG_COLORS = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
    Rust: '#dea584', Go: '#00ADD8', HTML: '#e34c26', CSS: '#563d7c',
    PHP: '#4F5D95', Shell: '#89e051', Vue: '#41b883', Java: '#b07219'
  };
  const langColor = (l) => LANG_COLORS[l] || 'var(--line-strong)';

  function relTime(iso) {
    if (!iso) return '—';
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
    if (days <= 0) return 'today';
    if (days === 1) return '1d ago';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.round(days / 30)}mo ago`;
    return `${(days / 365).toFixed(1)}y ago`;
  }

  function animateCount(el, target) {
    if (target == null || Number.isNaN(target)) { el.textContent = '—'; return; }
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- data application ---------- */
  let DATA = FALLBACK;
  let statsObserver = null;

  function applyStats(data) {
    const values = {
      ownRepos: data.stats ? data.stats.ownRepos : null,
      totalStars: data.stats ? data.stats.totalStars : null,
      contributions: data.stats ? data.stats.contributions : null,
      followers: data.profile ? data.profile.followers : null
    };
    const els = $$('[data-count]');
    els.forEach((el) => {
      el.dataset.target = values[el.dataset.count] == null ? '' : String(values[el.dataset.count]);
    });

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => animateCount(el, el.dataset.target === '' ? null : Number(el.dataset.target)));
      return;
    }
    statsObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const raw = e.target.dataset.target;
          animateCount(e.target, raw === '' ? null : Number(raw));
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.35 }
    );
    els.forEach((el) => statsObserver.observe(el));
  }

  function renderLanguages(langs) {
    const host = $('#langs');
    if (!host) return;
    host.innerHTML = '';
    if (!langs || !langs.length) {
      host.innerHTML = '<div class="note">no language data</div>';
      return;
    }
    const max = Math.max(...langs.map((l) => l.count), 1);
    langs.forEach((l) => {
      const row = document.createElement('div');
      row.className = 'lang-row';
      row.innerHTML =
        `<span>${esc(l.name)}</span>` +
        `<span class="bar"><i data-w="${Math.round((l.count / max) * 100)}"></i></span>` +
        `<span class="n">${l.count}</span>`;
      host.appendChild(row);
    });
    requestAnimationFrame(() => {
      $$('.lang-row .bar i', host).forEach((bar, i) => {
        setTimeout(() => { bar.style.width = `${bar.dataset.w}%`; }, 120 + i * 70);
      });
    });
  }

  /* ---------- contribution heatmap ---------- */
  const tip = document.createElement('div');
  tip.className = 'tip';
  document.body.appendChild(tip);

  function showTip(target, text) {
    const r = target.getBoundingClientRect();
    tip.textContent = text;
    tip.style.left = `${r.left + r.width / 2}px`;
    tip.style.top = `${r.top}px`;
    tip.classList.add('on');
  }
  function hideTip() { tip.classList.remove('on'); }

  function fmtDay(iso) {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  function renderHeat(contrib) {
    const heat = $('#heat');
    const totalEl = $('#contrib-total');
    const noteEl = $('#contrib-note');
    if (!heat) return;

    if (!contrib || !Array.isArray(contrib.weeks) || !contrib.weeks.length) {
      heat.innerHTML = '<div class="note">contribution data unavailable</div>';
      if (totalEl) totalEl.textContent = '—';
      return;
    }

    const cells = [];
    contrib.weeks.forEach((week) => {
      const byDay = new Array(7).fill(null);
      (week || []).forEach((d) => {
        if (d && typeof d.weekday === 'number') byDay[d.weekday] = d;
      });
      byDay.forEach((d) => cells.push(d));
    });

    const max = Math.max(1, ...cells.filter(Boolean).map((d) => d.count || 0));
    const frag = document.createDocumentFragment();

    cells.forEach((d) => {
      const cell = document.createElement('i');
      if (!d) {
        cell.style.visibility = 'hidden';
        frag.appendChild(cell);
        return;
      }
      const ratio = (d.count || 0) / max;
      const level = d.count === 0 ? 0 : ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
      cell.dataset.l = String(level);
      cell.dataset.date = d.date;
      cell.dataset.count = String(d.count);
      cell.tabIndex = 0;
      cell.setAttribute('role', 'img');
      cell.setAttribute('aria-label', `${d.count} contribution${d.count === 1 ? '' : 's'} on ${fmtDay(d.date)}`);
      frag.appendChild(cell);
    });

    heat.innerHTML = '';
    heat.appendChild(frag);

    heat.addEventListener('pointerover', (e) => {
      const cell = e.target.closest('i[data-date]');
      if (!cell) return;
      const n = Number(cell.dataset.count);
      showTip(cell, `${n} contribution${n === 1 ? '' : 's'} · ${fmtDay(cell.dataset.date)}`);
    });
    heat.addEventListener('pointerout', (e) => {
      if (e.target.closest('i[data-date]')) hideTip();
    });
    heat.addEventListener('focusin', (e) => {
      const cell = e.target.closest('i[data-date]');
      if (!cell) return;
      const n = Number(cell.dataset.count);
      showTip(cell, `${n} contribution${n === 1 ? '' : 's'} · ${fmtDay(cell.dataset.date)}`);
    });
    heat.addEventListener('focusout', hideTip);

    if (totalEl) totalEl.textContent = `${fmt(contrib.total)} contributions in the last year`;
    if (noteEl) noteEl.textContent = `${contrib.weeks.length} weeks`;
  }

  /* ---------- projects ---------- */
  const state = { lang: 'all', q: '', sort: 'stars', projects: [] };
  const grid = $('#projects-grid');
  const countLine = $('#project-count');
  const filtersHost = $('#filters');
  const searchInput = $('#project-search');
  const sortSelect = $('#project-sort');

  function projectMatches(p) {
    if (state.lang !== 'all' && p.language !== state.lang) return false;
    if (!state.q) return true;
    const hay = `${p.name} ${p.description || ''} ${(p.topics || []).join(' ')}`.toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  function sorted(list) {
    const copy = [...list];
    if (state.sort === 'stars') copy.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    else if (state.sort === 'updated') copy.sort((a, b) => new Date(b.pushedAt || 0) - new Date(a.pushedAt || 0));
    else copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }

  function card(p) {
    const a = document.createElement('a');
    a.className = 'proj';
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.setProperty('--lc', langColor(p.language));
    a.setAttribute('aria-label', `${p.name} — open on GitHub`);
    a.innerHTML =
      `<div class="top"><h3>${esc(p.name)}</h3><span class="arrow" aria-hidden="true">↗</span></div>` +
      `<p>${esc(p.description || 'No description yet.')}</p>` +
      `<div class="meta">` +
        `<span class="lang"><span class="ldot" aria-hidden="true"></span>${esc(p.language || '—')}</span>` +
        `<span>★ ${fmt(p.stars)}</span>` +
        `<span>${esc(relTime(p.pushedAt))}</span>` +
      `</div>`;
    return a;
  }

  function renderProjects() {
    if (!grid) return;
    const list = sorted(state.projects.filter(projectMatches));
    grid.innerHTML = '';

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = state.q || state.lang !== 'all'
        ? 'nothing matches that filter — try clearing it'
        : 'no repositories found';
      grid.appendChild(empty);
    } else {
      list.forEach((p) => grid.appendChild(card(p)));
    }

    grid.setAttribute('aria-busy', 'false');
    if (countLine) {
      countLine.textContent = `showing ${list.length} of ${state.projects.length} repositories`;
    }
  }

  function renderFilters() {
    if (!filtersHost) return;
    const counts = new Map();
    state.projects.forEach((p) => {
      if (p.language) counts.set(p.language, (counts.get(p.language) || 0) + 1);
    });
    const langs = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    filtersHost.innerHTML = '';
    const make = (value, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fbtn';
      b.dataset.lang = value;
      b.setAttribute('aria-pressed', String(state.lang === value));
      b.textContent = label;
      return b;
    };
    filtersHost.appendChild(make('all', 'all'));
    langs.forEach(([name]) => filtersHost.appendChild(make(name, name)));
  }

  if (filtersHost) {
    filtersHost.addEventListener('click', (e) => {
      const btn = e.target.closest('.fbtn');
      if (!btn) return;
      state.lang = btn.dataset.lang;
      $$('.fbtn', filtersHost).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderProjects();
    });
  }

  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.q = searchInput.value.trim();
        renderProjects();
      }, 90);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      renderProjects();
    });
  }

  function renderLab(experiments) {
    const host = $('#lab-grid');
    if (!host) return;
    host.innerHTML = '';
    (experiments || []).forEach((x) => {
      const a = document.createElement('a');
      a.className = 'lab-card';
      a.href = x.path;
      a.innerHTML =
        `<span class="tag">${esc(x.tag || 'experiment')}</span>` +
        `<h3>${esc(x.title)}</h3>` +
        `<p>${esc(x.desc || '')}</p>` +
        `<span class="go">open →</span>`;
      host.appendChild(a);
    });
  }

  /* ---------- command palette ---------- */
  const dialog = $('#palette');
  const paletteInput = $('#palette-input');
  const paletteList = $('#palette-list');
  let paletteItems = [];
  let paletteActive = 0;

  const go = (hash) => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  };

  function buildPalette() {
    const items = [
      { kind: 'section', label: 'whoami', hint: '01', run: () => go('#whoami') },
      { kind: 'section', label: 'stack', hint: '02', run: () => go('#stack') },
      { kind: 'section', label: 'work', hint: '03', run: () => go('#work') },
      { kind: 'section', label: 'telemetry', hint: '04', run: () => go('#telemetry') },
      { kind: 'section', label: 'lab', hint: '05', run: () => go('#lab') },
      { kind: 'section', label: 'contact', hint: '06', run: () => go('#contact') },
      { kind: 'action', label: 'toggle theme', hint: 't', run: () => toggleTheme() },
      { kind: 'action', label: 'copy handle @fuleinist', hint: '', run: () => copyText('@fuleinist', 'handle copied') },
      { kind: 'action', label: 'search projects', hint: '/', run: () => { closePalette(); if (searchInput) searchInput.focus(); } },
      { kind: 'action', label: 'open github profile', hint: '↗', run: () => window.open('https://github.com/fuleinist', '_blank', 'noopener') },
      { kind: 'action', label: 'open profile readme source', hint: '↗', run: () => window.open('https://github.com/fuleinist/fuleinist', '_blank', 'noopener') }
    ];
    (DATA.projects || []).forEach((p) => {
      items.push({
        kind: 'repo',
        label: p.name,
        hint: `★ ${p.stars}`,
        run: () => window.open(p.url, '_blank', 'noopener')
      });
    });
    return items;
  }

  function paletteFiltered() {
    const q = (paletteInput ? paletteInput.value : '').trim().toLowerCase();
    if (!q) return paletteItems;
    return paletteItems.filter((it) => it.label.toLowerCase().includes(q) || it.kind.includes(q));
  }

  function paintPalette() {
    if (!paletteList) return;
    const items = paletteFiltered();
    paletteActive = Math.min(paletteActive, Math.max(0, items.length - 1));
    paletteList.innerHTML = '';
    if (!items.length) {
      const li = document.createElement('li');
      li.textContent = 'no matches';
      li.setAttribute('aria-disabled', 'true');
      paletteList.appendChild(li);
      return;
    }
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === paletteActive));
      li.innerHTML = `<span class="kind">${esc(it.kind)}</span><span>${esc(it.label)}</span><span class="hint">${esc(it.hint || '')}</span>`;
      li.addEventListener('click', () => { closePalette(); it.run(); });
      paletteList.appendChild(li);
    });
  }

  function openPalette() {
    if (!dialog) return;
    paletteItems = buildPalette();
    paletteActive = 0;
    if (paletteInput) paletteInput.value = '';
    paintPalette();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    if (paletteInput) paletteInput.focus();
  }

  function closePalette() {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  const paletteBtn = $('#palette-open');
  if (paletteBtn) paletteBtn.addEventListener('click', openPalette);

  if (paletteInput) {
    paletteInput.addEventListener('input', () => { paletteActive = 0; paintPalette(); });
    paletteInput.addEventListener('keydown', (e) => {
      const items = paletteFiltered();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        paletteActive = Math.min(items.length - 1, paletteActive + 1);
        paintPalette();
        const sel = paletteList.querySelector('[aria-selected="true"]');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        paletteActive = Math.max(0, paletteActive - 1);
        paintPalette();
        const sel = paletteList.querySelector('[aria-selected="true"]');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[paletteActive];
        if (item) { closePalette(); item.run(); }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });
  }

  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closePalette();
    });
  }

  /* ---------- keyboard shortcuts ---------- */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const hint = $('#kbd-hint');
  if (hint) hint.textContent = isMac ? '⌘K' : 'Ctrl K';

  addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const typing = active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable);

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog && dialog.open) closePalette();
      else openPalette();
      return;
    }
    if (typing) return;

    if (e.key === '/') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    } else if (e.key.toLowerCase() === 't') {
      toggleTheme();
    } else if (e.key === '?') {
      toast('⌘K palette · / search · t theme');
    }
  });

  /* ---------- data load ---------- */
  function stamp(generatedAt) {
    const el = $('#data-stamp');
    if (!el) return;
    if (!generatedAt) { el.textContent = 'data: cached fallback'; return; }
    const d = new Date(generatedAt);
    el.textContent = `data refreshed ${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  async function boot() {
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    let data = FALLBACK;
    try {
      const res = await fetch('data/site.json', { cache: 'no-cache' });
      if (res.ok) data = await res.json();
    } catch (e) {
      /* offline or file:// — fallback keeps the page usable */
    }

    DATA = data;
    applyStats(data);
    renderLanguages(data.languages);
    state.projects = data.projects || [];
    renderFilters();
    renderProjects();
    renderHeat(data.contributions);
    renderLab(data.experiments);
    stamp(data.generatedAt);
  }

  boot();
})();