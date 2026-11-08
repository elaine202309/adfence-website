# AdFence — App Store listing copy

App ID **6825119569** —
<https://apps.apple.com/us/app/adfence-safari-ad-blocker/id6825119569>

English (U.S.) primary language. Field limits are Apple's; the counts below were
measured on the text as written, including punctuation and spaces.

- **Name** — 30 characters max
- **Subtitle** — 30
- **Keywords** — 100 (comma-separated, no spaces after commas)
- **Promotional text** — 170
- **Description** — 4000

Nothing here mentions price, a free tier or a trial — pricing is still undecided
and, when it is set, it belongs in App Store Connect's pricing, not in this copy.
Nothing here claims a default on/off state for any filter.

---

## Name — 30 / 30

```
AdFence - Ad & Tracker Blocker
```

The field is full, so "Safari" cannot live here. That is deliberate: the
subtitle and the keyword field both carry it, and every page title on the
website says "Safari" too.

Changing the name does **not** change the listing URL — the
`adfence-safari-ad-blocker` slug was fixed when the app was created, so every
download button on the site keeps working. App Store Connect stores the name per
language: set it on the primary language and, if any localized names are filled
in, make them identical (see `app-store-localizations.md`).

## Subtitle — 28 / 30

```
Safari ad blocker for iPhone
```

This is where "Safari" earns its index slot: "Safari ad blocker" is the phrase
people actually type, and the name no longer contains it. iPhone goes here
rather than iPad or Mac because it is the highest-volume platform query; iPad
and Mac are in the keyword field.

Alternatives, all under 30:

- `Safari ad blocker & cookies` (27) — swaps the platform for the second
  selling point. Only if iPhone is already well covered elsewhere.
- `Safari & tracker blocker` (24) — closest to the new name, leaves six
  characters unused.

## Keywords — 100 / 100

```
safari,popup,block,cookie,adult,porn,malware,phishing,privacy,tracking,iphone,ipad,mac,extension,ads
```

The name now carries *ad*, *tracker* and *blocker*, and the subtitle carries
*safari*, *ad*, *blocker* and *iphone*, so this field spends its slots on what
neither of them says. Single words, one per slot — Apple splits the field on
commas and combines the words with each other, so `cookie` + the name's
"Blocker" matches "cookie blocker" without spelling the phrase out.

`safari` is kept in the field even though the subtitle already has it. Six
characters is cheap insurance: if you ever rewrite the subtitle, the word that
matters most to this product stays indexed.

`popup` is written without the hyphen on purpose: “pop-up” tokenises as *pop* +
*up*, which doesn't catch people typing “popup blocker”. `adblock` is
deliberately absent — ADBLOCK is a registered mark enforced by Ad-IP / eyeo, and
the keyword field is not worth the risk.

Alternatives:

- `safari,popup,block,cookie,adult,porn,malware,phishing,privacy,tracking,iphone,ipad,mac,content,ads` (98) — swaps `extension` for `content`. Use it if you would rather catch "content blocker" than "Safari extension" searches; `extension` is the better bet today because the setup step is literally called Extensions.
- `safari,popup,cookie,adult,porn,malware,phishing,privacy,iphone,ipad,mac` (71) — the bare core, no filler.

## Promotional text — 164 / 170

```
Ad and tracker blocker for Safari on iPhone, iPad and Mac. Block ads, pop-ups and trackers, hide cookie banners, filter adult sites — per-site controls, no account.
```

Worth knowing: promotional text is **not indexed for App Store search** — Apple's
own guidance says it doesn't affect ranking and shouldn't be used to display
keywords. So the search terms here are for the people reading the product page,
not for the algorithm; ranking comes from name + subtitle + keywords. Keep them
woven into sentences like this rather than pasted as a list.

This field is also the only one you can change without a new build or review,
so it is the right place for launch news ("Now on the App Store"), a feature
spotlight, or a seasonal line once the generic copy has done its job.

## Description — 2900 / 4000

```
AdFence is an ad and tracker blocker for Safari on iPhone, iPad and Mac. It blocks ads and tracking scripts, hides cookie prompts and pop-ups, and keeps adult sites and known malware out of Safari — with no account and no browsing history to log into.

A QUIETER WEB
• Block Ads — display, pop-up and video ads, and the empty boxes they leave behind
• Block Trackers — analytics and behavioural scripts
• Hide Cookie Notices — consent dialogs disappear instead of following you around
• Block Pop-ups — newsletter, promo and floating overlays
• Hide App Banners — sticky “open in app” bars
• Hide Comments — comment sections on articles
• Block Social Buttons — share buttons and their tracking pixels
• Block Miners — cryptocurrency scripts that drain your battery
• Hide Distractions — chat bubbles, widgets and other clutter
• Block Custom Web Fonts and images — lighter pages on slow connections
• Disable Scripts — JavaScript off
• Force HTTPS — upgrade connections where the site allows it

SAFETY
• Safe Browsing blocks known malware and phishing domains before the page loads
• Block Adult Sites adds an optional adult-domain filter

PER-SITE CONTROL
Not every site deserves the same treatment.
• Block a whole website
• Pause blocking on one site while it stays on everywhere else
• Override a single filter for one site — ads, trackers, unsafe browsing, social buttons or cookie notices
• Add your own custom hiding rules for sites you know

WHEN A SITE FIGHTS BACK
Bypass Anti-Adblock gets past pages that detect a blocker, and can hide the “please turn off your ad blocker” wall they put in the way.

KNOW IT'S ON
Safari can have an extension installed but switched off, and nothing on the page tells you. The plugin status screen reads Safari's own extension settings and shows whether each AdFence extension is active — Ads, Privacy, Social, Safety, Others, Custom, Video and Adult.

PRIVATE BY DESIGN
No account. No sign-in. No dashboard of pages you've read, because AdFence doesn't record them. Blocking is carried out by Safari from a rule list, so the app never needs to look at what you're reading or send it anywhere. Filter lists update in the background so new domains get covered without you doing anything.

WORKS IN SAFARI
AdFence is a Safari extension, so it works in Safari on iPhone, iPad and Mac. It can't reach the in-app browser inside other apps such as Instagram or Facebook: Apple sandboxes extensions, and no Safari ad blocker can. It's the same limit every Safari ad blocker has — and it's what keeps AdFence from seeing your browsing.

SETUP TAKES A MINUTE
1. Install AdFence.
2. Open Settings → Safari → Extensions and turn AdFence on. On a Mac, do it in Safari's settings.
3. Browse.

AdFence — the web, without the noise.

Privacy: https://adfence.mxcode.com/privacy.html
Terms and Conditions: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

## What's New (version 1.0) — 162 / 4000

```
First release. Ad and tracker blocking, cookie and pop-up hiding, adult-site filtering, per-site controls and custom rules, now in Safari on iPhone, iPad and Mac.
```

---

## Other App Store Connect fields

| Field | Value |
| --- | --- |
| Support URL | `https://adfence.mxcode.com/support.html` |
| Marketing URL | `https://adfence.mxcode.com/` |
| Privacy Policy URL | `https://adfence.mxcode.com/privacy.html` |

These are the live GitHub Pages URLs as of 24 October 2026. If you bind a
custom domain, update all three in App Store Connect — Apple will reject a
privacy policy URL that doesn't load.
| Primary category | Utilities |
| Secondary category | Productivity |
| Age rating | 4+ — the app blocks adult sites rather than showing any adult content |

## Claims to re-check before you submit

These sentences describe behaviour the shipping build must actually have:

- Filter lists updating **in the background** — if updates only ship with app
  releases, delete that sentence (the support page already says lists update
  with the app, which contradicts it).
- **"display, pop-up and video ads"** — video ads are the least certain of the
  three; drop the word if the rule list can't take them out.
- **"Block Custom Web Fonts and images"** — keep only if both switches ship.
- The plugin status screen lists eight extensions (Ads, Privacy, Social,
  Safety, Others, Custom, Video, Adult). If the build ships a different number,
  the sentence has to change.

## Not included on purpose

- No "Safari" in the **name field** — it is full at 30 characters. Safari is
  the first word of the subtitle and the first keyword instead.
- No price, subscription, free-trial or "free" wording.
- No "on by default" or "off by default" anywhere.
- No competitor names and no claim that other browsers or apps are unsafe.
- No `adblock` token in the name, subtitle or keywords.
