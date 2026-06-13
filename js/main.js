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
     Изпраща запитването директно през Web3Forms (без сървър и без
     отваряне на имейл програма). Нужен е безплатен access_key, поставен
     в скритото поле name="access_key" в kontakti.html.
     Докато ключът е още заместител (започва с „__"), формата автоматично
     минава към резервен вариант чрез имейл програмата (mailto) — така
     формата работи дори преди да е добавен ключът.
  ------------------------------------------------------------ */
  var form = document.getElementById("contact-form");

  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var successBox = form.parentElement.querySelector(".form-success");

    function showSuccess(text) {
      if (!successBox) return;
      if (text) successBox.textContent = text;
      successBox.classList.add("is-visible");
    }

    function mailtoFallback(d) {
      var subject = encodeURIComponent("Запитване от сайта — " + d.name);
      var body = encodeURIComponent(
        "Име: " + d.name +
        "\nТелефон: " + d.phone +
        "\nИмейл: " + d.email +
        "\nУслуга: " + d.service +
        "\n\nСъобщение:\n" + d.message
      );
      window.location.href = "mailto:deva-build87@mail.bg?subject=" + subject + "&body=" + body;
      showSuccess("Благодарим ви! Отваряме имейл програмата ви със запитването — само го прегледайте и го изпратете. Ако предпочитате, обадете ни се на 0884 202 868.");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var empty = !field.value.trim();
        field.classList.toggle("has-error", empty);
        if (empty) valid = false;
      });

      var emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailField.value.trim())) {
        emailField.classList.add("has-error");
        valid = false;
      }

      if (!valid) {
        var firstError = form.querySelector(".has-error");
        if (firstError) firstError.focus();
        return;
      }

      var data = {
        name: (form.elements.name && form.elements.name.value) || "",
        phone: (form.elements.phone && form.elements.phone.value) || "",
        email: (form.elements.email && form.elements.email.value) || "",
        service: (form.elements.service && form.elements.service.value) || "",
        message: (form.elements.message && form.elements.message.value) || ""
      };

      var keyField = form.querySelector('input[name="access_key"]');
      var accessKey = keyField ? keyField.value.trim() : "";
      var keyReady = accessKey && accessKey.indexOf("__") !== 0;

      /* Още няма реален ключ или браузърът не поддържа fetch → резервен mailto */
      if (!keyReady || !window.fetch) {
        mailtoFallback(data);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            form.reset();
            showSuccess("Благодарим ви! Запитването е изпратено успешно — ще се свържем с вас до края на работния ден. Ако е спешно, обадете се на 0884 202 868.");
          } else {
            mailtoFallback(data);
          }
        })
        .catch(function () {
          mailtoFallback(data);
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    form.querySelectorAll("input, textarea, select").forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("has-error");
      });
    });
  }

  /* ---------- Текуща година във footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
