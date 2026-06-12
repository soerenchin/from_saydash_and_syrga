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

/* ── ROSE: букет роз раскрывается по мере прокрутки ── */
(function initRose() {
  const section = document.getElementById('rose-bloom');
  const scene   = document.getElementById('rose-scene');
  if (!section || !scene) return;

  // кольца лепестков: от внешних (сзади) к внутренним (спереди)
  const rings = [
    { count: 9, r: 58, ps: 1.05, c1: '#FFFFFF', c2: '#EFEDE9', c3: '#DEDAD3', offset: 0  },
    { count: 8, r: 42, ps: 0.86, c1: '#FFFFFF', c2: '#F3F1ED', c3: '#E5E1DA', offset: 22 },
    { count: 6, r: 26, ps: 0.66, c1: '#FFFFFF', c2: '#F7F5F1', c3: '#EBE7E0', offset: 12 },
    { count: 4, r: 13, ps: 0.48, c1: '#FFFFFF', c2: '#FBF9F6', c3: '#F1EDE6', offset: 30 }
  ];

  // строим одну розу (стебель, листья, лепестки, серединку) внутри сцены
  function buildRose(cfg) {
    const rose = document.createElement('div');
    rose.className = 'rose';
    rose.style.setProperty('--scale', cfg.scale);
    rose.style.setProperty('--x', cfg.x + 'px');
    rose.style.setProperty('--y', cfg.y + 'px');

    const stem = document.createElement('div');
    stem.className = 'rose-stem';
    rose.appendChild(stem);

    const leafL = document.createElement('span');
    leafL.className = 'rose-leaf left';
    const leafR = document.createElement('span');
    leafR.className = 'rose-leaf right';
    rose.appendChild(leafL);
    rose.appendChild(leafR);

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

    scene.appendChild(rose);
    return rose;
  }

  // одна роза по центру, распускается при скролле
  const roses = [
    { scale: 0.88, x: 0, y: 0, d: 0.00 }
  ].map(cfg => ({ cfg, el: buildRose(cfg) }));

  // раскрытие привязано к скроллу, с небольшой задержкой в начале
  const START = 0.16;   // до этого момента бутоны закрыты
  const END   = 0.60;   // букет полностью раскрыт около центра экрана
  const SPAN  = 0.34;   // длительность раскрытия отдельной розы

  let ticking = false;
  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // raw: 0 — секция только показалась снизу, 1 — ушла за верх
    const raw = (vh - rect.top) / (vh + rect.height);
    const t = (raw - START) / (END - START);   // общий прогресс 0..1

    roses.forEach(({ cfg, el }) => {
      // каждая роза стартует со своей задержкой d и раскрывается за SPAN
      let bloom = (t - cfg.d) / SPAN;
      bloom = Math.max(0, Math.min(1, bloom));
      el.style.setProperty('--bloom', bloom.toFixed(3));
    });
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

  // Validate
  function validate(form) {
    let ok = true;

    // имя
    const name = form.guestName;
    const nameEmpty = !name.value.trim();
    name.classList.toggle('error', nameEmpty);
    if (nameEmpty) ok = false;

    // выбор присутствия
    const attendChecked = form.querySelector('[name="attending"]:checked');
    if (!attendChecked) ok = false;
    form.querySelectorAll('.attend-option').forEach(opt => {
      opt.classList.toggle('error', !attendChecked);
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
        'Фамилия и имя':  data.name,
        'Присутствие':    data.attending,
        _subject:         `Подтверждение участия — ${data.name}`,
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

      const data = {
        name:      form.guestName.value.trim(),
        attending: form.querySelector('[name="attending"]:checked')?.value || '',
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
