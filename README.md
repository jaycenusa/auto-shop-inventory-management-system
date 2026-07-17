# Auto Shop Inventory Management System

React + TypeScript inventory app with two site faces resolved by hostname:

| Host | View |
|------|------|
| Apex / `localhost` | Customer portal (service prices) |
| `internal.*` | Owner / internal dashboard |
| `dev.*` | Both — switch Owner ↔ Customer in the banner |

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node)

## Setup
# Auto Shop Inventory Management System (IMS)

A full-width React application for managing auto shop parts inventory—browse stock, add and update parts, filter by category, and receive low-stock email alerts.

## Features

### Dashboard
- Shop overview with summary stats and quick-action placeholders
- Branded navigation header with logo and main menu

### Inventory catalog
- Full-width inventory table with part **picture**, name, brand, price, quantity, and availability status
- Color-coded availability badges: **In Stock**, **Low Stock**, **Out of Stock**
- Browse by category from the nav dropdown: **Tires**, **Air Filter**, **Car Parts**
- Dynamic page title reflects the selected category

### Search and filter
- Shared filter bar (car part name, brand, availability status)
- Clear filters control when any filter is active
- Filtered result count shown in the table footer

### Pagination
- Page through results with Previous / Next and numbered pages
- **Parts per page** selector (5, 10, 25, or 50) under the results summary
- Resets to page 1 when filters or page size change

### Add car parts
- Dedicated add flow with a multi-field form (car part, brand, category, price, quantity, availability)
- **Part picture** via drag-and-drop upload or image URL (JPEG, PNG, WebP, GIF; max 2 MB)
- Add multiple parts to a **preview list** before saving
- Confirm to save all previewed parts to inventory
- Form validation with **react-hook-form** (required: car part, brand, category, price, picture)

### Modify car parts
- Filter visible parts, then edit multiple rows in one table
- Update name, brand, category, price, quantity, status, and picture per row
- **Preview changes** with a before/after compare table (including image changes)
- Confirm to apply updates
- Same required-field validation as add flow

### Stock alerts (email)
- Server-side email notifications for **Low Stock** and **Out of Stock** parts (nodemailer)
- Express API at `/api/notify/email`; dev server proxies `/api` to port 3001
- Configure SMTP via `.env` (see [Email alerts](#email-alerts-nodemailer))

### UI building blocks
- **`Shared/Filter`** — filter state, logic, and UI
- **`Shared/Button`** — consistent button variants (primary, accent, secondary, pagination, nav, etc.)
- **`Shared/Table`** — inventory tables, status badges, image cells
- **`Shared/PictureDropzone`** — upload UI with preview and validation errors

## Stack

- **React 19** with **TypeScript**
- **react-hook-form** — form state and validation
- **Webpack 5** — bundling, dev server, and production builds
- **Babel** — JSX/TS transpilation and React Fast Refresh in development
- **Tailwind CSS v4** — via `@import "tailwindcss"` in `src/Index.css` and PostCSS (`@tailwindcss/postcss`)
- **Express** + **nodemailer** — notification API
- **ESLint** — flat config in `eslint.config.js`

## Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start Webpack dev server (default: port 3000)    |
| `npm run server`  | Start notification API (port 3001)               |
| `npm run build`   | Type-check with `tsc -b`, then production build  |
| `npm run preview` | Serve production build via Webpack dev server    |
| `npm run lint`    | Run ESLint                                       |
| `npm run release` | Analyze commits and publish a version (CI)       |

For local development with email alerts, run **`npm run dev`** and **`npm run server`** in separate terminals.

## Releases

Pushes to **`main`** (or **`master`**) run [semantic-release](https://semantic-release.gitbook.io/) via GitHub Actions. Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix  | Version bump | Example                      |
| ------- | ------------ | ---------------------------- |
| `feat`  | minor        | `feat: add order cart`       |
| `fix`   | patch        | `fix: inventory search sync` |
| `chore` | patch        | `chore: update webpack`      |

A releasable push updates `package.json`, `CHANGELOG.md`, creates a Git tag (e.g. `v0.2.0`), and opens a GitHub Release.

**GitHub:** Settings → Actions → General → Workflow permissions → **Read and write** for `GITHUB_TOKEN`.

Production output is written to `dist/`.

## Project layout

| Path | Purpose |
| ---- | ------- |
| `src/App.tsx` | Routing between dashboard, inventory, add-part, modify-part |
| `src/Pages/Homepage.tsx` | Dashboard |
| `src/Pages/InventoryPage.tsx` | Inventory table, filters, pagination |
| `src/Pages/Header.tsx` | Navigation and category menu |
| `src/Components/AddCarPart.tsx` | Add part form and preview |
| `src/Components/ModifyCarPart.tsx` | Bulk edit and compare flow |
| `src/Components/PartPreviewTable.tsx` | Preview table for new parts |
| `src/Components/PartCompareTable.tsx` | Before/after compare for edits |
| `src/Shared/Filter.tsx` | Shared filter UI and `filterInventoryParts` |
| `src/Shared/Button.tsx` | Shared `Button` component and icons |
| `src/Shared/Table.tsx` | Shared table components |
| `src/Shared/PictureDropzone.tsx` | Image upload dropzone |
| `src/Database/InventoryData.ts` | Part types and seed data |
| `src/Utils/PartValidation.ts` | react-hook-form validation rules |
| `src/Services/NotificationService.ts` | Client stock-alert API calls |
| `server/Index.cjs` | Express API (`/api/notify/email`) |
| `server/NotificationService.cjs` | nodemailer email sending |

## Getting started

```bash
# Clone the repo (adjust URL if needed)
git clone <repo-url>
cd auto-shop-inventory-management-system

# Install dependencies
npm install
```

## Run locally

```bash
npm run dev
```

Webpack serves the app on **port 3000**. Modern browsers resolve `*.localhost` to `127.0.0.1`, so no `/etc/hosts` edits are required.

### Local URLs

| URL | What you get |
|-----|----------------|
| [http://localhost:3000](http://localhost:3000) | Customer portal |
| [http://internal.localhost:3000](http://internal.localhost:3000) | Owner / internal app |
| [http://dev.localhost:3000](http://dev.localhost:3000) | Dual mode (Owner/Customer switcher) |

### Optional query override

Force a view on any host (handy for quick checks):

- [http://localhost:3000?view=owner](http://localhost:3000?view=owner)
- [http://localhost:3000?view=customer](http://localhost:3000?view=customer)

## Other scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve production build |
| `npm run lint` | ESLint |
| `npm run server` | Optional Express API on port 3001 (proxied at `/api`) |

## Production host mapping (target)

When you deploy behind a real domain (example: `autoshop.com`):

| Host | View |
|------|------|
| `autoshop.com` (apex) | Customer portal |
| `internal.autoshop.com` | Owner / internal app |
| `dev.autoshop.com` (optional) | Dual-mode preview |

Serve the **same** build on all hostnames; the app picks the view from `window.location.hostname`.

## Language

Use the language dropdown in the top banner (EN / 繁中 / 简中 / ES). UI labels and seed part names follow the selected language.

## Troubleshooting

**`internal.localhost` or `dev.localhost` won’t load**  
Restart the dev server after pull (`Ctrl+C`, then `npm run dev`). Webpack is configured with `allowedHosts: 'all'`.

**Still seeing the wrong view**  
Hard-refresh the tab (`Cmd+Shift+R` / `Ctrl+Shift+R`), or try `?view=owner` / `?view=customer`.

**Port 3000 already in use**  
Stop the other process, or change `port` in `webpack.config.cjs` under `devServer`.
