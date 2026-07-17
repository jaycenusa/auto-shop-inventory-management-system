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
