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

/* ── ПЛАВНЫЙ ПАРАЛЛАКС НА ГЕРОЕ ── */
(function initHeroParallax() {
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
        if (y < window.innerHeight * 1.2) {
          photo.style.transform = `translate3d(0,${y * 0.28}px,0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
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
        el.classList.add('tick');
        el.textContent = str;
        setTimeout(() => el.classList.remove('tick'), 260);
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

/* ── RSVP FORM ── */
(function initRSVP() {

  // Show/hide +1 field
  const guestCountSel = document.getElementById('guestCount');
  const plusOneGroup  = document.getElementById('plusOneGroup');
  if (guestCountSel && plusOneGroup) {
    guestCountSel.addEventListener('change', () => {
      plusOneGroup.style.display = parseInt(guestCountSel.value) >= 2 ? '' : 'none';
    });
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

      const data = {
        name,
        relation:  form.relation.value,
        attending,
        count:     form.guestCount?.value || '1',
        plusOne:   form.plusOneName?.value.trim() || '',
        wishes:    form.wishes?.value?.trim() || '',
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

})();


/* ── START ── */
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
});
