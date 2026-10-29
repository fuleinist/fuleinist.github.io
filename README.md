# fuleinist.github.io

Personal site for Chris Chen — full stack web developer, Sydney.

Live at **https://fuleinist.github.io/**

## What this is

A single-page, dependency-free portfolio. Monochrome telemetry aesthetic: light and dark
themes, a command palette, live project filtering, and a contribution calendar drawn from
the GitHub API.

## Structure

```
index.html                    the site
assets/site.css               all styles, token-based theming
assets/site.js                interactions (no dependencies)
data/site.json                generated — repos, stars, languages, contributions
scripts/site-data.js          fetches the data from the GitHub API
.github/workflows/site-data.yml   daily refresh + manual dispatch
```

`data/site.json` and the numbers on the page are **generated**. Do not hand-edit them —
change `scripts/site-data.js` or `config` in it instead, or run the workflow.

## Local preview

```bash
node scripts/site-data.js   # needs GH_TOKEN for the contribution calendar
python -m http.server 8765  # or any static server
```

Opening `index.html` directly via `file://` also works; the page falls back to embedded
data when the JSON fetch is blocked.

## Data refresh

The `site data` workflow runs daily at 03:17 UTC and commits any change to
`data/site.json`. It triggers on `schedule` and `workflow_dispatch` only — never on
`push`, so its own commit cannot re-trigger it.

## Preserved pages

Older experiments still live at their original URLs:

- `/star-wars-intro.html` — CSS 3D opening crawl (the previous landing page)
- `/aframe-earth-moon/`, `/aframe-360-video/`, `/aframe-ar/`, `/aframe-tp-tower/`, `/aframe-vr-survey/`
- `/me/` — the original Freelancer-theme portfolio

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step, no trackers.