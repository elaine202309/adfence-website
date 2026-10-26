# AdFence — marketing website

Static marketing site for the Safari ad blocker (iPhone / iPad / Mac).
No framework, no build step, no dependencies. Plain HTML + one stylesheet.

> **Name: AdFence**, settled 10 October 2026 after checking the App Store and the
> open web for conflicts. No same-name app, no same-name ad-blocking extension,
> no software trademark found. This is not a legal clearance — see the comment
> block at the top of `index.html` for the caveats and the one remaining
> pre-submission step.

---

## Files

```
index.html        The whole site — hero, feature grid, setup, privacy,
                  FAQ, download CTA
support.html      Setup steps for iOS and Mac, troubleshooting FAQ, contact
how-to-use.html   Step-by-step walkthrough of the app, one screenshot per step
privacy.html      Privacy policy — DRAFT, needs review
terms.html        Terms of use — DRAFT, needs review
css/style.css     All styling. Design tokens are the :root block at the top
js/main.js        Mobile nav toggle, FAQ accordion, footer year
images/logo.png   Source app icon, 1024×1024. Kept as the master file —
                  the pages do not reference it directly.
images/logo-mark.png  Transparent, trimmed 128×128 mark used in the header
                  and footer (rendered at 30px)
images/favicon.png    64×64 favicon, generated from the same mark
images/favicon.svg    Legacy red mark — no longer referenced
images/adfence-general-settings.png   Hero screenshot, 600×1301
images/adfence-other-settings.png     Gallery, 520×1127
images/adfence-site-settings.png      Gallery, 520×1127
images/adfence-custom-rules.png       Gallery, 520×1127
images/adfence-extension-status.png   Gallery, 520×1127
images/app-store-badge.svg  Apple's official "Download on the App Store" badge
                  (US-UK, black). Unmodified — do not recolour or redraw it.
images/source/    Full-resolution 1179×2556 originals (16-bit PNG) behind the
                  five screenshots above. Not referenced by any page — kept so
                  the web copies can be regenerated or reused for App Store art.
robots.txt
sitemap.xml
app-store-listing.md  App Store Connect copy (name, subtitle, keywords,
                  description) and the claims that must match the build.
app-store-localizations.md  The same promotional text, keywords and
                  description in the nine App Store Connect languages.
```

App Store listing: <https://apps.apple.com/us/app/adfence-safari-ad-blocker/id6825119569>
(App ID 6825119569). Every download CTA on the site points at it.

There is no pricing page. Pricing is deliberately not published on the site —
the App Store listing carries whatever applies.

## Local preview

There is no Python on this machine, so use Node (v24 is installed):

```bash
cd /c/Users/elain/adblock-safari-website
npx --yes serve . -l 8099     # then open http://localhost:8099
```

Or, with no download, a throwaway static server:

```bash
cd /c/Users/elain/adblock-safari-website
node -e "const h=require('http'),f=require('fs'),p=require('path'),r=process.cwd(),t={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};h.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';f.readFile(p.join(r,u),(e,b)=>{e?(s.writeHead(404),s.end('404')):(s.writeHead(200,{'Content-Type':t[p.extname(u)]||'application/octet-stream'}),s.end(b))})}).listen(8099)"
```

Use a server rather than opening the files directly — the mobile nav needs a
real origin to behave the way it does in production.

## Renaming (if you change your mind)

The name was settled as **AdFence** on 10 October 2026 — see the comment block at
the top of `index.html` for what was and wasn't checked. If you ever swap it
again, everything is relative-path based, so the only work is a find-and-replace:

```bash
grep -rl 'AdFence' . --exclude-dir=.git | xargs sed -i 's/AdFence/YourName/g'
```

Then fix by hand, because word order varies:

- Every `<title>` and `og:title` — e.g. `AdFence — Safari Ad Blocker on iPhone, iPad &amp; Mac`
- The `"name"` field in the JSON-LD block in `index.html`
- `<meta property="og:site_name">` if you add one

If the new name has a different first letter, check the brand mark: it's an
inline SVG shield, not a letterform, so it survives renaming unchanged.

## Before launch — checklist

These are the things that are deliberately unfinished or unverified. Nothing
below should reach a live site without being dealt with.

**Placeholders to replace**

- [x] `support@mxcode.com` — set on all four pages and every `mailto:` CTA
      (24 October 2026). Make sure the mailbox actually exists before launch.
- [x] Canonical URLs, `og:url`, `og:image`, the JSON-LD `url`, `sitemap.xml`,
      `robots.txt` and the App Store Connect URLs in `app-store-listing.md` all
      point at **`https://adfence.mxcode.com/`** (set 24 October 2026, with the
      `CNAME` file that GitHub Pages wrote). If the domain ever changes, replace
      that string everywhere — `grep -rl 'adfence.mxcode.com' .` — and update
      `CNAME`.
      The earlier candidates are moot now: `adfence.com` is registered (since
      2005) and `.io` / `.net` are taken, while `adfence.app`, `adfence.co`,
      `adfence.dev` and `getadfence.com` were unregistered as of 21 October
      2026. `adfence.mxcode.com` ties the site to the existing `mxcode.com`
      domain that already carries `support@mxcode.com`, at no extra cost.
- [ ] `images/og-card.png` — referenced in `index.html` but **does not exist yet**.
      Create a 1200×630 social card.
- [ ] GA4 — snippet is commented out at the top of `index.html`. Set your
      measurement ID and uncomment. Consider adding it to the other pages too.
- [ ] Add a `CNAME` file if you bind a custom domain.

**Claims that must match the app**

Every statement below is written from what you told me the app does. Verify each
one against the shipping build before publishing — an inaccurate privacy policy
is both a legal problem and an App Store rejection risk.

- [ ] **The feature list on the homepage.** A 15-item category grid ("What it
      does") plus 4 cards under "Also built in" cover all 19 switches modelled
      on AdBlock Pro's settings screen. The full set is being implemented before
      launch, so the only check at submission time is that the shipping build
      actually has them all. Note that no default on/off state is stated
      anywhere on the page — keep it that way until the defaults are settled.
- [ ] *"No account", "no browsing history", "no data sent to a server"* —
      `index.html` privacy panel, `privacy.html`. True only if the extension is
      rules-only and the app ships no analytics or crash-reporting SDK. If you
      add Firebase, Sentry, TelemetryDeck or similar, both pages must change.
- [ ] *"Runs in Safari only"* / *"can't reach in-app browsers"* — correct for a
      Safari content blocker; keep it, it's an honest differentiator.
- [ ] *"Filters ship with the app and update when the app updates"* —
      `support.html` troubleshooting. If filter lists update over the network
      instead, that's an outbound connection and the privacy page must say so.
- [ ] *iCloud Backup* — `privacy.html` §3 says Apple may include app data in a
      device backup if the user has iCloud Backup on. That is true for any app,
      so it holds whether or not AdFence syncs settings itself. If you add
      deliberate cross-device sync, say so explicitly instead.
- [ ] *Adult filter has no passcode* — stated on the homepage and in `terms.html`.
      Keep this: it protects you from "it doesn't work as parental control"
      reviews and it's the honest description.
- [x] `privacy.html` — rewritten as the formal policy on 24 October 2026: draft
      callout removed, effective date set, sections numbered, legal bases,
      retention, transfers, security and children added.
- [ ] `terms.html` still opens with a visible **"Draft — pending review"**
      callout. Remove it once reviewed. Search for `callout-warn`.
- [ ] `terms.html` has no governing-law jurisdiction yet. Add it.
- [ ] The App Store EULA question: either use Apple's standard EULA or supply a
      custom one in App Store Connect. If you use Apple's standard, delete
      `terms.html` and its footer link.

**Content that needs a decision**

- [ ] Pricing is intentionally absent from the site. When it is set, put it on
      the App Store listing rather than adding a page — that is the decision made
      on 22 October 2026.
- [ ] Screenshots. The hero and the "A look inside AdFence" gallery use real
      app screenshots. They were taken on a simulator and show a device status
      bar (time 10:42, battery 77%); retake them on a real device with a clean
      status bar before launch, and keep the same file names so the HTML does
      not need touching.
- [x] Download CTAs. The header button, hero, setup step, FAQ answer, closing
      band and every footer now link to the App Store listing, and the hero and
      closing band use Apple's official badge (`images/app-store-badge.svg`,
      downloaded unmodified from the App Store marketing tools).
- [ ] Check the listing link resolves publicly on launch day. As of 24 October
      2026 the public URL redirected to the storefront home and the iTunes
      lookup API returned no result for ID 6825119569, which is normal while the
      app is still in "Pending Developer Release" — but it means the link has
      not yet been seen working from outside App Store Connect.

## Deploying to GitHub Pages

Live at <https://adfence.mxcode.com/> — repo
<https://github.com/elaine202309/adfence-website>, Pages deploying from `main`,
root folder. Every push to `main` republishes the site in about a minute.

```bash
cd /c/Users/elain/adblock-safari-website
git add .
git commit -m "What changed"
git push
```

The repo is public, so the site is too — anything committed here is visible.

The custom domain lives in the `CNAME` file at the repo root
(`adfence.mxcode.com`). It is the authoritative source: deleting it unbinds the
domain. The `elaine202309.github.io/adfence-website` address keeps serving the
same content as a fallback, so links to either one work.

## Notes for future edits

- All paths are **relative**, not root-absolute. This is deliberate — it means
  the site works at a GitHub Pages project URL (`user.github.io/repo/`) and at a
  custom domain without changes. Don't reintroduce `/css/style.css` style paths.
- Design tokens live in the `:root` block of `css/style.css`. Change the accent
  colour in one place there rather than hunting through the pages.
- The FAQ accordion auto-closes other items (`js/main.js`). If you want several
  open at once, delete that block.
