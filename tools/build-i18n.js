#!/usr/bin/env node
/* ==========================================================================
   Builds the localized homepages — /zh-hans/, /fr/, /ja/ … — from the JSON in
   tools/i18n/<slug>.json.

     node tools/build-i18n.js

   The output is committed, so the site still needs no build step to serve.
   This script exists only so the nine pages stay structurally identical and
   a missing string fails loudly instead of silently shipping English.

   The English homepage (index.html) is NOT generated from here: it carries
   hand-written comments and copy that should stay hand-edited. When its
   structure changes, mirror the change in the template below.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://adfence.mxcode.com';
const STORE = 'https://apps.apple.com/us/app/adfence-safari-ad-blocker/id6825119569';
const CSS_VERSION = 6;

/* Order matters: this is the order of the language menu. */
const LANGS = [
  { slug: '',          code: 'en',      og: 'en_US', label: 'English',  short: 'EN'  },
  { slug: 'zh-hans',   code: 'zh-Hans', og: 'zh_CN', label: '简体中文',  short: '简中' },
  { slug: 'zh-hant',   code: 'zh-Hant', og: 'zh_TW', label: '繁體中文',  short: '繁中' },
  { slug: 'fr',        code: 'fr',      og: 'fr_FR', label: 'Français', short: 'FR'  },
  { slug: 'de',        code: 'de',      og: 'de_DE', label: 'Deutsch',  short: 'DE'  },
  { slug: 'it',        code: 'it',      og: 'it_IT', label: 'Italiano', short: 'IT'  },
  { slug: 'ja',        code: 'ja',      og: 'ja_JP', label: '日本語',    short: 'JA'  },
  { slug: 'ko',        code: 'ko',      og: 'ko_KR', label: '한국어',    short: 'KO'  },
  { slug: 'pt',        code: 'pt-PT',   og: 'pt_PT', label: 'Português', short: 'PT'  },
  { slug: 'es',        code: 'es-ES',   og: 'es_ES', label: 'Español',  short: 'ES'  }
];

const urlFor = (slug) => SITE + '/' + (slug ? slug + '/' : '');

/* Where a language lives, seen from a page one directory deep. */
const relFor = (slug) => '../' + (slug ? slug + '/' : '');

function esc(s) {
  return String(s)
    .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Category icons, in the same order as features.items in the JSON. */
const CAT_ICONS = [
  '<circle cx="12" cy="12" r="9"/><path d="M5.7 18.3L18.3 5.7"/>',
  '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0112 5c5 0 9 4 10 7-.4 1.1-1.2 2.3-2.3 3.3"/><path d="M6.2 6.2C4 7.8 2.5 10.1 2 12c1 3 5 7 10 7 1.6 0 3.1-.4 4.4-1.1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  '<path d="M12 3l7 3v6c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6l7-3z"/><path d="M9.2 12.2l2.1 2.1 3.9-4"/>',
  '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="9.5" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="10" cy="15" r="1"/>',
  '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18"/><path d="M8 14h5"/>',
  '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
  '<rect x="3" y="4" width="18" height="6" rx="2"/><path d="M12 14v6"/><path d="M9.5 17.5L12 20l2.5-2.5"/>',
  '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M8 10h8M8 14h5"/>',
  '<path d="M12 3l7 3v6c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6l7-3z"/><path d="M9.5 9.5l5 5"/><path d="M14.5 9.5l-5 5"/>',
  '<path d="M5 19L12 5l7 14"/><path d="M8.5 13h7"/>',
  '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/>',
  '<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/>',
  '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
];

const CARD_ICONS = [
  '<rect x="7" y="5" width="3" height="14" rx="1"/><rect x="14" y="5" width="3" height="14" rx="1"/>',
  '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v5h-5"/>',
  '<path d="M12 3l7 3v6c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6l7-3z"/><path d="M9 12h6"/><path d="M12.5 9.5L15 12l-2.5 2.5"/>',
  '<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h4"/><path d="M12 17h8"/><circle cx="10" cy="17" r="2"/>'
];

const SHOT_FILES = [
  { src: 'adfence-other-settings.png', w: 520, h: 1127 },
  { src: 'adfence-site-settings.png', w: 520, h: 1127 },
  { src: 'adfence-custom-rules.png', w: 520, h: 1127 },
  { src: 'adfence-extension-status.png', w: 520, h: 1127 }
];

function svg(inner) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
         'stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}

function languageMenu(currentSlug) {
  const items = LANGS.map(function (l) {
    const current = l.slug === currentSlug ? ' aria-current="page"' : '';
    return '          <li><a href="' + relFor(l.slug) + '" hreflang="' + l.code +
           '" lang="' + l.code + '"' + current + '>' + esc(l.label) + '</a></li>';
  }).join('\n');

  const here = LANGS.find(function (l) { return l.slug === currentSlug; });

  return '<details class="lang">\n' +
    '        <summary aria-label="' + esc(here.label) + '">' + esc(here.short) + '</summary>\n' +
    '        <ul>\n' + items + '\n        </ul>\n' +
    '      </details>';
}

function alternates() {
  const rows = LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l.code + '" href="' + urlFor(l.slug) + '">';
  });
  rows.push('<link rel="alternate" hreflang="x-default" href="' + urlFor('') + '">');
  return rows.join('\n');
}

function structuredData(d) {
  const org = {
    '@type': 'Organization',
    '@id': SITE + '/#organization',
    name: 'AdFence',
    alternateName: 'AdFence - Ad & Tracker Blocker',
    url: SITE + '/',
    logo: { '@type': 'ImageObject', url: SITE + '/images/logo.png', width: 1024, height: 1024 },
    image: SITE + '/images/og-card.png',
    description: d.orgDesc,
    disambiguatingDescription: 'AdFence is a Safari ad and tracker blocker for iPhone, iPad and macOS, published on the Apple App Store under App ID 6825119569. In this context the name refers only to this app.',
    email: 'support@mxcode.com',
    sameAs: [STORE]
  };

  const site = {
    '@type': 'WebSite',
    '@id': SITE + '/#website',
    url: SITE + '/',
    name: 'AdFence',
    description: d.siteDesc,
    inLanguage: d.lang,
    publisher: { '@id': SITE + '/#organization' }
  };

  const app = {
    '@type': 'SoftwareApplication',
    '@id': SITE + '/#app',
    name: 'AdFence',
    alternateName: 'AdFence - Ad & Tracker Blocker',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'iOS, iPadOS, macOS',
    inLanguage: d.lang,
    description: d.appDesc,
    url: SITE + '/',
    installUrl: STORE,
    downloadUrl: STORE,
    sameAs: [STORE],
    image: SITE + '/images/og-card.png',
    screenshot: SHOT_FILES.map(function (s) { return SITE + '/images/' + s.src; }),
    featureList: d.features.items.map(function (i) { return i.t; }),
    publisher: { '@id': SITE + '/#organization' }
  };

  const faq = {
    '@type': 'FAQPage',
    '@id': SITE + '/' + d.slug + '/#faq',
    inLanguage: d.lang,
    mainEntity: d.faq.items.map(function (i) {
      return {
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a }
      };
    })
  };

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [org, site, app, faq]
  }, null, 2);
}

function render(d) {
  const me = LANGS.find(function (l) { return l.slug === d.slug; });
  const url = urlFor(d.slug);
  const ogAlt = LANGS.filter(function (l) { return l.slug !== d.slug; })
    .map(function (l) { return '<meta property="og:locale:alternate" content="' + l.og + '">'; })
    .join('\n');

  const cats = d.features.items.map(function (item, i) {
    return '        <div class="cat">\n          ' + svg(CAT_ICONS[i]) + '\n' +
      '          <h3>' + esc(item.t) + '</h3>\n          <p>' + esc(item.d) + '</p>\n        </div>';
  }).join('\n\n');

  const cards = d.features.extras.map(function (item, i) {
    return '        <div class="feature-card">\n          ' + svg(CARD_ICONS[i]) + '\n' +
      '          <h3>' + esc(item.t) + '</h3>\n          <p>' + esc(item.d) + '</p>\n        </div>';
  }).join('\n\n');

  const shots = d.shots.items.map(function (item, i) {
    const f = SHOT_FILES[i];
    return '        <figure class="shot">\n' +
      '          <div class="shot-screen">\n' +
      '            <img src="../images/' + f.src + '"\n' +
      '                 alt="' + esc(item.alt) + '"\n' +
      '                 width="' + f.w + '" height="' + f.h + '" loading="lazy" decoding="async">\n' +
      '          </div>\n' +
      '          <figcaption>\n' +
      '            <strong>' + esc(item.strong) + '</strong>\n' +
      '            ' + esc(item.cap) + '\n' +
      '          </figcaption>\n' +
      '        </figure>';
  }).join('\n\n');

  const steps = d.setup.steps.map(function (s) {
    return '        <div class="step">\n' +
      '          <h3>' + esc(s.t) + '</h3>\n' +
      '          <p>' + s.d + '</p>\n' +
      '        </div>';
  }).join('\n');

  const rows = d.privacy.rows.map(function (r) {
    const tick = r.tick ? ' tick' : '';
    return '          <div class="mini-row">\n' +
      '            <span class="label">' + esc(r.l) + '</span>\n' +
      '            <span class="value' + tick + '">' + esc(r.v) + '</span>\n' +
      '          </div>';
  }).join('\n');

  const faqs = d.faq.items.map(function (item, i) {
    return '        <details' + (i === 0 ? ' open' : '') + '>\n' +
      '          <summary>' + esc(item.q) + '</summary>\n' +
      '          <div class="answer">\n' +
      '            <p>' + esc(item.a) + '</p>\n' +
      '          </div>\n' +
      '        </details>';
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="${me.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Generated by tools/build-i18n.js from tools/i18n/${d.slug}.json — edit that
     file and re-run the script rather than editing this page by hand. -->

<title>${esc(d.title)}</title>
<meta name="description" content="${esc(d.desc)}">
<link rel="canonical" href="${url}">
${alternates()}
<meta name="theme-color" content="#4b34b8">

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(d.ogTitle)}">
<meta property="og:description" content="${esc(d.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="AdFence">
<meta property="og:locale" content="${me.og}">
${ogAlt}
<meta property="og:image" content="${SITE}/images/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(d.imgAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(d.ogTitle)}">
<meta name="twitter:description" content="${esc(d.desc)}">
<meta name="twitter:image" content="${SITE}/images/og-card.png">

<script type="application/ld+json">
${structuredData(d)}
</script>

<link rel="icon" href="../images/favicon.png" type="image/png">
<link rel="stylesheet" href="../css/style.css?v=${CSS_VERSION}">

<!-- GA4 (G-3GFDY4TL3R), loaded after the visitor accepts. See js/analytics.js. -->
<script src="../js/analytics.js" defer></script>

<!-- Google Search Console — URL-prefix property for https://adfence.mxcode.com/ -->
<meta name="google-site-verification" content="CRHi3cdgHMZ8cqNCuEHcq3Tx8T6GM1eVscF2Gkbzag0">
</head>
<body>

<!-- The English pages are the source of truth for structure; this page is a
     translation of index.html. Internal links point at the English pages for
     now — only the homepage is localized. -->

<header class="site-header">
  <div class="container">
    <nav class="nav" aria-label="Main">
      <a class="brand" href="../index.html">
        <img class="brand-mark" src="../images/logo-mark.png" alt="" width="30" height="30">
        <span class="brand-text">
          <span class="brand-name">AdFence</span>
          <span class="brand-desc">${esc(d.brandDesc)}</span>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>

      <div class="nav-menu">
        <div class="nav-links">
          <a href="#features">${esc(d.nav.features)}</a>
          <a href="../how-to-use.html">${esc(d.nav.howto)}</a>
          <a href="../support.html">${esc(d.nav.support)}</a>
          <a href="../blog.html">${esc(d.nav.blog)}</a>
        </div>
        ${languageMenu(d.slug)}
        <a class="btn btn-primary btn-sm" href="${STORE}" target="_blank" rel="noopener">${esc(d.nav.download)}</a>
      </div>
    </nav>
  </div>
</header>

<main>

  <!-- ======================= HERO ======================= -->
  <section class="hero">
    <div class="container">
      <div class="hero-grid">

        <div class="hero-copy">
          <span class="pill"><span class="dot"></span>${esc(d.hero.pill)}</span>
          <h1>${esc(d.hero.h1a)} <span class="accent">${esc(d.hero.h1b)}</span></h1>
          <p class="lead">
            ${esc(d.hero.lead)}
          </p>
          <div class="btn-row">
            <a class="appstore-badge" href="${STORE}" target="_blank" rel="noopener">
              <img src="../images/app-store-badge.svg" alt="${esc(d.hero.badge)}" width="120" height="40">
            </a>
            <a class="btn btn-ghost btn-lg" href="#features">${esc(d.hero.ghost)}</a>
          </div>
          <p class="hero-note">${esc(d.hero.note)}</p>
        </div>

        <div class="mock-wrap">
          <div class="mock">
            <div class="mock-screen">
              <img class="mock-shot" src="../images/adfence-general-settings.png"
                   alt="${esc(d.hero.shotAlt)}"
                   width="600" height="1301" fetchpriority="high" decoding="async">
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ======================= SCREENSHOTS ======================= -->
  <section class="section section-alt" id="screenshots">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(d.shots.eyebrow)}</span>
        <h2>${esc(d.shots.title)}</h2>
        <p>${esc(d.shots.lead)}</p>
      </div>

      <div class="shots">

${shots}

      </div>
    </div>
  </section>

  <!-- ======================= FEATURES ======================= -->
  <section class="section" id="features">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(d.features.eyebrow)}</span>
        <h2>${esc(d.features.title)}</h2>
        <p>${esc(d.features.lead)}</p>
      </div>

      <div class="cat-grid">

${cats}

      </div>

      <h3 class="cat-subhead">${esc(d.features.sub)}</h3>

      <div class="feature-cards">

${cards}

      </div>
    </div>
  </section>

  <!-- ======================= HOW IT WORKS ======================= -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(d.setup.eyebrow)}</span>
        <h2>${esc(d.setup.title)}</h2>
        <p>${esc(d.setup.lead)}</p>
      </div>

      <div class="grid grid-3 steps">
${steps}
      </div>

      <p class="center mt-32">
        <a href="../how-to-use.html">${esc(d.setup.more)}</a>
      </p>

      <div class="callout callout-info mt-48">
        <p><strong>${esc(d.setup.calloutStrong)}</strong> ${esc(d.setup.callout)}</p>
      </div>
    </div>
  </section>

  <!-- ======================= PRIVACY ======================= -->
  <section class="section">
    <div class="container">
      <div class="split">
        <div>
          <span class="eyebrow">${esc(d.privacy.eyebrow)}</span>
          <h2>${esc(d.privacy.title)}</h2>
          <p class="lead">
            ${esc(d.privacy.lead)}
          </p>
          <p class="muted">
            ${d.privacy.more}
          </p>
        </div>

        <div class="panel">
${rows}
        </div>
      </div>
    </div>
  </section>

  <!-- ======================= FAQ ======================= -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(d.faq.eyebrow)}</span>
        <h2>${esc(d.faq.title)}</h2>
      </div>

      <div class="faq">
${faqs}
      </div>
    </div>
  </section>

  <!-- ======================= DOWNLOAD ======================= -->
  <section class="section section-tight" id="get">
    <div class="container">
      <div class="cta-band">
        <h2>${esc(d.cta.title)}</h2>
        <p>${esc(d.cta.lead)}</p>
        <a class="appstore-badge" href="${STORE}" target="_blank" rel="noopener">
          <img src="../images/app-store-badge.svg" alt="${esc(d.cta.badge)}" width="120" height="40">
        </a>
      </div>
    </div>
  </section>

</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="../index.html">
          <img class="brand-mark" src="../images/logo-mark.png" alt="" width="30" height="30">
          AdFence
        </a>
        <p>${esc(d.footer.tagline)}</p>
      </div>

      <div class="footer-col">
        <h4>${esc(d.footer.product)}</h4>
        <ul>
          <li><a href="#features">${esc(d.footer.features)}</a></li>
          <li><a href="../how-to-use.html">${esc(d.footer.howto)}</a></li>
          <li><a href="../support.html">${esc(d.footer.support)}</a></li>
          <li><a href="../blog.html">${esc(d.footer.blog)}</a></li>
          <li><a href="${STORE}" target="_blank" rel="noopener">${esc(d.footer.download)}</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>${esc(d.footer.legal)}</h4>
        <ul>
          <li><a href="../privacy.html">${esc(d.footer.privacy)}</a></li>
          <li><a href="../terms.html">${esc(d.footer.terms)}</a></li>
          <li><button type="button" class="linklike" data-consent-reset>${esc(d.footer.cookies)}</button></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>${esc(d.footer.contact)}</h4>
        <ul>
          <li><a href="mailto:support@mxcode.com">support@mxcode.com</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; <span id="year">2026</span> AdFence. ${esc(d.footer.rights)}</span>
      <span>${esc(d.footer.made)}</span>
    </div>
  </div>
</footer>

<script src="../js/main.js"></script>
</body>
</html>
`;
}

/* --- run ------------------------------------------------------------------ */

const dir = path.join(__dirname, 'i18n');
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); });
let written = 0;

files.forEach(function (file) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (!d.slug) throw new Error(file + ': missing "slug"');
  if (d.slug !== file.replace(/\.json$/, '')) {
    throw new Error(file + ': "slug" must match the file name');
  }
  if (d.features.items.length !== 15) throw new Error(file + ': expected 15 feature items');
  if (d.features.extras.length !== 4) throw new Error(file + ': expected 4 extra cards');
  if (d.shots.items.length !== 4) throw new Error(file + ': expected 4 screenshots');
  if (d.setup.steps.length !== 3) throw new Error(file + ': expected 3 setup steps');
  if (d.privacy.rows.length !== 5) throw new Error(file + ': expected 5 privacy rows');
  if (d.faq.items.length !== 6) throw new Error(file + ': expected 6 FAQ items');

  const out = path.join(ROOT, d.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(d));
  written++;
  console.log('wrote ' + path.relative(ROOT, out));
});

if (!written) console.log('nothing to build — no JSON in tools/i18n/');
