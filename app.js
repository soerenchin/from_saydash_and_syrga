/* ═══════════════════════════════════════════
   WEDDING SITE — Сайдаш & Сырга
   app.js — all interactive logic
═══════════════════════════════════════════ */

'use strict';

/* ── ENVELOPE INTRO ── */
document.getElementById('openEnvelope')?.addEventListener('click', () => {
  const envelope = document.getElementById('envelope');
  if (!envelope) return;
  envelope.classList.add('opened');
  setTimeout(() => { envelope.style.display = 'none'; }, 1300);
  revealOnScroll();

  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggle');
  if (audio) {
    audio.volume = 0.3;
    audio.play().catch(() => {});
    if (btn) btn.style.opacity = '1';
  }
});

/* ── INTERSECTION OBSERVER: REVEAL ── */
function revealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.classList.contains('reveal-stagger')
          ? (Array.from(document.querySelectorAll('.reveal-stagger')).indexOf(entry.target) % 6) * 100
          : 0;
        setTimeout(() => entry.target.classList.add('in-view'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ── STICKY RSVP BUTTON ── */
const stickyBtn = document.getElementById('stickyRsvp');
if (stickyBtn) {
  window.addEventListener('scroll', () => {
    const heroH = document.getElementById('hero')?.offsetHeight || 600;
    stickyBtn.classList.toggle('visible', window.scrollY > heroH * 0.6);
  }, { passive: true });
}

/* ── HERO PARTICLE CANVAS ── */
(function initHeroParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? '200,235,252' : '255,255,255',
    };
  }

  const particleCount = window.innerWidth < 768 ? 32 : 80;
  for (let i = 0; i < particleCount; i++) particles.push(createParticle());

  let heroVisible = true;
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; })
      .observe(hero);
  }

  function draw() {
    if (heroVisible && !document.hidden) {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.001;

        if (p.y < -10 || p.alpha <= 0) Object.assign(p, createParticle(), { y: H + 10 });
      });
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── COUNTDOWN ── */
(function initCountdown() {
  const wedding = new Date('2026-08-02T17:00:00+07:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    const diff = wedding - Date.now();
    if (diff <= 0) {
      ['cDays','cHours','cMins','cSecs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    const ids = { cDays: days, cHours: hours, cMins: mins, cSecs: secs };
    Object.entries(ids).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const str = pad(val);
      if (el.textContent !== str) {
        el.style.transform = 'scale(1.15)';
        el.style.color = 'var(--blue-deep)';
        el.textContent = str;
        setTimeout(() => { el.style.transform = ''; el.style.color = ''; }, 200);
      }
    });
  }

  update();
  setInterval(update, 1000);
})();

/* ── MUSIC TOGGLE ── */
(function initMusic() {
  const btn  = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  btn.addEventListener('click', () => {
    if (!audio.paused) {
      audio.pause();
      btn.style.opacity = '0.4';
    } else {
      audio.volume = 0.3;
      audio.play().catch(() => {});
      btn.style.opacity = '1';
    }
  });
})();

/* ── LOTTERY CANVAS (aurora section) ── */
(function initLotteryCanvas() {
  const canvas = document.getElementById('lotteryCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, sparkles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function mkSparkle() {
    const colors = ['200,230,252', '160,210,240', '220,240,255', '180,225,245'];
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      da: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }
  for (let i = 0; i < 100; i++) sparkles.push(mkSparkle());

  function drawLotteryBg() {
    ctx.clearRect(0, 0, W, H);
    sparkles.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${Math.max(0, s.alpha)})`;
      ctx.fill();

      s.x += s.vx; s.y += s.vy;
      s.alpha += s.da;
      if (s.alpha > 0.65 || s.alpha < 0.05) s.da *= -1;
      if (s.x < -10) s.x = W + 10;
      if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10;
      if (s.y > H + 10) s.y = -10;
    });
    requestAnimationFrame(drawLotteryBg);
  }
  drawLotteryBg();
})();

/* ── RSVP FORM & TICKET GENERATION ── */
(function initRSVP() {

  // Show/hide +1 field
  const guestCountSel = document.getElementById('guestCount');
  const plusOneGroup  = document.getElementById('plusOneGroup');
  if (guestCountSel && plusOneGroup) {
    guestCountSel.addEventListener('change', () => {
      plusOneGroup.style.display = parseInt(guestCountSel.value) >= 2 ? '' : 'none';
    });
  }

  // Lottery number generator
  function generateLotteryNumber() {
    const prefix = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A–F
    const existing = JSON.parse(localStorage.getItem('weddingTickets') || '[]');
    let num;
    do { num = Math.floor(Math.random() * 899) + 100; }
    while (existing.includes(`${prefix}-${num}`));

    const ticket = `${prefix}-${num}`;
    existing.push(ticket);
    localStorage.setItem('weddingTickets', JSON.stringify(existing));
    return ticket;
  }

  // Validate
  function validate(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      const empty = el.tagName === 'INPUT' && el.type === 'radio'
        ? !form.querySelector(`[name="${el.name}"]:checked`)
        : !el.value.trim();
      el.classList.toggle('error', empty);
      if (empty) ok = false;
    });
    return ok;
  }

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjgzlplj';

  // Send to Formspree (email → soerenchin@gmail.com) + save locally as fallback
  async function submit(data) {
    const entries = JSON.parse(localStorage.getItem('rsvpEntries') || '[]');
    entries.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem('rsvpEntries', JSON.stringify(entries));

    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'Имя и фамилия':     data.name,
        'Кем приходится':    data.relation,
        'Количество гостей': data.count,
        'Имя +1 гостя':      data.plusOne || '—',
        _subject:            `Подтверждение участия — ${data.name}`,
      }),
    });

    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      throw new Error(info?.errors?.[0]?.message || `Formspree error ${res.status}`);
    }
  }

  // Show ticket modal
  function showTicket(ticketNum, guestName, attending) {
    if (attending !== 'yes') {
      showDeclineMessage();
      return;
    }

    const modal    = document.getElementById('ticketModal');
    const numEl    = document.getElementById('ticketNumber');
    const nameEl   = document.getElementById('ticketGuestName');
    if (!modal) return;

    numEl.textContent  = ticketNum;
    nameEl.textContent = guestName;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    launchTicketParticles();
  }

  function showDeclineMessage() {
    const section = document.getElementById('rsvp');
    if (!section) return;
    const msg = document.createElement('div');
    msg.style.cssText = `
      text-align:center; padding: 32px; font-family: var(--font-serif);
      font-size: 1.4rem; color: var(--text-mid); font-style:italic;
    `;
    msg.textContent = 'Жаль, что вы не сможете прийти. Желаем всего самого лучшего! 💙';
    section.querySelector('.container').appendChild(msg);
  }

  // Form submit
  const form = document.getElementById('rsvpForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(form)) return;

      const submitBtn = document.getElementById('submitBtn');
      const btnText  = submitBtn?.querySelector('.btn-text');
      const btnLoad  = submitBtn?.querySelector('.btn-loading');

      if (btnText) btnText.style.display = 'none';
      if (btnLoad) btnLoad.style.display = '';
      if (submitBtn) submitBtn.disabled = true;

      const attending = form.querySelector('[name="attending"]:checked')?.value || 'yes';
      const name      = form.guestName.value.trim();
      const ticketNum = attending === 'yes' ? generateLotteryNumber() : null;

      const data = {
        name,
        relation:  form.relation.value,
        attending,
        count:     form.guestCount?.value || '1',
        plusOne:   form.plusOneName?.value.trim() || '',
        wishes:    form.wishes?.value?.trim() || '',
        ticket:    ticketNum,
      };

      try {
        await submit(data);
        document.getElementById('rsvpSuccess').classList.add('visible');
      } catch (err) {
        console.error('RSVP submit failed:', err);
        alert('Не удалось отправить форму. Проверьте подключение к интернету и попробуйте ещё раз.');
      } finally {
        if (btnText) btnText.style.display = '';
        if (btnLoad) btnLoad.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Close success overlay
  document.getElementById('rsvpSuccessClose')?.addEventListener('click', () => {
    document.getElementById('rsvpSuccess').classList.remove('visible');
  });

  // Close modal
  document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('ticketModal').style.display = 'none';
    document.body.style.overflow = '';
  });

})();

/* ── TICKET PARTICLE BURST ── */
function launchTicketParticles() {
  const canvas = document.getElementById('ticketParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;

  const colors = ['#7EC8E3','#A8D8EA','#C8E6F5','#FFD6E0','#B8E4F0','#E8F4FD'];
  let parts = Array.from({ length: 120 }, () => ({
    x: W / 2, y: H / 2,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.7) * 9,
    r: Math.random() * 5 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1, gravity: 0.15 + Math.random() * 0.1,
  }));

  let raf;
  function drawBurst() {
    ctx.clearRect(0, 0, W, H);
    parts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= 0.012;
    });
    ctx.globalAlpha = 1;
    parts = parts.filter(p => p.alpha > 0);
    if (parts.length) { raf = requestAnimationFrame(drawBurst); }
    else { ctx.clearRect(0, 0, W, H); }
  }
  drawBurst();
}

/* ── SMOOTH PARALLAX ON HERO ── */
(function initParallax() {
  const photo = document.querySelector('.hero-photo');
  if (!photo
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;

  photo.style.willChange = 'transform';
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          photo.style.transform = `translate3d(0,${y * 0.3}px,0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── START ── */
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
});
