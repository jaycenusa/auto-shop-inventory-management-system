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
- **esbuild** — bundling, dev server, and production builds (`esbuild.mjs`)
- **Tailwind CSS v4** — via `@import "tailwindcss"` in `src/Index.css` and PostCSS (`@tailwindcss/postcss`)
- **Express** + **nodemailer** — notification API
- **ESLint** — flat config in `eslint.config.js`

## Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start esbuild dev server (default: port 3000)    |
| `npm run server`  | Start notification API (port 3001)               |
| `npm run build`   | Type-check with `tsc -b`, then production build  |
| `npm run preview` | Build and serve `dist/` statically (port 3000)   |
| `npm run lint`    | Run ESLint                                       |

For local development with email alerts, run **`npm run dev`** and **`npm run server`** in separate terminals.

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
| `esbuild.mjs` | esbuild + Tailwind CLI build and dev server |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Email alerts (nodemailer)

Stock alerts are sent by the Node server (not in the browser).

1. Copy `.env.example` to `.env` (if present) or create `.env`
2. Set `SMTP_USER` and `SMTP_PASS` (Gmail [App Password](https://myaccount.google.com/apppasswords) recommended)
3. Optionally set `ALERT_EMAIL_TO` for the recipient address
4. Run `npm run server` alongside `npm run dev`

## Docker

Multi-container setup: Nginx serves the SPA and proxies `/api` to the Node API.

| File | Purpose |
| ---- | ------- |
| `Dockerfile.web` | Build SPA and serve with Nginx |
| `Dockerfile.api` | Express + nodemailer API |
| `nginx.conf` | SPA routing and `/api` proxy |
| `docker-compose.yml` | `web` + `api` services |

```bash
docker compose up --build
```

App: **http://localhost:8080**. Provide SMTP credentials in `.env` for the API container.

## Expanding ESLint

For stricter, type-aware rules you can switch from `typescript-eslint` recommended to `recommendedTypeChecked` / `strictTypeChecked` and point `parserOptions.project` at your tsconfig files. See the [typescript-eslint docs](https://typescript-eslint.io/getting-started/typed-linting).
