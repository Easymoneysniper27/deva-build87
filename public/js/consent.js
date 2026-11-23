/* ============================================================
   DEVA-BUILD87 — съгласие за бисквитки (GDPR + Google Consent Mode v2)
   - По подразбиране всичко е „отказано“ (задава се в <head> на всяка страница).
   - Google таговете работят в Advanced режим: без съгласие не записват бисквитки.
   - Meta Pixel се зарежда САМО след съгласие за маркетинг.
   - Изборът се пази в localStorage „db87-consent“ за 180 дни.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "db87-consent";
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000; // 180 дни
  var PIXEL_ID = "1823493998622525";

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && c.t && Date.now() - c.t < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }

  function save(a, m) {
    var c = { a: !!a, m: !!m, t: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }

  function applyGoogle(c) {
    if (typeof gtag !== "function") return;
    gtag("consent", "update", {
      analytics_storage: c.a ? "granted" : "denied",
      ad_storage: c.m ? "granted" : "denied",
      ad_user_data: c.m ? "granted" : "denied",
      ad_personalization: c.m ? "granted" : "denied"
    });
  }

  var pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;
    /* Официалният базов код на Meta Pixel */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function apply(c) {
    applyGoogle(c);
    if (c.m) {
      loadPixel();
    } else if (pixelLoaded && typeof window.fbq === "function") {
      window.fbq("consent", "revoke");
    }
  }

  /* ---------- Банер ---------- */
  var banner = null;

  function buildBanner() {
    var el = document.createElement("div");
    el.className = "cookie-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Съгласие за бисквитки");
    el.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__title">Бисквитки</p>' +
        '<p class="cookie-banner__text">Ползваме бисквитки, за да работи сайтът, да измерваме посещенията и да показваме по-полезни реклами. ' +
        'Можете да приемете всички, да откажете или да изберете. Подробности: <a href="/poveritelnost">Поверителност и бисквитки</a>.</p>' +
        '<div class="cookie-banner__options" hidden>' +
          '<label class="cookie-opt"><input type="checkbox" checked disabled> <span><strong>Необходими</strong> — за работата на сайта (винаги включени)</span></label>' +
          '<label class="cookie-opt"><input type="checkbox" data-c="a"> <span><strong>Статистика</strong> — Google Analytics, за да разберем как се ползва сайтът</span></label>' +
          '<label class="cookie-opt"><input type="checkbox" data-c="m"> <span><strong>Маркетинг</strong> — Google Ads и Meta (Facebook), за измерване и по-подходящи реклами</span></label>' +
        '</div>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="btn btn--ghost cookie-btn" data-act="reject">Отказвам</button>' +
          '<button type="button" class="btn btn--ghost cookie-btn" data-act="custom">Настройки</button>' +
          '<button type="button" class="btn btn--accent cookie-btn" data-act="accept">Приемам всички</button>' +
        '</div>' +
      '</div>';

    el.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-act]") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      var opts = el.querySelector(".cookie-banner__options");

      if (act === "accept") return decide(true, true);
      if (act === "reject") return decide(false, false);
      if (act === "custom") {
        if (opts.hidden) {
          opts.hidden = false;
          btn.textContent = "Запази избора";
          btn.setAttribute("data-act", "save");
        }
        return;
      }
      if (act === "save") {
        decide(el.querySelector('[data-c="a"]').checked, el.querySelector('[data-c="m"]').checked);
      }
    });
    return el;
  }

  function showBanner(withOptions) {
    if (!banner) {
      banner = buildBanner();
      document.body.appendChild(banner);
    }
    var c = read();
    banner.querySelector('[data-c="a"]').checked = !!(c && c.a);
    banner.querySelector('[data-c="m"]').checked = !!(c && c.m);
    var opts = banner.querySelector(".cookie-banner__options");
    var customBtn = banner.querySelector('[data-act="custom"], [data-act="save"]');
    opts.hidden = !withOptions;
    customBtn.textContent = withOptions ? "Запази избора" : "Настройки";
    customBtn.setAttribute("data-act", withOptions ? "save" : "custom");
    banner.classList.add("is-open");
    document.body.classList.add("has-cookie-banner");
  }

  function hideBanner() {
    if (banner) banner.classList.remove("is-open");
    document.body.classList.remove("has-cookie-banner");
  }

  function decide(a, m) {
    apply(save(a, m));
    hideBanner();
  }

  /* ---------- Старт ---------- */
  var current = read();
  if (current) {
    if (current.m) loadPixel(); // Google вече е обновен в <head>
  } else {
    showBanner(false);
  }

  /* Линк „Настройки за бисквитки“ във footer-а и в политиката */
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("[data-cookie-settings]") : null;
    if (!link) return;
    e.preventDefault();
    showBanner(true);
  });
})();
