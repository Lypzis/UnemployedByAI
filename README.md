# UnemployedByAI.lol

UnemployedByAI.lol is a satirical static website that pretends to estimate whether AI is replacing your job.

The site is intentionally unserious: users enter a profession, wait through a fake analysis sequence, and receive a shareable result full of corporate-dystopian nonsense. The gallery includes a tiny Robot Punch minigame for users who need to express workplace feelings at a cartoon robot.

## Stack

- Vite
- Vanilla JavaScript
- Plain HTML/CSS
- Netlify static hosting

## Features

- Profession input with autocomplete
- Clickable profession suggestions
- Profession-specific loading jokes
- Randomized replacement results
- Share/copy buttons
- Jobs Already Taken gallery
- Phaser-powered Robot Punch minigame in the gallery with local CC0 sound effects
- Browser-only Interview Simulator with pasted resume text
- About, Contact, and Privacy pages
- Netlify-ready config
- `robots.txt` and `sitemap.xml`

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

There is no dedicated test suite yet. Use `npm run build` as the minimum verification check.
For the Interview Simulator, also manually check pasted role requirements, sanitized resume text,
the three-question flow, reset behavior, and the no-personal-information warning.
For Robot Punch, manually check the Phaser modal, keyboard punch button, mute toggle, replay,
share unlock, and local audio loading.

## CI/CD

GitHub Actions runs validation only:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on pull requests and pushes to `main`.
- The workflow installs dependencies, runs `npm test --if-present`, and builds the site.

Netlify owns deployment:

- Build command: `npm run build`
- Publish directory: `dist`
- Keep Netlify auto-deploy connected to `main`.
- Protect `main` in GitHub, require pull requests, and require the `CI / Test And Build` status check before merge so failing changes do not reach the branch Netlify deploys.

## Project Structure

```text
.
├── AGENTS.md
├── .agents/
├── .github/
├── index.html
├── about.html
├── contact.html
├── privacy.html
├── netlify.toml
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── robots/
├── src/
│   ├── data.js
│   ├── main.js
│   └── style.css
└── vite.config.js
```

## AI-First Project Notes

Codex-facing project instructions live in [AGENTS.md](./AGENTS.md). Repo-specific skills live under [.agents/skills](./.agents/skills):

- `$unemployedbyai-frontend`: Vite, vanilla JS, HTML, CSS, app interactions, autocomplete, sharing, and Robot Punch.
- `$unemployedbyai-content-seo`: satire copy, job profiles, SEO metadata, sitemap, robots, Open Graph, and social snippets.
- `$unemployedbyai-netlify-privacy`: Netlify config, static deployment, headers, redirects, privacy language, ads, and analytics boundaries.

## Content

Most jokes, profession categories, autocomplete options, gallery cards, and result phrases live in:

```text
src/data.js
```

Main interaction logic lives in:

```text
src/main.js
```

Visual styling lives in:

```text
src/style.css
```

## Netlify

The project includes `netlify.toml`.

Use these settings if configuring manually:

```text
Build command: npm run build
Publish directory: dist
```

Clean routes are configured for:

```text
/about
/contact
/privacy
```

Netlify handles deployment. Keep the app static unless there is a clear reason to add server-side behavior.

## Privacy And Ads

The current Privacy page says profession input, role requirements, pasted resume text, and Interview Simulator answers are processed locally in the browser and are not sent to a server by this website.

Before adding AdSense, analytics, or any third-party tracking, update `privacy.html` with the exact provider/cookie language required.

If AdSense is enabled later, add `ads.txt` when Google provides the publisher ID.

## Signature

Built entirely by Lypzis, a human. For now.
