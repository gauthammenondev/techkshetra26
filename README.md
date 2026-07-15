# Techkshetra'26 — Coming Soon Landing Page

A dark, immersive "Coming Soon" reveal page for **Techkshetra'26**, built with React + Vite. Features an interactive pull-cord spotlight, 2D physics-based falling text (powered by Matter.js), and dramatic reveal animations.

---

## Prerequisites

Make sure you have the following installed on your system:

| Tool    | Version  | Download                                      |
| ------- | -------- | --------------------------------------------- |
| Node.js | ≥ 18.x   | [nodejs.org](https://nodejs.org/)             |
| npm     | ≥ 9.x    | Bundled with Node.js                          |

> **Tip:** Run `node -v` and `npm -v` to check your installed versions.

---

## Tech Stack

- **React** 19 — UI library
- **React Router** 7 — Client-side routing
- **Vite** 8 — Dev server and bundler
- **TypeScript** 6 — Type safety
- **CSS Modules** — Scoped component styling
- **Matter.js** — 2D physics engine for the interactive falling text
- **Google Fonts** — Inter (body), Noto Serif (fallback)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/techkshetra26.git
cd techkshetra26
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173/** by default.

### 4. Build for production

```bash
npm run build
```

Output will be generated in the `dist/` directory.

### 5. Preview the production build

```bash
npm run preview
```

---

## Available Scripts

| Script            | Command              | Description                            |
| ----------------- | -------------------- | -------------------------------------- |
| `npm run dev`     | `vite`               | Start the Vite dev server with HMR     |
| `npm run build`   | `tsc -b && vite build` | Type-check and create production build |
| `npm run lint`    | `oxlint`             | Run the OxLint linter                  |
| `npm run preview` | `vite preview`       | Preview the production build locally   |

---

## Project Structure

```
techkshetra26/
├── index.html                          # HTML entry point (Google Fonts loaded here)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                        # React root mount
    ├── App.tsx                         # Router setup
    ├── index.css                       # Global reset styles
    ├── components/
    │   └── FallingText/
    │       └── FallingText.tsx         # Matter.js physics text component
    └── pages/
        └── coming-soon/
            ├── ComingSoonPage.tsx       # Main page component
            └── ComingSoonPage.module.css # All page styles & animations
```

---

## External Resources

This project loads the following resources at runtime (no install required):

- **Google Fonts CDN**
  - [Inter](https://fonts.google.com/specimen/Inter) — Clean sans-serif for body text
  - [Noto Serif](https://fonts.google.com/specimen/Noto+Serif) — Serif fallback

No other external APIs, images, or CDN assets are required.

---

## License

Private project — not for redistribution.
