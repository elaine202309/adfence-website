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
    box.setAttribute('aria-label', 'Analytics cookies');

    box.innerHTML =
      '<p>We use Google Analytics to count visits and see which pages are read. ' +
      'No ads, no cross-site tracking. <a href="privacy.html">Privacy Policy</a></p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-consent="denied">Decline</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-consent="granted">Accept</button>' +
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
