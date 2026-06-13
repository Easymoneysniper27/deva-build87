# Design System — Deva-Eng87 (Master / Source of Truth)

Редизайн 2026-06: светла „Roofix“ визия (бяло + червен акцент) по референция от клиента.
Всички нови страници и компоненти следват този файл, освен ако няма override в `design-system/pages/<страница>.md`.

## Идентичност
- **Бранд:** Deva-Eng87 — строително-ремонтни услуги, цяла България
- **Слоган:** „Надеждни строително-ремонтни услуги за вашия дом и бизнес“
- **Контакти:** 0884 202 868 · deva-eng87@mail.bg · Пон–Съб 08:00–19:00
- **Език:** само български

## Шаблон (layout pattern)
- Hero-Centric + Feature-Rich, Conversion-Optimized + Trust
- **Задължителни елементи:** видим телефон във всяка секция/навигация, портфолио с проекти, гаранции и доверителни сигнали, списък с услуги, локални сигнали (градове)
- Поток на началната страница: Hero → лента предимства → услуги → защо нас → процес (4 стъпки) → проекти → отзиви → CTA лента → footer

## Стил
- Светъл минимализъм: бели/светлосиви фонове, едри заглавия с ГЛАВНИ букви, червени акценти, черни бутони (pill)
- Карти с тънки бордери (1px), радиус 8–16px, hover: повдигане + червен бордер/сянка
- Тъмни елементи за контраст: черна лента с услуги под херото (index), черна CTA лента, черен footer

## Цветове (CSS променливи в css/style.css)
| Token | Стойност | Употреба |
|---|---|---|
| `--bg` | #ffffff | основен фон |
| `--bg-soft` | #f6f5f2 | редуващи се секции, page-hero |
| `--surface` | #ffffff | карти |
| `--dark` | #121212 | бутони, CTA лента, footer, services-strip |
| `--text` | #141414 | основен текст |
| `--muted` | #6b6a64 | вторичен текст |
| `--accent` | #e8432a | червен акцент (лого, линкове, икони, accent-text) |
| `--accent-deep` | #c93016 | тъмен край на градиента на логото |

**Забранено:** лилаво/розови AI градиенти; светли текстове под 4.5:1 контраст; скриване на телефона.

## Типография
- **Заглавия:** Oswald 500–700, text-transform: uppercase (кирилица ✓)
- **Текст:** Inter 400–700 (кирилица ✓)
- Базов размер 16.5px (16px на мобилни), line-height 1.7; заглавия с clamp()

## Анимации
- Scroll reveal: `[data-reveal]` (+ `left`/`right`, `data-reveal-delay="ms"`), IntersectionObserver
- Hero entrance: `[data-hero="1..5"]` каскада
- Броячи: `[data-count]` + `data-suffix`
- Микровзаимодействия 150–300ms, само transform/opacity
- `prefers-reduced-motion` изключва всичко (вече в CSS)

## Компоненти (готови класове)
`.btn--accent` `.btn--ghost` `.btn--dark` · `.service-card` · `.project-card` (+lightbox) · `.testimonial` · `.step` · `.cta-band` · `.faq-item` · `.split` / `.split--reverse` · `.contact-card` · `.chip` · `.kicker` · `.hero-stats`

## Икони
Inline SVG в стил Lucide: viewBox 0 0 24 24, stroke-width 1.8, stroke-linecap/linejoin round. Без емоджита като икони.

## Файлове
- Основни страници: index.html, uslugi.html (обзор), proekti.html, za-nas.html, kontakti.html
- SEO страници на услуги: remont-na-pokrivi.html, fasadi.html, grub-stroezh.html, vutreshni-remonti.html
- Стилове: css/style.css · Скриптове: js/main.js · SEO: sitemap.xml, robots.txt (домейнът е placeholder!)
- Навигация: падащо меню „Услуги“ (`.has-sub`/`.sub-menu`, чист CSS hover/focus-within; на мобилни подточките са винаги видими)
- Шаблон на страница на услуга: page-hero--split (текст + вертикален постер-корица `.page-hero-poster` + breadcrumbs) → „Какво включва“ (split) → Предимства (4 value-cards) → Процес (4 steps) → Галерия (gallery-grid ×3) → FAQ (4) + свързани услуги → CTA. JSON-LD: Service + BreadcrumbList + FAQPage на всяка.

## Отворени точки (за подмяна от клиента)
- Статистиките (15+ години, 240+ обекта, 98%, 60+ града) са примерни
- Отзивите и проектите са примерни; снимките са от Unsplash CDN — да се заменят с реални снимки от обекти
- Формата отваря mailto; за изпращане без имейл клиент — Formspree (виж коментара в js/main.js)
