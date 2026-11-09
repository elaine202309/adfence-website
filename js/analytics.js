/* ==========================================================================
   AdFence — analytics
   Google Analytics 4 (G-3GFDY4TL3R), loaded only after the visitor agrees.

   GA4 writes cookies, so on a first visit the page shows a one-line banner and
   nothing at all is requested from Google until "Accept" is pressed. The choice
   is kept in localStorage ('granted' / 'denied') and the banner never returns.

   To switch analytics off for good, delete the
   <script src="js/analytics.js" defer></script> line from the five pages —
   and section 5 of privacy.html with it.
   ========================================================================== */
(function () {
  'use strict';

  var ID = 'G-3GFDY4TL3R';
  var KEY = 'adfence:analytics';

  /* Pages in blog/ load this file as ../js/analytics.js, so the privacy link in
     the banner has to be worked out from where the script itself sits. */
  var base = '';
  var self = document.currentScript && document.currentScript.src;
  if (self) base = self.replace(/js\/analytics\.js.*$/, '');

  /* The nine localized homepages under /<lang>/ set <html lang> to their own
     language, so the banner speaks the same language as the page. %privacy% is
     replaced with the link to the (English) privacy policy. */
  var COPY = {
    en: {
      label: 'Analytics cookies',
      text: 'We use Google Analytics to count visits and see which pages are read. No ads, no cross-site tracking. <a href="%privacy%">Privacy Policy</a>',
      decline: 'Decline',
      accept: 'Accept'
    },
    'zh-Hans': {
      label: '分析 Cookie',
      text: '我们使用 Google Analytics 统计访问量，了解哪些页面被阅读。没有广告，也没有跨站追踪。<a href="%privacy%">隐私政策</a>',
      decline: '拒绝',
      accept: '接受'
    },
    'zh-Hant': {
      label: '分析 Cookie',
      text: '我們使用 Google Analytics 統計訪問量，了解哪些頁面被閱讀。沒有廣告，也沒有跨站追蹤。<a href="%privacy%">隱私政策</a>',
      decline: '拒絕',
      accept: '接受'
    },
    fr: {
      label: 'Cookies de mesure d\'audience',
      text: 'Nous utilisons Google Analytics pour compter les visites et savoir quelles pages sont lues. Aucune publicité, aucun suivi entre sites. <a href="%privacy%">Politique de confidentialité</a>',
      decline: 'Refuser',
      accept: 'Accepter'
    },
    de: {
      label: 'Analyse-Cookies',
      text: 'Wir nutzen Google Analytics, um Besuche zu zählen und zu sehen, welche Seiten gelesen werden. Keine Werbung, kein seitenübergreifendes Tracking. <a href="%privacy%">Datenschutzerklärung</a>',
      decline: 'Ablehnen',
      accept: 'Akzeptieren'
    },
    it: {
      label: 'Cookie analitici',
      text: 'Usiamo Google Analytics per contare le visite e vedere quali pagine vengono lette. Nessuna pubblicità, nessun tracciamento tra siti. <a href="%privacy%">Informativa sulla privacy</a>',
      decline: 'Rifiuta',
      accept: 'Accetta'
    },
    ja: {
      label: '分析 Cookie',
      text: 'アクセス数とよく読まれるページを把握するために Google Analytics を使用しています。広告やサイトをまたぐ追跡はありません。<a href="%privacy%">プライバシーポリシー</a>',
      decline: '拒否',
      accept: '同意する'
    },
    ko: {
      label: '분석 쿠키',
      text: '방문 수와 어떤 페이지가 읽히는지 파악하기 위해 Google Analytics를 사용합니다. 광고나 교차 사이트 추적은 없습니다. <a href="%privacy%">개인정보 처리방침</a>',
      decline: '거부',
      accept: '동의'
    },
    'pt-PT': {
      label: 'Cookies de análise',
      text: 'Usamos o Google Analytics para contar visitas e ver que páginas são lidas. Sem publicidade e sem rastreio entre sites. <a href="%privacy%">Política de Privacidade</a>',
      decline: 'Recusar',
      accept: 'Aceitar'
    },
    'es-ES': {
      label: 'Cookies analíticas',
      text: 'Usamos Google Analytics para contar las visitas y ver qué páginas se leen. Sin publicidad ni seguimiento entre sitios. <a href="%privacy%">Política de Privacidad</a>',
      decline: 'Rechazar',
      accept: 'Aceptar'
    }
  };

  var copy = COPY[document.documentElement.getAttribute('lang')] || COPY.en;

  var choice = null;
  try {
    choice = window.localStorage.getItem(KEY);
  } catch (e) {
    /* Storage can be blocked; then the banner simply shows every time. */
  }

  function loadAnalytics() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID);
  }

  function remember(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (e) {
      /* Nothing to do — the choice just won't survive the visit. */
    }
  }

  function showBanner() {
    var box = document.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', copy.label);

    box.innerHTML =
      '<p>' + copy.text.replace('%privacy%', base + 'privacy.html') + '</p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-consent="denied">' + copy.decline + '</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-consent="granted">' + copy.accept + '</button>' +
      '</div>';

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      var value = btn.getAttribute('data-consent');
      remember(value);
      box.remove();
      if (value === 'granted') loadAnalytics();
    });

    document.body.appendChild(box);
  }

  /* "Cookie settings" in the footer withdraws the choice and asks again. The
     page reloads so a granted gtag.js tag is properly dropped. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-consent-reset]')) return;
    e.preventDefault();
    try {
      window.localStorage.removeItem(KEY);
    } catch (err) {
      /* Storage blocked — reloading on its own won't help, but harmless. */
    }
    window.location.reload();
  });

  if (choice === 'granted') {
    loadAnalytics();
  } else if (choice !== 'denied') {
    showBanner();
  }
})();
