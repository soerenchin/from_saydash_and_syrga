/* ═══════════════════════════════════════════
   WEDDING SITE — Сайдаш & Сырга
   app.js — all interactive logic
═══════════════════════════════════════════ */

'use strict';

/* ── ФОНОВАЯ МУЗЫКА: старт с 21-й секунды + плавное нарастание громкости ── */
const MUSIC_VOLUME = 0.3;
const MUSIC_START_TIME = 0;

function playMusicWithFade(audio) {
  const setStart = () => {
    if (audio.currentTime < MUSIC_START_TIME) {
      audio.currentTime = MUSIC_START_TIME;
    }
  };

  if (audio.readyState >= 1) setStart();
  else audio.addEventListener('loadedmetadata', setStart, { once: true });

  audio.volume = 0;
  audio.play().then(() => {
    const fadeStep = 0.02;
    const fade = setInterval(() => {
      const next = audio.volume + fadeStep;
      if (next >= MUSIC_VOLUME) {
        audio.volume = MUSIC_VOLUME;
        clearInterval(fade);
      } else {
        audio.volume = next;
      }
    }, 120);
  }).catch(() => {});
}

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
    playMusicWithFade(audio);
    if (btn) {
      btn.style.opacity = '1';
      btn.classList.add('pulse');
    }
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

/* ── ROSE: роза распускается по мере прокрутки ── */
(function initRose() {
  const section = document.getElementById('rose-bloom');
  const rose    = document.getElementById('rose');
  if (!section || !rose) return;

  // кольца лепестков: от внешних (сзади) к внутренним (спереди)
  const rings = [
    { count: 9, r: 58, ps: 1.05, c1: '#E0B0B0', c2: '#C68888', c3: '#B07474', offset: 0  },
    { count: 8, r: 42, ps: 0.86, c1: '#E9BEBE', c2: '#D29696', c3: '#BE8080', offset: 22 },
    { count: 6, r: 26, ps: 0.66, c1: '#F2D0D0', c2: '#E0AAAA', c3: '#CD9090', offset: 12 },
    { count: 4, r: 13, ps: 0.48, c1: '#F8DCDC', c2: '#E8B8B8', c3: '#D89E9E', offset: 30 }
  ];

  rings.forEach(ring => {
    for (let i = 0; i < ring.count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const angle = ring.offset + i * (360 / ring.count);
      petal.style.setProperty('--a', angle + 'deg');
      petal.style.setProperty('--r', ring.r);
      petal.style.setProperty('--ps', ring.ps);
      petal.style.setProperty('--c1', ring.c1);
      petal.style.setProperty('--c2', ring.c2);
      petal.style.setProperty('--c3', ring.c3);
      rose.appendChild(petal);
    }
  });

  const core = document.createElement('div');
  core.className = 'rose-core';
  rose.appendChild(core);

  // раскрытие привязано к скроллу, но с небольшой задержкой в начале:
  // роза сперва появляется, и только потом начинает распускаться
  const START = 0.20;   // до этого момента бутон закрыт (задержка)
  const END   = 0.52;   // полностью раскрыт примерно в центре экрана

  let ticking = false;
  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // raw: 0 — секция только показалась снизу, 1 — ушла за верх
    const raw = (vh - rect.top) / (vh + rect.height);
    let bloom = (raw - START) / (END - START);
    bloom = Math.max(0, Math.min(1, bloom));

    rose.style.setProperty('--bloom', bloom.toFixed(3));
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ── MUSIC TOGGLE ── */
(function initMusic() {
  const btn  = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  btn.addEventListener('click', () => {
    btn.classList.remove('pulse');
    if (!audio.paused) {
      audio.pause();
      btn.style.opacity = '0.4';
    } else {
      audio.volume = MUSIC_VOLUME;
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
