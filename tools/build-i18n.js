#!/usr/bin/env node
/* ==========================================================================
   Builds the localized pages — /zh-hans/, /fr/, /ja/ … — from the JSON in
   tools/i18n/.

     node tools/build-i18n.js

   Four pages per language:

     <slug>/index.html        copy from tools/i18n/<slug>.json
     <slug>/how-to-use.html   copy from tools/i18n/pages/<slug>.json
     <slug>/support.html
     <slug>/blog.html

   The output is committed, so the site still needs no build step to serve.
   This script exists only so the pages stay structurally identical and a
   missing string fails loudly instead of silently shipping English.

   The English pages are NOT generated from here: they carry hand-written
   comments and copy that should stay hand-edited. When their structure
   changes, mirror the change in the templates below.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://adfence.mxcode.com';
const STORE = 'https://apps.apple.com/us/app/adfence-safari-ad-blocker/id6825119569';
const CSS_VERSION = 10;
const GSC = 'CRHi3cdgHMZ8cqNCuEHcq3Tx8T6GM1eVscF2Gkbzag0';

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

/* The pages that exist in every language, in menu order. */
const LOCALIZED_PAGES = ['index.html', 'how-to-use.html', 'support.html', 'blog.html'];

const urlFor = (slug, page) =>
  SITE + '/' + (slug ? slug + '/' : '') + (page === 'index.html' ? '' : page);

/* Where the same page lives in another language, seen from <slug>/. */
function langHref(targetSlug, page) {
  const file = page === 'index.html' ? '' : page;
  return targetSlug === '' ? '../' + file : '../' + targetSlug + '/' + file;
}

function esc(s) {
  return String(s)
    .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* The App Store link. Apple's badge artwork can't be recoloured, so the site
   uses a button of its own in brand violet instead — same target, same
   label, no Apple asset. */
function storeButton(label, indent) {
  const pad = indent || '';
  return `<a class="btn-store" href="${STORE}" target="_blank" rel="noopener">
${pad}  <svg class="store-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v11m0 0 4-4m-4 4-4-4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 16.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
${pad}  <span>${esc(label)}</span>
${pad}</a>`;
}

/* Raw HTML -> plain text, for the FAQPage entries that have to agree with a
   visible answer written as markup. */
function plain(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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

/* One figure per how-to step, in step order. The first sits on a plain canvas. */
const HOWTO_SHOTS = [
  { src: 'adfence-safari-extensions.png', w: 880, h: 1783, plain: true },
  { src: 'adfence-general-settings.png', w: 600, h: 1301, plain: false },
  { src: 'adfence-other-settings.png', w: 520, h: 1127, plain: false },
  { src: 'adfence-site-settings.png', w: 520, h: 1127, plain: false },
  { src: 'adfence-custom-rules.png', w: 520, h: 1127, plain: false }
];

/* The blog index points at English articles, so titles and excerpts stay in
   English on every localized page. Only the meta line is translated, which is
   why each language file carries one `blog.posts[]` entry per post below —
   same order, same length. Add a post here and to all nine files together;
   checkPages() throws if the counts disagree. */
const POSTS = [
  {
    slug: 'how-to-block-popup-ads-on-iphone-safari',
    url: 'blog/how-to-block-popup-ads-on-iphone-safari.html',
    title: 'How to block pop-up ads on iPhone Safari',
    excerpt: '“Pop-up ad” is three different things on an iPhone, and only one of them is a ' +
      'window. Safari’s own blocker closes the windows; the boxes drawn inside the page need a ' +
      'content blocker — and a few of them nothing can reach.',
    date: '2026-11-11'
  },
  {
    slug: 'why-safari-ad-blocker-not-working',
    url: 'blog/why-safari-ad-blocker-not-working.html',
    title: 'Why your Safari ad blocker isn’t working — and the 30-second fix',
    excerpt: 'Nine times out of ten the app is doing its job and Safari has quietly switched ' +
      'the extension off. Here is how to check it in half a minute on iPhone, iPad and Mac, and ' +
      'what to look at if that isn’t it.',
    date: '2026-11-08'
  }
];

const ORG_NODE = {
  '@type': 'Organization',
  '@id': SITE + '/#organization',
  name: 'AdFence',
  alternateName: 'AdFence - Ad & Tracker Blocker',
  url: SITE + '/',
  logo: { '@type': 'ImageObject', url: SITE + '/images/logo.png', width: 1024, height: 1024 },
  image: SITE + '/images/og-card.png',
  disambiguatingDescription: 'AdFence is a Safari ad and tracker blocker for iPhone, iPad and macOS, published on the Apple App Store under App ID 6825119569. In this context the name refers only to this app.',
  email: 'support@mxcode.com',
  sameAs: [STORE]
};

function svg(inner) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
         'stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}

/* --- shared chrome -------------------------------------------------------- */

/* `up` is the extra path back to the language directory — '' for <slug>/x.html,
   '../' for the blog posts in <slug>/blog/x.html. */
function languageMenu(slug, page, up) {
  up = up || '';
  const items = LANGS.map(function (l) {
    const current = l.slug === slug ? ' aria-current="page"' : '';
    return '          <li><a href="' + up + langHref(l.slug, page) + '" hreflang="' + l.code +
           '" lang="' + l.code + '"' + current + '>' + esc(l.label) + '</a></li>';
  }).join('\n');

  const here = LANGS.find(function (l) { return l.slug === slug; });

  return '<details class="lang">\n' +
    '        <summary aria-label="' + esc(here.label) + '">' + esc(here.short) + '</summary>\n' +
    '        <ul>\n' + items + '\n        </ul>\n' +
    '      </details>';
}

function alternates(page) {
  const rows = LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l.code + '" href="' + urlFor(l.slug, page) + '">';
  });
  rows.push('<link rel="alternate" hreflang="x-default" href="' + urlFor('', page) + '">');
  return rows.join('\n');
}

function ogAlternates(slug) {
  return LANGS.filter(function (l) { return l.slug !== slug; })
    .map(function (l) { return '<meta property="og:locale:alternate" content="' + l.og + '">'; })
    .join('\n');
}

function head(o) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Generated by tools/build-i18n.js from ${o.source} — edit that file and
     re-run the script rather than editing this page by hand. -->

<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${o.url}">
${alternates(o.page)}
<meta name="theme-color" content="#4b34b8">

<script type="application/ld+json">
${o.jsonld}
</script>

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(o.ogTitle)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${o.url}">
<meta property="og:site_name" content="AdFence">
<meta property="og:locale" content="${o.og}">
${ogAlternates(o.slug)}
<meta property="og:image" content="${SITE}/images/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(o.imgAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.ogTitle)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${SITE}/images/og-card.png">
${o.articleMeta ? o.articleMeta + '\n' : ''}
<link rel="icon" href="${o.up || ''}../images/favicon.png" type="image/png">
<link rel="stylesheet" href="${o.up || ''}../css/style.css?v=${CSS_VERSION}">

<!-- GA4 (G-3GFDY4TL3R), loaded after the visitor accepts. See js/analytics.js. -->
<script src="${o.up || ''}../js/analytics.js" defer></script>

<!-- Google Search Console — URL-prefix property for https://adfence.mxcode.com/ -->
<meta name="google-site-verification" content="${GSC}">
</head>`;
}

function header(d, page, up) {
  up = up || '';
  const asset = up + '../';
  /* 'blog/x.html' is a post, so the Blog tab stays highlighted. */
  const active = function (p) {
    const on = p === page || (p === 'blog.html' && page.indexOf('blog/') === 0);
    return on ? ' class="active"' : '';
  };
  const navCta = page === 'support.html'
    ? '<a class="btn btn-primary btn-sm" href="#contact">' + esc(d.footer.contact) + '</a>'
    : '<a class="btn btn-primary btn-sm" href="' + STORE + '" target="_blank" rel="noopener">' +
      esc(d.nav.download) + '</a>';

  return `<header class="site-header">
  <div class="container">
    <nav class="nav" aria-label="Main">
      <a class="brand" href="${up}index.html">
        <img class="brand-mark" src="${asset}images/logo-mark.png" alt="" width="30" height="30">
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
          <a href="${up}index.html#features">${esc(d.nav.features)}</a>
          <a href="${up}how-to-use.html"${active('how-to-use.html')}>${esc(d.nav.howto)}</a>
          <a href="${up}support.html"${active('support.html')}>${esc(d.nav.support)}</a>
          <a href="${up}blog.html"${active('blog.html')}>${esc(d.nav.blog)}</a>
        </div>
        ${languageMenu(d.slug, page, up)}
        ${navCta}
      </div>
    </nav>
  </div>
</header>`;
}

/* Privacy and Terms are English-only, so they keep the parent-relative path. */
function footer(d, up) {
  up = up || '';
  const asset = up + '../';
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="${up}index.html">
          <img class="brand-mark" src="${asset}images/logo-mark.png" alt="" width="30" height="30">
          AdFence
        </a>
        <p>${esc(d.footer.tagline)}</p>
      </div>

      <div class="footer-col">
        <h4>${esc(d.footer.product)}</h4>
        <ul>
          <li><a href="${up}index.html#features">${esc(d.footer.features)}</a></li>
          <li><a href="${up}how-to-use.html">${esc(d.footer.howto)}</a></li>
          <li><a href="${up}support.html">${esc(d.footer.support)}</a></li>
          <li><a href="${up}blog.html">${esc(d.footer.blog)}</a></li>
          <li><a href="${STORE}" target="_blank" rel="noopener">${esc(d.footer.download)}</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>${esc(d.footer.legal)}</h4>
        <ul>
          <li><a href="${asset}privacy.html">${esc(d.footer.privacy)}</a></li>
          <li><a href="${asset}terms.html">${esc(d.footer.terms)}</a></li>
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

<script src="${asset}js/main.js"></script>`;
}

function doc(lang, page, body) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${body.head}
</head>
<body>

${body.header}

<main>

${body.main}

</main>

${footer(body.d, body.up)}
</body>
</html>
`;
}

function breadcrumb(page, crumbName) {
  return {
    '@type': 'BreadcrumbList',
    '@id': urlFor('', page) + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: crumbName, item: urlFor('', page) }
    ]
  };
}

/* --- homepage ------------------------------------------------------------- */

function homeStructuredData(d) {
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
    '@id': urlFor(d.slug, 'index.html') + '#faq',
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
    '@graph': [ORG_NODE, site, app, faq]
  }, null, 2);
}

function renderHome(d) {
  const me = LANGS.find(function (l) { return l.slug === d.slug; });

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

  const main = `  <!-- ======================= HERO ======================= -->
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
            ${storeButton(d.hero.badge, '            ')}
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
        <a href="how-to-use.html">${esc(d.setup.more)}</a>
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
        ${storeButton(d.cta.badge, '        ')}
      </div>
    </div>
  </section>`;

  return doc(me.code, 'index.html', {
    d: d,
    header: header(d, 'index.html'),
    head: head({
      source: 'tools/i18n/' + d.slug + '.json',
      page: 'index.html', slug: d.slug, og: me.og,
      title: d.title, desc: d.desc, ogTitle: d.ogTitle, imgAlt: d.imgAlt,
      url: urlFor(d.slug, 'index.html'),
      jsonld: homeStructuredData(d)
    }),
    main: main
  });
}

/* --- how to use ----------------------------------------------------------- */

function howtoStructuredData(d, p) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [ORG_NODE, breadcrumb('how-to-use.html', p.meta.crumb)]
  }, null, 2);
}

function renderHowTo(d, p) {
  const me = LANGS.find(function (l) { return l.slug === d.slug; });

  const rows = p.steps.map(function (s, i) {
    const f = HOWTO_SHOTS[i];
    const cls = 'split howto-row' + (i % 2 ? ' reverse' : '');
    const figCls = 'shot howto-shot' + (f.plain ? ' plain' : '');

    const blocks = s.blocks.map(function (b) {
      if (b.t === 'h3') return '            <h3>' + b.html + '</h3>';
      if (b.t === 'p') return '            <p>\n              ' + b.html + '\n            </p>';
      const tag = b.t; // ol | ul
      return '            <' + tag + '>\n' +
        b.items.map(function (li) { return '              <li>' + li + '</li>'; }).join('\n') +
        '\n            </' + tag + '>';
    }).join('\n');

    return `        <!-- STEP ${i + 1} -->
        <div class="${cls}">
          <div class="howto-copy">
            <span class="eyebrow">${esc(s.eyebrow)}</span>
            <h2>${esc(s.h2)}</h2>
${blocks}
          </div>
          <figure class="${figCls}">
            <div class="shot-screen">
              <img src="../images/${f.src}"
                   alt="${esc(s.shot.alt)}"
                   width="${f.w}" height="${f.h}" loading="lazy" decoding="async">
            </div>
            <figcaption>
              <strong>${esc(s.shot.capStrong)}</strong>
              ${esc(s.shot.cap)}
            </figcaption>
          </figure>
        </div>`;
  }).join('\n\n');

  const fixes = p.fixes.items.map(function (c) {
    return `        <div class="card">
          <h3>${esc(c.h3)}</h3>
          <p>${c.p}</p>
          <p><a href="support.html">${esc(c.more)}</a></p>
        </div>`;
  }).join('\n');

  const main = `  <!-- ======================= INTRO ======================= -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(p.intro.eyebrow)}</span>
        <h1>${esc(p.intro.h1)}</h1>
        <p>${esc(p.intro.lead)}</p>
      </div>
    </div>
  </section>

  <!-- ======================= STEPS ======================= -->
  <section class="section section-alt">
    <div class="container">
      <div class="howto-list">

${rows}

      </div>
    </div>
  </section>

  <!-- ======================= QUICK FIXES ======================= -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(p.fixes.eyebrow)}</span>
        <h2>${esc(p.fixes.h2)}</h2>
      </div>

      <div class="grid grid-3">
${fixes}
      </div>
    </div>
  </section>

  <!-- ======================= CTA ======================= -->
  <section class="section section-tight" id="get">
    <div class="container">
      <div class="cta-band">
        <h2>${esc(d.cta.title)}</h2>
        <p>${esc(d.cta.lead)}</p>
        ${storeButton(d.cta.badge, '        ')}
      </div>
    </div>
  </section>`;

  return doc(me.code, 'how-to-use.html', {
    d: d,
    header: header(d, 'how-to-use.html'),
    head: head({
      source: 'tools/i18n/pages/' + d.slug + '.json',
      page: 'how-to-use.html', slug: d.slug, og: me.og,
      title: p.meta.title, desc: p.meta.desc, ogTitle: p.meta.ogTitle,
      imgAlt: d.imgAlt, url: urlFor(d.slug, 'how-to-use.html'),
      jsonld: howtoStructuredData(d, p)
    }),
    main: main
  });
}

/* --- support -------------------------------------------------------------- */

const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18.5h2"/></svg>';
const MAC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="20" height="13" rx="2.5"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>';

function supportStructuredData(d, p) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      ORG_NODE,
      breadcrumb('support.html', p.meta.crumb),
      {
        '@type': 'FAQPage',
        '@id': urlFor(d.slug, 'support.html') + '#faq',
        inLanguage: d.lang,
        mainEntity: p.trouble.items.map(function (i) {
          return {
            '@type': 'Question',
            name: plain(i.q),
            acceptedAnswer: { '@type': 'Answer', text: plain(i.a) }
          };
        })
      }
    ]
  }, null, 2);
}

function renderSupport(d, p) {
  const me = LANGS.find(function (l) { return l.slug === d.slug; });
  const icons = [PHONE_ICON, MAC_ICON];

  const cards = p.setup.cards.map(function (c, i) {
    return `        <div class="card">
          <div class="card-icon">
            ${icons[i]}
          </div>
          <h3>${esc(c.h3)}</h3>
          <ol>
${c.items.map(function (li) { return '            <li>' + li + '</li>'; }).join('\n')}
          </ol>
        </div>`;
  }).join('\n\n');

  const faqs = p.trouble.items.map(function (item, i) {
    return '        <details' + (i === 0 ? ' open' : '') + '>\n' +
      '          <summary>' + esc(item.q) + '</summary>\n' +
      '          <div class="answer">\n' +
      '            ' + item.a + '\n' +
      '          </div>\n' +
      '        </details>';
  }).join('\n\n');

  const main = `  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(p.intro.eyebrow)}</span>
        <h1>${esc(p.intro.h1)}</h1>
        <p>${esc(p.intro.lead)}</p>
      </div>
    </div>
  </section>

  <!-- ---------------- SETUP ---------------- -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-head">
        <h2>${esc(p.setup.h2)}</h2>
        <p>${p.setup.lead}</p>
      </div>

      <div class="grid grid-2">
${cards}
      </div>
    </div>
  </section>

  <!-- ---------------- TROUBLESHOOTING ---------------- -->
  <section class="section">
    <div class="container container-narrow">
      <div class="section-head">
        <h2>${esc(p.trouble.h2)}</h2>
      </div>

      <div class="faq">
${faqs}
      </div>
    </div>
  </section>

  <!-- ---------------- CONTACT ---------------- -->
  <section class="section section-alt" id="contact">
    <div class="container container-narrow">
      <div class="section-head">
        <span class="eyebrow">${esc(p.contact.eyebrow)}</span>
        <h2>${esc(p.contact.h2)}</h2>
        <p>${esc(p.contact.lead)}</p>
      </div>

      <div class="panel center">
        <p style="margin-bottom:1.2em"><strong>support@mxcode.com</strong></p>
        <a class="btn btn-primary" href="mailto:support@mxcode.com?subject=AdFence%20support">${esc(p.contact.button)}</a>
      </div>
    </div>
  </section>`;

  return doc(me.code, 'support.html', {
    d: d,
    header: header(d, 'support.html'),
    head: head({
      source: 'tools/i18n/pages/' + d.slug + '.json',
      page: 'support.html', slug: d.slug, og: me.og,
      title: p.meta.title, desc: p.meta.desc, ogTitle: p.meta.ogTitle,
      imgAlt: d.imgAlt, url: urlFor(d.slug, 'support.html'),
      jsonld: supportStructuredData(d, p)
    }),
    main: main
  });
}

/* --- blog ----------------------------------------------------------------- */

function blogStructuredData(d, p) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      ORG_NODE,
      breadcrumb('blog.html', p.meta.crumb),
      {
        '@type': 'Blog',
        '@id': urlFor(d.slug, 'blog.html') + '#blog',
        name: p.meta.jsonName,
        description: p.meta.jsonDesc,
        url: urlFor(d.slug, 'blog.html'),
        inLanguage: d.lang,
        publisher: { '@id': SITE + '/#organization' },
        blogPost: POSTS.map(function (post) {
          return {
            '@type': 'BlogPosting',
            headline: postTitle(d.slug, post),
            url: postUrl(d.slug, post),
            datePublished: post.date,
            dateModified: post.date,
            description: postExcerpt(d.slug, post),
            author: { '@id': SITE + '/#organization' }
          };
        })
      }
    ]
  }, null, 2);
}

/* A translated article lives in tools/i18n/posts/<slug>.<lang>.json, with the
   article markup itself in the matching .article.html file. Both are optional:
   a post without them keeps its English title and text on the localized index. */
const POSTS_DIR = path.join(__dirname, 'i18n', 'posts');

function postJsonPath(lang, post) {
  return path.join(POSTS_DIR, post.slug + '.' + lang + '.json');
}

function postHtmlPath(lang, post) {
  return path.join(POSTS_DIR, post.slug + '.' + lang + '.article.html');
}

function localizedPost(lang, post) {
  const f = postJsonPath(lang, post);
  if (!lang || !fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function postTitle(lang, post) {
  const t = localizedPost(lang, post);
  return t ? t.headline : post.title;
}

function postExcerpt(lang, post) {
  const t = localizedPost(lang, post);
  return t ? t.teaser : post.excerpt;
}

/* From <lang>/blog.html a translated article is 'blog/x.html'; an untranslated
   one still lives in the English root, one directory up. */
function postHref(lang, post) {
  return localizedPost(lang, post) ? post.url : '../' + post.url;
}

function postUrl(lang, post) {
  return localizedPost(lang, post) ? urlFor(lang, post.url) : SITE + '/' + post.url;
}

/* Older posts go in the .post-grid under the feature card, newest first. A
   translated post uses its own headline and teaser; the rest stay English. */
function gridPosts(p, lang) {
  const rest = POSTS.slice(1);
  if (!rest.length) return '';
  const cards = rest.map(function (post, i) {
    const m = p.posts[i + 1];
    return `        <a class="card post-card" href="${postHref(lang, post)}">
          <span class="post-meta">${esc(m.date)} · ${esc(m.readTime)}</span>
          <h3>${esc(postTitle(lang, post))}</h3>
          <p>${esc(postExcerpt(lang, post))}</p>
          <span class="post-more">${esc(p.more)}</span>
        </a>`;
  }).join('\n');
  return `      <div class="post-grid">\n${cards}\n      </div>`;
}

function renderBlog(d, p) {
  const me = LANGS.find(function (l) { return l.slug === d.slug; });

  const main = `  <!-- ======================= INTRO ======================= -->
  <section class="section blog-intro">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(p.intro.eyebrow)}</span>
        <h1>${esc(p.intro.h1)}</h1>
        <p>
          ${esc(p.intro.lead)}
        </p>

        <!-- The download CTA has to be reachable without scrolling this page,
             not only at the bottom of it. -->
        <div class="btn-row center blog-cta">
          ${storeButton(d.cta.badge, '          ')}
          <a class="btn btn-ghost" href="how-to-use.html">${esc(p.intro.ghost)}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ======================= POSTS ======================= -->

  <section class="section section-alt">
    <div class="container">
      <div class="post-feature">
        <span class="post-meta"><span class="tag">${esc(p.posts[0].tag)}</span> · ${esc(p.posts[0].date)} · ${esc(p.posts[0].readTime)}</span>
        <h2>
          <a href="${postHref(d.slug, POSTS[0])}">
            ${esc(postTitle(d.slug, POSTS[0]))}
          </a>
        </h2>
        <p>
          ${esc(postExcerpt(d.slug, POSTS[0]))}
        </p>
        <a class="post-more" href="${postHref(d.slug, POSTS[0])}">${esc(p.more)}</a>
      </div>
${gridPosts(p, d.slug)}
    </div>
  </section>

  <!-- ======================= CTA ======================= -->
  <section class="section section-tight" id="get">
    <div class="container">
      <div class="cta-band">
        <h2>${esc(d.cta.title)}</h2>
        <p>${esc(d.cta.lead)}</p>
        ${storeButton(d.cta.badge, '        ')}
      </div>
    </div>
  </section>`;

  return doc(me.code, 'blog.html', {
    d: d,
    header: header(d, 'blog.html'),
    head: head({
      source: 'tools/i18n/pages/' + d.slug + '.json',
      page: 'blog.html', slug: d.slug, og: me.og,
      title: p.meta.title, desc: p.meta.desc, ogTitle: p.meta.ogTitle,
      imgAlt: d.imgAlt, url: urlFor(d.slug, 'blog.html'),
      jsonld: blogStructuredData(d, p)
    }),
    main: main
  });
}

/* --- localized articles ---------------------------------------------------- */

/* The FAQ entries are derived from the visible <details> blocks so the
   FAQPage JSON-LD can never drift from what the page says. */
function faqFromArticle(html) {
  const out = [];
  const re = /<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>[\s\S]*?<div class="answer">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({
      q: plain(m[1]).replace(/\s+/g, ' ').trim(),
      a: plain(m[2]).replace(/\s+/g, ' ').trim()
    });
  }
  return out;
}

function postStructuredData(lang, post, t, fragment) {
  const me = LANGS.find(function (l) { return l.slug === lang; });
  const url = urlFor(lang, post.url);
  const graph = [
    ORG_NODE,
    {
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: t.crumbBlog, item: urlFor(lang, 'blog.html') },
        { '@type': 'ListItem', position: 3, name: t.headline, item: url }
      ]
    },
    {
      '@type': 'BlogPosting',
      '@id': url + '#article',
      headline: t.headline,
      description: t.description,
      datePublished: post.date,
      dateModified: post.date,
      author: { '@id': SITE + '/#organization' },
      publisher: { '@id': SITE + '/#organization' },
      image: SITE + '/images/' + (t.image || 'adfence-other-settings.png'),
      inLanguage: me.code,
      articleSection: t.section,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }
    }
  ];

  const faq = faqFromArticle(fragment);
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': url + '#faq',
      mainEntity: faq.map(function (f) {
        return {
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        };
      })
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function renderPost(d, post, t, fragment) {
  const lang = d.slug;
  const me = LANGS.find(function (l) { return l.slug === lang; });
  const up = '../';
  const url = urlFor(lang, post.url);

  const body = fragment.replace('<!--PROMO-->', function () {
    return `        <aside class="article-promo">
          <p>${t.promo}</p>
${storeButton(d.cta.badge, '          ')}
        </aside>`;
  });

  const main = `  <!-- ======================= HEADER ======================= -->
  <section class="section section-tight article-intro">
    <div class="container">
      <div class="article-head">
        <span class="post-meta">${esc(t.metaLine)}</span>
        <h1>${esc(t.headline)}</h1>
        <p class="article-lede">
          ${esc(t.lede)}
        </p>
      </div>
    </div>
  </section>

  <!-- ======================= BODY ======================= -->
  <section class="section section-tight article-body">
    <div class="container">
      <article class="article">

${body}
      </article>

      <div class="article-foot">
        <span>${esc(t.written)}</span>
        <a href="../blog.html">${esc(t.allPosts)}</a>
      </div>
    </div>
  </section>

  <!-- ======================= CTA ======================= -->
  <section class="section section-tight" id="get">
    <div class="container">
      <div class="cta-band">
        <h2>${esc(d.cta.title)}</h2>
        <p>${esc(d.cta.lead)}</p>
        ${storeButton(d.cta.badge, '        ')}
      </div>
    </div>
  </section>`;

  const articleMeta = `<meta property="article:published_time" content="${post.date}">
<meta property="article:modified_time" content="${post.date}">
<meta property="article:section" content="${esc(t.section)}">`;

  return doc(me.code, post.url, {
    d: d,
    header: header(d, post.url, up),
    up: up,
    main: main,
    head: head({
      source: 'tools/i18n/posts/' + post.slug + '.' + lang + '.json',
      page: post.url,
      slug: lang,
      og: me.og,
      up: up,
      title: t.title,
      desc: t.description,
      ogTitle: t.headline,
      imgAlt: d.imgAlt,
      url: url,
      articleMeta: articleMeta,
      jsonld: postStructuredData(lang, post, t, fragment)
    })
  });
}

function checkPost(file, t) {
  ['title', 'headline', 'description', 'teaser', 'lede', 'metaLine', 'section',
   'written', 'allPosts', 'crumbBlog', 'promo'].forEach(function (k) {
    if (!t[k]) throw new Error(file + ': missing "' + k + '"');
  });
}

/* --- run ------------------------------------------------------------------ */

function checkHome(file, d) {
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
}

function checkPages(file, d) {
  if (!d.howto || !d.support || !d.blog) throw new Error(file + ': missing howto/support/blog');
  if (d.howto.steps.length !== 5) throw new Error(file + ': expected 5 how-to steps');
  if (d.howto.fixes.items.length !== 3) throw new Error(file + ': expected 3 quick fixes');
  if (d.support.setup.cards.length !== 2) throw new Error(file + ': expected 2 setup cards');
  d.support.setup.cards.forEach(function (c, i) {
    /* The iPhone card has six since iOS 18 moved Safari under Apps. */
    if (c.items.length !== (i === 0 ? 6 : 5)) {
      throw new Error(file + ': setup card ' + i + ' needs ' + (i === 0 ? 6 : 5) + ' items');
    }
  });
  if (d.support.trouble.items.length !== 5) throw new Error(file + ': expected 5 troubleshooting items');
  if (!d.blog.posts || d.blog.posts.length !== POSTS.length) {
    throw new Error(file + ': blog.posts needs one entry per POSTS item (' + POSTS.length + ')');
  }
  if (!d.blog.more) throw new Error(file + ': missing blog.more');
  d.blog.posts.forEach(function (post, i) {
    if (!post.date || !post.readTime) throw new Error(file + ': blog.posts[' + i + '] needs date and readTime');
  });
  if (!d.blog.posts[0].tag) throw new Error(file + ': blog.posts[0] needs the "tag" label');
}

const homeDir = path.join(__dirname, 'i18n');
const pagesDir = path.join(homeDir, 'pages');
let written = 0;

const homeFiles = fs.readdirSync(homeDir).filter(function (f) { return f.endsWith('.json'); });

homeFiles.forEach(function (file) {
  const d = JSON.parse(fs.readFileSync(path.join(homeDir, file), 'utf8'));
  checkHome(file, d);

  const legalPages = path.join(pagesDir, file);
  const p = fs.existsSync(legalPages)
    ? JSON.parse(fs.readFileSync(legalPages, 'utf8'))
    : null;

  const out = [
    { page: 'index.html', html: renderHome(d) }
  ];

  if (p) {
    checkPages(file, p);
    if (p.slug !== d.slug) throw new Error(file + ': pages file has a different slug');
    out.push({ page: 'how-to-use.html', html: renderHowTo(d, p.howto) });
    out.push({ page: 'support.html', html: renderSupport(d, p.support) });
    out.push({ page: 'blog.html', html: renderBlog(d, p.blog) });

    /* Translated articles, when this language has them. */
    POSTS.forEach(function (post) {
      const meta = postJsonPath(d.slug, post);
      if (!fs.existsSync(meta)) return;
      const t = JSON.parse(fs.readFileSync(meta, 'utf8'));
      checkPost(path.relative(ROOT, meta), t);

      const fragFile = postHtmlPath(d.slug, post);
      if (!fs.existsSync(fragFile)) {
        throw new Error(path.relative(ROOT, meta) + ': no matching .article.html');
      }
      const fragment = fs.readFileSync(fragFile, 'utf8');
      if (fragment.indexOf('<!--PROMO-->') === -1) {
        throw new Error(path.relative(ROOT, fragFile) + ': missing <!--PROMO-->');
      }
      out.push({ page: post.url, html: renderPost(d, post, t, fragment) });
    });
  } else {
    console.log('  !! no ' + path.relative(ROOT, legalPages) + ' — skipping how-to/support/blog for ' + d.slug);
  }

  out.forEach(function (o) {
    const target = path.join(ROOT, d.slug, o.page);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, o.html);
    written++;
    console.log('wrote ' + path.relative(ROOT, target));
  });
});

console.log('\n' + written + ' file(s) written.');
if (!written) console.log('nothing to build — no JSON in tools/i18n/');
