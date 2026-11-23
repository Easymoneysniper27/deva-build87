/* ============================================================
   DEVA-BUILD87 — интеракции и анимации
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Навигация: фон при скрол ---------- */
  var header = document.querySelector(".site-header");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Дискретен паралакс на hero снимката ---------- */
  var heroBg = document.querySelector(".hero-bg");

  if (heroBg && !prefersReducedMotion) {
    var parallaxTicking = false;

    function onParallax() {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y <= window.innerHeight) {
          heroBg.style.transform = "translateY(" + (y * 0.1).toFixed(1) + "px)";
        }
        parallaxTicking = false;
      });
    }

    window.addEventListener("scroll", onParallax, { passive: true });
  }

  /* ---------- Мобилно меню ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");

  function closeMenu() {
    document.body.classList.remove("nav-open", "menu-locked");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Отвори менюто");
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      document.body.classList.toggle("menu-locked", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Затвори менюто" : "Отвори менюто");
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (revealEls.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      var delay = el.getAttribute("data-reveal-delay");
      if (delay) el.style.setProperty("--reveal-delay", delay + "ms");
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Броячи (статистики) ---------- */
  var counters = document.querySelectorAll("[data-count]");

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1600;
    var start = null;

    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- FAQ акордеон ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!btn || !answer) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-a").style.maxHeight = "0px";
        }
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? "0px" : answer.scrollHeight + "px";
    });
  });

  /* ---------- Филтър на проекти ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".projects-grid .project-card");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filterButtons.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });

      projectCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------- Lightbox за проекти ---------- */
  var lightbox = document.querySelector(".lightbox");

  if (lightbox && projectCards.length) {
    var lightboxImg = lightbox.querySelector("img");
    var lightboxCaption = lightbox.querySelector(".lightbox-caption");
    var lightboxClose = lightbox.querySelector(".lightbox-close");
    var lastFocused = null;

    function openLightbox(card) {
      var img = card.querySelector("img");
      var title = card.querySelector("h3");
      if (!img) return;
      lastFocused = document.activeElement;
      lightboxImg.src = img.getAttribute("data-full") || img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = title ? title.textContent : "";
      lightbox.classList.add("is-open");
      document.body.classList.add("menu-locked");
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("menu-locked");
      if (lastFocused) lastFocused.focus();
    }

    projectCards.forEach(function (card) {
      card.addEventListener("click", function () {
        openLightbox(card);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(card);
        }
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---------- Бутон „нагоре“ ---------- */
  var toTop = document.querySelector(".to-top");

  if (toTop) {
    window.addEventListener(
      "scroll",
      function () {
        toTop.classList.toggle("is-visible", window.scrollY > 640);
      },
      { passive: true }
    );

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Контактна форма ----------
     Изпраща запитването през Web3Forms (без собствен сървър).
     При грешка НЕ казва „Благодарим“ — показва ясно съобщение с телефона,
     а попълнените данни остават във формата.
  ------------------------------------------------------------ */
  var form = document.getElementById("contact-form");

  /* Телефон във формат E.164 (+359...) за подобреното проследяване на конверсии */
  function toE164(raw) {
    var d = String(raw || "").replace(/[^\d+]/g, "");
    if (d.indexOf("+") === 0) return /^\+\d{10,15}$/.test(d) ? d : "";
    if (d.indexOf("00") === 0) d = "+" + d.slice(2);
    else if (d.indexOf("0") === 0) d = "+359" + d.slice(1);
    else if (d.indexOf("359") === 0) d = "+" + d;
    return /^\+\d{10,15}$/.test(d) ? d : "";
  }

  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var successBox = form.parentElement.querySelector(".form-success");
    var failBox = form.parentElement.querySelector(".form-fail");

    function showSuccess() {
      if (failBox) failBox.classList.remove("is-visible");
      if (successBox) successBox.classList.add("is-visible");
    }

    function showFail() {
      if (!failBox) return;
      failBox.innerHTML =
        'Запитването <strong>не беше изпратено</strong> — проблем с връзката. ' +
        'Моля, опитайте отново или се обадете на <a href="tel:+359884202868">0884 202 868</a> ' +
        '(или пишете на <a href="mailto:deva-build87@mail.bg">deva-build87@mail.bg</a>).';
      failBox.classList.add("is-visible");
      if (typeof gtag === "function") gtag("event", "form_error", { form_id: "contact-form" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var empty = !field.value.trim();
        field.classList.toggle("has-error", empty);
        field.setAttribute("aria-invalid", String(empty));
        if (empty) valid = false;
      });

      var emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailField.value.trim())) {
        emailField.classList.add("has-error");
        emailField.setAttribute("aria-invalid", "true");
        valid = false;
      }

      if (!valid) {
        var firstError = form.querySelector(".has-error");
        if (firstError) firstError.focus();
        return;
      }

      if (!window.fetch) {
        form.submit(); // много стари браузъри – обикновено изпращане
        return;
      }

      var emailVal = emailField ? emailField.value.trim() : "";
      var phoneVal = toE164(form.elements.phone && form.elements.phone.value);
      var serviceVal = (form.elements.service && form.elements.service.value) || "";

      if (submitBtn) submitBtn.disabled = true;
      if (failBox) failBox.classList.remove("is-visible");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            trackFormSubmitConversion(emailVal, phoneVal, serviceVal);
            form.reset();
            showSuccess();
          } else {
            showFail();
          }
        })
        .catch(showFail)
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    form.querySelectorAll("input, textarea, select").forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("has-error");
        field.removeAttribute("aria-invalid");
      });
    });
  }

  /* ---------- Google Ads — проследяване на реализации ----------
     Пуска конверсия при: клик на телефон (tel:) → отделен label „обаждане“,
     клик на имейл (mailto:) → общ label „Заявка за оферта“ и успешно
     изпращане на формата (по-долу) → отделен label за форма.
  ------------------------------------------------------------ */
  function trackAdsConversion() {
    if (typeof gtag === "function") {
      gtag("event", "conversion", { send_to: "AW-18234839839/tTv4CLeIm80cEJ-mhvdD" });
    }
  }

  /* Отделна конверсия за обаждане при клик на телефонен линк (tel:),
     с отделен label от Google Ads. */
  function trackPhoneConversion() {
    if (typeof gtag === "function") {
      gtag("event", "conversion", { send_to: "AW-18234839839/qsyfCIb3i84cEJ-mhvdD" });
    }
  }

  /* Отделна конверсия специално за успешно изпратена форма за контакт
     (запитване/оферта), с отделен label от Google Ads. */
  function trackFormSubmitConversion(email, phone, service) {
    if (typeof gtag !== "function") return;
    /* Подобрено проследяване на конверсии (enhanced conversions) – Google го
       използва само ако посетителят е дал съгласие за маркетинг. */
    var ud = {};
    if (email) ud.email = email;
    if (phone) ud.phone_number = phone;
    if (ud.email || ud.phone_number) gtag("set", "user_data", ud);
    gtag("event", "conversion", { send_to: "AW-18234839839/PPK0COimms0cEJ-mhvdD" });
    gtag("event", "generate_lead", { lead_source: "contact_form", service: service || "" });
  }

  function linkPlace(link) {
    if (link.closest(".site-header")) return "header";
    if (link.closest(".site-footer")) return "footer";
    if (link.classList.contains("float-call")) return "float_button";
    return "page";
  }

  var adsFired = {}; // отчита само веднъж на тип в рамките на текущата страница
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="tel:"], a[href^="mailto:"]') : null;
    if (!link) return;
    var type = link.getAttribute("href").indexOf("tel:") === 0 ? "phone" : "email";
    if (adsFired[type]) return;
    adsFired[type] = true;
    if (type === "phone") {
      trackPhoneConversion();
      if (typeof gtag === "function") gtag("event", "click_to_call", { link_location: linkPlace(link) });
    } else {
      trackAdsConversion();
      if (typeof gtag === "function") gtag("event", "click_email", { link_location: linkPlace(link) });
    }
  });

  /* ---------- Текуща година във footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
