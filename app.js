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
// клик в любом месте стартового экрана раскрывает конверт
document.getElementById('envelope')?.addEventListener('click', openInvitation, { once: true });

function openInvitation() {
  const envelope = document.getElementById('envelope');
  if (!envelope) return;
  envelope.classList.add('opened');
  document.body.classList.add('intro-open');   // первая фотография плавно появляется
  setTimeout(() => { envelope.style.display = 'none'; }, 3600);
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
}

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

/* ── ЛОТОС удалён ── */
(function initRose() {
  const section = document.getElementById('rose-bloom');
  const scene   = document.getElementById('rose-scene');
  if (!section || !scene) return;

  // ВИД СБОКУ: лепестки веером раскрываются от основания.
  // [уголРаскрытия°, ширина, высота, z-слой, тон] — пары лево/право симметричны.
  const petals = [
    [-96, 64, 128, 1, 'b'], [ 96, 64, 128, 1, 'b'],   // внешний ряд (сзади)
    [-72, 62, 138, 1, 'b'], [ 72, 62, 138, 1, 'b'],
    [-48, 60, 144, 1, 'b'], [ 48, 60, 144, 1, 'b'],
    [  0, 60, 148, 1, 'b'],                            // задний центральный
    [-60, 58, 134, 2, 'm'], [ 60, 58, 134, 2, 'm'],   // средний ряд
    [-34, 56, 144, 2, 'm'], [ 34, 56, 144, 2, 'm'],
    [-14, 54, 150, 2, 'm'], [ 14, 54, 150, 2, 'm'],
    [-40, 44, 100, 3, 'f'], [ 40, 44, 100, 3, 'f'],   // внутренняя чаша
    [-18, 48, 126, 3, 'f'], [ 18, 48, 126, 3, 'f'],
    [  0, 46, 140, 4, 'f']                             // передний центральный
  ];
  const tiers = {
    b: { c1: '#ECE6DC', c2: '#E2DBCF', c3: '#D2CAB8', tip: 'rgba(225,222,196,0)'    },
    m: { c1: '#F8F4EC', c2: '#EFE9DE', c3: '#E0D8C9', tip: 'rgba(240,234,205,0.40)' },
    f: { c1: '#FFFFFF', c2: '#FAF6EF', c3: '#EFE7D8', tip: 'rgba(247,240,214,0.50)' }
  };

  // строим один лотос (вид сбоку) внутри сцены — без стебля
  function buildRose(cfg) {
    const rose = document.createElement('div');
    rose.className = 'rose';
    rose.style.setProperty('--scale', cfg.scale);
    rose.style.setProperty('--x', cfg.x + 'px');
    rose.style.setProperty('--y', cfg.y + 'px');

    const base = document.createElement('div');
    base.className = 'lotus-base';
    rose.appendChild(base);

    const throat = document.createElement('div');
    throat.className = 'lotus-throat';
    rose.appendChild(throat);

    petals.forEach(([open, w, h, z, t]) => {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const tier = tiers[t];
      petal.style.setProperty('--open', open + 'deg');
      petal.style.setProperty('--w', w);
      petal.style.setProperty('--h', h);
      petal.style.setProperty('--z', z);
      petal.style.setProperty('--c1', tier.c1);
      petal.style.setProperty('--c2', tier.c2);
      petal.style.setProperty('--c3', tier.c3);
      petal.style.setProperty('--tip', tier.tip);
      rose.appendChild(petal);
    });

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

  // Значение варианта «приду с парой» — при нём показываем второе поле
  const PARTNER_VALUE = 'Смогу присутствовать. Приду с парой.';

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

    // имя пары — обязательно, если выбран вариант «приду с парой»
    const partner = form.partnerName;
    if (partner) {
      const partnerRequired = attendChecked && attendChecked.value === PARTNER_VALUE;
      const partnerEmpty = partnerRequired && !partner.value.trim();
      partner.classList.toggle('error', partnerEmpty);
      if (partnerEmpty) ok = false;
    }

    return ok;
  }

  // Web3Forms (https://web3forms.com) — Access Key получен на soerenchin@gmail.com.
  // Это публичный ключ формы, не секрет — его и положено вставлять в клиентский код.
  const WEB3FORMS_ACCESS_KEY = '659a548b-6a1b-4dbd-baa6-2ee88d012ec3';
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  // Отправка через Web3Forms (email → soerenchin@gmail.com) + локальный бэкап.
  async function submit(data) {
    const entries = JSON.parse(localStorage.getItem('rsvpEntries') || '[]');
    entries.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem('rsvpEntries', JSON.stringify(entries));

    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Подтверждение участия — ${data.name}`,
        'Фамилия и имя': data.name,
        'Присутствие':   data.attending,
        ...(data.partner ? { 'Фамилия и имя пары': data.partner } : {}),
      }),
    });

    const info = await res.json().catch(() => ({}));
    if (!res.ok || !info.success) {
      throw new Error(info?.message || `Web3Forms error ${res.status}`);
    }
  }

  // Form submit
  const form = document.getElementById('rsvpForm');
  if (form) {

    // Показ/скрытие второго поля «Фамилия и имя пары»
    const partnerGroup = document.getElementById('partnerNameGroup');
    const partnerInput = form.partnerName;
    function togglePartner() {
      const checked = form.querySelector('[name="attending"]:checked');
      const show = !!checked && checked.value === PARTNER_VALUE;
      if (partnerGroup) partnerGroup.hidden = !show;
      if (!show && partnerInput) {
        partnerInput.value = '';
        partnerInput.classList.remove('error');
      }
    }
    form.querySelectorAll('[name="attending"]').forEach(r =>
      r.addEventListener('change', togglePartner)
    );
    togglePartner();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(form)) return;

      const submitBtn = document.getElementById('submitBtn');
      const btnText  = submitBtn?.querySelector('.btn-text');
      const btnLoad  = submitBtn?.querySelector('.btn-loading');

      if (btnText) btnText.style.display = 'none';
      if (btnLoad) btnLoad.style.display = '';
      if (submitBtn) submitBtn.disabled = true;

      const attending = form.querySelector('[name="attending"]:checked')?.value || '';
      const data = {
        name:      form.guestName.value.trim(),
        attending: attending,
        partner:   attending === PARTNER_VALUE ? (form.partnerName?.value.trim() || '') : '',
      };

      try {
        await submit(data);
        // Показываем благодарность внутри рамки анкеты — без перехода на финиш-оверлей.
        // Саму рамку (.rsvp-form) сохраняем вместе с её размерами: фиксируем текущую
        // высоту, чтобы рамка не схлопнулась под короткий текст, и заменяем содержимое.
        form.style.minHeight = form.offsetHeight + 'px';
        form.classList.add('rsvp-form--done');
        const thanks = document.createElement('p');
        thanks.className = 'rsvp-thanks';
        thanks.textContent = 'Спасибо, что заполнили анкету';
        form.replaceChildren(thanks);
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
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
