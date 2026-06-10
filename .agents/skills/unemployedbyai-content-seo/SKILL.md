---
name: unemployedbyai-content-seo
description: Use when changing UnemployedByAI.lol satire copy, job profiles, profession suggestions, SEO metadata, Open Graph images, robots.txt, sitemap.xml, social sharing text, or public page content.
---

# UnemployedByAI Content And SEO Skill

## When To Use

Use this skill for jokes, profession categories, loading phrases, result text, gallery cards, static page copy, metadata, Open Graph/Twitter snippets, sitemap, robots, and share text.

## Voice

- Satirical, absurd, corporate-dystopian, and playful.
- Funny without pretending to be a real employment-risk model.
- Punchy over verbose.
- Avoid cruelty toward real people, protected classes, or vulnerable job loss situations.

## Key Files

- `src/data.js`
- `src/main.js`
- `index.html`
- `about.html`
- `contact.html`
- `privacy.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/og-image.png`
- `public/og-image.svg`

## Content Rules

- Keep `siteUrl` in `src/data.js` aligned with canonical URLs and metadata.
- Add profession-specific copy in `jobProfiles` when a job needs distinct behavior.
- Keep loading phrases short enough to read during the fake analysis sequence.
- Keep share text concise and safe for X, LinkedIn, and WhatsApp.
- Update sitemap and metadata when public routes or canonical URLs change.
- Keep legal/privacy pages plain and clear, not joke-heavy.

## Validation

```bash
npm run build
```
