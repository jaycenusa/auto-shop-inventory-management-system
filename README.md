# Auto Shop Inventory Management System

React + TypeScript app for managing auto shop inventory. The UI uses **Tailwind CSS v4** with a full-width dashboard layout (branded navigation and homepage in `src/components/Homepage.tsx`).

## Stack

- **React 19** with **TypeScript**
- **Webpack 5** — bundling, dev server, and production builds
- **Babel** — JSX/TS transpilation and React Fast Refresh in development
- **Tailwind CSS v4** — via `@import "tailwindcss"` in `src/index.css` and **PostCSS** (`@tailwindcss/postcss`)
- **ESLint** — flat config in `eslint.config.js`

## Scripts

| Command        | Description                                      |
| -------------- | ------------------------------------------------ |
| `npm run dev`    | Start Webpack dev server (default: port 3000)   |
| `npm run build`  | Type-check with `tsc -b`, then production build |
| `npm run preview`| Serve in production mode (Webpack dev server)    |
| `npm run lint`   | Run ESLint                                       |

Production output is written to `dist/`.

## Project layout

- `src/main.tsx` — application entry
- `src/App.tsx` — root component (renders `Homepage`)
- `src/components/Homepage.tsx` — dashboard homepage (nav, header, stats, activity)
- `src/index.css` — global styles and Tailwind
- `webpack.config.cjs` — Webpack configuration
- `babel.config.cjs` — Babel presets
- `postcss.config.mjs` — PostCSS / Tailwind
- `public/` — static assets copied to `dist` (e.g. favicon)

## Expanding ESLint

For stricter, type-aware rules you can switch from `typescript-eslint` recommended to `recommendedTypeChecked` / `strictTypeChecked` and point `parserOptions.project` at `tsconfig.app.json` and `tsconfig.node.json`. See the [typescript-eslint docs](https://typescript-eslint.io/getting-started/typed-linting).
