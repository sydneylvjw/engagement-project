# FLICR Coalition Console

Dispatch console prototype for the First Line in Community Reporting (FLICR) network. Coalition members can review neighborhood reports, track follow-up activity, and collaborate through comments, notes, and assignment workflows.

## Overview
- **Live feed & follow-up** – Filter, review, and focus on high-priority resident reports.
- **Case workspace** – Inspect case metadata, collaborate through notes/comments, and assign or refer cases.
- **Locator map** – Highlights the currently selected report with MapLibre tiles for quick spatial context.

## Data
- Default data lives in `data/mockReports.json` and was generated with synthetic inputs for course use.
- Run `npm run generate:data` to rebuild the dataset (writes 150 reports with randomized neighborhoods, statuses, etc.).

## Local Development
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the Vite-provided URL and interact with the console. Selecting a report loads the case panel and the locator map zooms to the report coordinates.

## Quality Checks
- `npm run js-lint` – ESLint with the Google config for `app.js`.
- `npm run css-lint` – Stylelint using the standard config for all CSS files.

## Notes
- Map rendering relies on the MapLibre CDN import declared near the top of `app.js`.
- Local storage caches engagement state (comments/notes) plus case overrides so that interactions persist between sessions.
