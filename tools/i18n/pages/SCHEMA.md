# Schema for the translated functional pages

`tools/build-i18n.js` builds four pages per language. The homepage copy lives in
`tools/i18n/<slug>.json`; the copy for `how-to-use.html`, `support.html` and
`blog.html` lives in `tools/i18n/pages/<slug>.json` and must have exactly this
shape. Every string is shown to a visitor, so nothing here is optional.

```json
{
  "lang": "es-ES",
  "slug": "es",

  "howto": {
    "meta": { "title": "", "desc": "", "ogTitle": "", "crumb": "" },
    "intro": { "eyebrow": "", "h1": "", "lead": "" },
    "steps": [
      {
        "eyebrow": "Paso 1",
        "h2": "",
        "blocks": [
          { "t": "p",  "html": "" },
          { "t": "h3", "html": "" },
          { "t": "ol", "items": ["", "", ""] },
          { "t": "ul", "items": ["", ""] }
        ],
        "shot": { "alt": "", "capStrong": "", "cap": "" }
      }
    ],
    "fixes": {
      "eyebrow": "",
      "h2": "",
      "items": [ { "h3": "", "p": "", "more": "" } ]
    }
  },

  "support": {
    "meta": { "title": "", "desc": "", "ogTitle": "", "crumb": "" },
    "intro": { "eyebrow": "", "h1": "", "lead": "" },
    "setup": {
      "h2": "",
      "lead": "",
      "cards": [ { "h3": "", "items": ["", "", "", "", ""] } ]
    },
    "trouble": {
      "h2": "",
      "items": [ { "q": "", "a": "" } ]
    },
    "contact": { "eyebrow": "", "h2": "", "lead": "", "button": "" }
  },

  "blog": {
    "meta": { "title": "", "desc": "", "ogTitle": "", "crumb": "", "jsonName": "", "jsonDesc": "" },
    "intro": { "eyebrow": "", "h1": "", "lead": "", "ghost": "" },
    "post": { "tag": "", "date": "", "readTime": "", "more": "" }
  }
}
```

## Rules

- **Array lengths are checked by the build and must match**: `howto.steps` = 5,
  `howto.fixes.items` = 3, `support.setup.cards` = 2, each with 5 `items`,
  `support.trouble.items` = 5.
- `blocks` may contain any mix of `p`, `h3`, `ol`, `ul`. Keep the same blocks,
  in the same order, as the English page — the template does not reorder them.
- These fields are inserted **as raw HTML**, so `<strong>` and `<a href="…">`
  survive: `howto.steps[].blocks[].html`, `howto.steps[].blocks[].items`,
  `howto.fixes.items[].p`, `support.setup.lead`, `support.setup.cards[].items`,
  `support.trouble.items[].a`. Use only `<strong>`, `<em>` and `<a>`; escape a
  literal `&` as `&amp;`. `support.setup.lead` **must** keep the App Store
  link the English page has.
- Every other field is plain text and is escaped by the template: no markup,
  no bare `&`.
- Inline links in raw HTML must point at the localized pages:
  - another localized page → its file name only, e.g. `href="support.html"`
  - the App Store → `https://apps.apple.com/us/app/adfence-safari-ad-blocker/id6825119569`
  - privacy policy → `href="../privacy.html"` (stays English)
  Never use root-absolute paths.
- Plain-text fields (`meta.title`, `h2`, `lead`, `q`, `a` of `support.trouble`
  is raw HTML — see below) are escaped by the template: write them as plain
  text, no markup.
- `support.trouble.items[].a` is raw HTML: an answer paragraph, plus a `<ul>`
  where the English one has one.
- The blog index links to an English article. **Do not translate the article
  title or its excerpt** — the template carries the English headline. Translate
  only `tag`, `date` (localized date, e.g. `8 novembre 2026`), `readTime`
  (e.g. `7 min de lecture`) and `more` (the "Read the guide →" label).
- Keep **Safari**, **iPhone**, **iPad**, **Mac**, **iOS**, **iPadOS**,
  **macOS**, **AdFence**, **App Store**, **Google Analytics**, **YouTube**,
  **CSS** and the in-app extension names (Ads, Privacy, Social, Safety, Others,
  Custom, Video, Adult) in Latin script — they are hard-coded in the build and
  in the app.
- UI labels quoted from Apple's Settings app should match the wording Apple
  ships in that language, e.g. Spanish *Ajustes → Safari → Extensiones*,
  French *Réglages → Safari → Extensions*, Japanese *設定 → Safari → 機能拡張*.
- Match the terminology already used in the same language's homepage file
  (`tools/i18n/<slug>.json`) — the nav labels, the CTA wording and the
  footer all come from there.
