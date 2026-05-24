# UnemployedByAI.lol

A satirical single-page website that pretends to estimate whether AI is replacing your job.

The site is intentionally unserious: users enter a profession, wait through a fake analysis sequence, and receive a shareable result full of corporate-dystopian nonsense.

## Features

- Vite-powered static frontend
- Vanilla JavaScript, no framework
- Profession input with autocomplete
- Clickable profession suggestions
- Profession-specific loading jokes
- Randomized replacement results
- Share/copy buttons
- Jobs Already Taken gallery
- Robot Punch minigame in the gallery
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

## Project Structure

```text
.
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

## Privacy And Ads

The current Privacy page says the profession input is processed locally in the browser and is not sent to a server by this website.

Before adding AdSense, analytics, or any third-party tracking, update `privacy.html` with the exact provider/cookie language required.

If AdSense is enabled later, add `ads.txt` when Google provides the publisher ID.

## Signature

Built entirely by Lypzis, a human. For now.
