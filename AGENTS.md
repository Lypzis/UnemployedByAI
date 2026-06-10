# AGENTS.md

## Repository Expectations

- This is a small Vite-powered static website for `UnemployedByAI.lol`.
- Keep changes simple. Prefer vanilla JavaScript, plain HTML, and CSS over adding frameworks or build complexity.
- Use `rg` for searching and read the relevant HTML, `src/data.js`, `src/main.js`, and `src/style.css` before editing.
- Do not commit secrets, analytics tokens, ad publisher IDs, or provider credentials.
- Keep the site fast, static, funny, and easy to deploy on Netlify.
- When changing public routes, metadata, robots, sitemap, privacy language, or share URLs, update the matching static files.

## What Is UnemployedByAI.lol?

UnemployedByAI.lol is a satirical website that pretends to estimate whether AI is replacing the user's job.

The site is intentionally unserious. Users enter a profession, watch a fake analysis sequence, receive a ridiculous replacement result, and can share/copy the result. The "Jobs Already Taken" gallery includes a lightweight Robot Punch minigame for extra catharsis.

Do not turn the product into a serious career-risk assessment tool. The joke is the product.

## Project Shape

- `index.html`: main app shell, SEO metadata, and top navigation.
- `about.html`, `contact.html`, `privacy.html`: static support pages.
- `src/data.js`: professions, job profiles, loading jokes, result copy, gallery data, and share-site URL.
- `src/main.js`: app rendering, autocomplete, fake analysis flow, sharing, and Robot Punch minigame behavior.
- `src/style.css`: all styling and responsive behavior.
- `public/`: favicon, Open Graph image, robots, `robots.txt`, `sitemap.xml`, `ads.txt`.
- `vite.config.js`: multi-page Vite build inputs.
- `netlify.toml`: Netlify build, clean-route rewrites, and security/cache headers.

## Common Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## CI/CD

GitHub Actions validates changes only:

- `.github/workflows/ci.yml` runs on pull requests and pushes to `main`.
- It installs dependencies, runs `npm test --if-present`, and runs `npm run build`.

Netlify owns deployment:

- Netlify builds from `main` with `npm run build` and publishes `dist`.
- Do not add a GitHub Actions production deploy workflow while Netlify auto-deploy is enabled.
- Protect `main`, require pull requests, and require the `CI / Test And Build` status check before merge.
- Keep direct pushes to `main` disabled so Netlify does not deploy before CI passes.

## Important Rules

- Keep the app browser-only and static unless the user explicitly asks for server functionality.
- Profession input should remain local to the browser unless privacy copy and architecture are updated.
- Keep the tone absurd, punchy, and satirical. Avoid mean-spirited personal attacks or real employment advice.
- Preserve share/copy behavior and `siteUrl` consistency when changing domains or public URLs.
- Keep the Robot Punch minigame lightweight. Do not introduce canvas/game-engine complexity for simple interactions.
- Public pages should remain accessible without JavaScript.
- Keep clean Netlify routes for `/about`, `/contact`, and `/privacy`.
- Update `public/sitemap.xml` if public pages or canonical URLs change.
- Update `privacy.html` before adding analytics, ads, cookies, tracking pixels, forms, or any third-party data collection.

## Things Agents Should Never Change

- Do not add real ad publisher IDs, analytics IDs, API keys, or secrets to committed files.
- Do not make the satire sound like a real prediction of job loss.
- Do not add heavyweight frameworks, databases, backend services, or client-side routers without explicit direction.
- Do not remove privacy claims without replacing them with accurate new ones.
- Do not break social sharing metadata, `robots.txt`, sitemap, or Netlify clean routes.

## Repo Skills

Use these skills when work matches their scope:

- `$unemployedbyai-frontend`: Vite, vanilla JS, HTML, CSS, app interactions, autocomplete, sharing, and Robot Punch.
- `$unemployedbyai-content-seo`: satire copy, job profiles, SEO metadata, sitemap, robots, Open Graph, and social snippets.
- `$unemployedbyai-netlify-privacy`: Netlify config, static deployment, headers, redirects, privacy language, ads, and analytics boundaries.
