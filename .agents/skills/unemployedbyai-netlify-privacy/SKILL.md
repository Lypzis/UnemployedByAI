---
name: unemployedbyai-netlify-privacy
description: Use when working on UnemployedByAI.lol Netlify deployment, static routing, headers, privacy policy, ads.txt, analytics, cookies, tracking, or environment/secrets hygiene.
---

# UnemployedByAI Netlify And Privacy Skill

## When To Use

Use this skill for Netlify config, static deployment, redirects, headers, build settings, `ads.txt`, analytics, privacy copy, tracking/cookie changes, and secrets hygiene.

## Key Files

- `netlify.toml`
- `package.json`
- `vite.config.js`
- `privacy.html`
- `public/ads.txt`
- `public/robots.txt`
- `public/sitemap.xml`
- `.gitignore`

## Deployment Rules

- Netlify build command: `npm run build`.
- Publish directory: `dist`.
- Keep clean route rewrites for `/about`, `/contact`, and `/privacy`.
- Keep security headers simple and static-hosting friendly.
- Do not add deploy tokens, analytics secrets, or ad account IDs to committed files unless they are meant to be public, such as an official `ads.txt` publisher line.
- GitHub Actions should validate only: `npm test --if-present` and `npm run build`.
- Netlify owns deployment, so do not add GitHub deploy tokens or duplicate production deploy workflows while Netlify auto-deploy is enabled.

## Privacy Rules

- The current privacy position is that profession input is processed locally in the browser and not sent to this site's server.
- Update `privacy.html` before adding analytics, ads, tracking pixels, forms, cookies, or third-party scripts.
- If AdSense is added, update both `privacy.html` and `public/ads.txt` with the provider/publisher details.

## Validation

```bash
npm run build
```
