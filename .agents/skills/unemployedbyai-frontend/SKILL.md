---
name: unemployedbyai-frontend
description: Use when modifying the UnemployedByAI.lol Vite static frontend, including vanilla JavaScript interactions, HTML pages, CSS, autocomplete, sharing, and the Robot Punch minigame.
---

# UnemployedByAI Frontend Skill

## When To Use

Use this skill for app behavior, Vite config, HTML pages, vanilla JavaScript, CSS, responsive layout, autocomplete, fake analysis flow, share buttons, and Robot Punch minigame work.

## Stack

- Vite static build
- vanilla JavaScript
- plain HTML pages
- one global CSS file
- Netlify static hosting

## Key Files

- `index.html`
- `about.html`
- `contact.html`
- `privacy.html`
- `src/main.js`
- `src/data.js`
- `src/style.css`
- `vite.config.js`

## Rules

- Keep the app static and browser-only.
- Prefer simple functions and data-driven copy over abstractions.
- Keep interactions accessible: labels, focus behavior, ARIA state, keyboard behavior, and reduced-motion friendliness where relevant.
- Reuse shared CSS selectors for repeated UI patterns so matching elements keep the same hover, focus, active, spacing, and responsive behavior.
- Keep Robot Punch lightweight with DOM/CSS state. Avoid canvas or game engines unless explicitly requested.
- Keep the main profession analysis flow fast to load and funny to use.
- Avoid adding framework dependencies for small UI changes.

## Validation

```bash
npm run build
```

Use local preview when visual or route behavior matters:

```bash
npm run preview
```
