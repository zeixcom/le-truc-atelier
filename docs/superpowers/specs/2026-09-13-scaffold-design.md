# Le Truc Atelier — Scaffold Design

Date: 2026-09-13
Status: Approved

## Overview

Le Truc Atelier will be a direct manipulation editor for Le Truc components, built with Le Truc components. This spec covers only the initial project scaffold: app structure, local dev server, and test setup. The editor itself (canvas, palette, inspector, …) is future work.

## Stack

- **Bun** (package manager, dev server, test runner) — one tool for everything, matching how the `@zeix/le-truc` repo itself is developed.
- **TypeScript** as devDependency (Bun executes TS natively; `tsc --noEmit` provides type checking).
- **@zeix/le-truc** — the only runtime dependency. HTML-first reactive custom elements: HTML is served, `defineComponent()` enhances it.
- **Biome** for lint + formatting.

## Project structure

```
le-truc-atelier/
├── index.html                          # App shell, served at /
├── src/
│   ├── main.ts                         # Entry: imports app components
│   ├── components/
│   │   ├── demo-greeter.ts             # Demo Le Truc component (disposable)
│   │   └── demo-greeter.test.ts        # Component test (bun test + jsdom)
│   ├── styles/
│   │   └── main.css                    # Base styles, linked from index.html
│   └── test/
│       └── setup.ts                    # jsdom globals preload for bun test
├── server/
│   └── dev.ts                          # Bun.serve dev server (HTML imports)
├── biome.json                          # Biome config (tabs, like le-truc)
├── bunfig.toml                         # bun test preload
├── tsconfig.json                       # Strict TS, bundler resolution, noEmit
└── package.json                        # scripts: dev, test, typecheck, lint
```

## Dev server

`server/dev.ts` uses Bun's native HTML imports:

```ts
import index from "../index.html";
Bun.serve({ port: 5173, development: true, routes: { "/": index } });
```

In dev mode Bun bundles the `<script type="module">` graph (TypeScript → JS) and CSS on the fly, with dev-time error overlay and live reloading. `bun run dev` starts the server at `http://localhost:5173`. No bundler configuration, no extra dependencies.

## Demo component: `demo-greeter`

A small component following the Le Truc quick-start idiom — `defineComponent('demo-greeter', …)` with an input, an `expose`d reactive property, an `on()` event listener, and a `watch()` text binding. Its purpose is to prove the full loop (serve HTML → component enhances → reactivity updates DOM) and to validate the test setup. It is disposable and will be replaced by real editor components.

**Naming convention:** demo components use a `demo-` prefix (e.g. `demo-greeter`); more may follow.

## Testing

- **Runner:** `bun test`.
- **DOM:** **jsdom** (not happy-dom). Rationale: the project will likely adopt DOMPurify later to sanitize user input, and DOMPurify is known to misbehave in crucial cases under happy-dom; jsdom is heavier but works without known issues. jsdom globals (`window`, `document`, `customElements`, `HTMLElement`, …) are registered via a preload script configured in `bunfig.toml`.
- One test verifies `demo-greeter` upgrades in the DOM and reacts to input events.
- Browser-level tests (Playwright, as the le-truc repo uses) are out of scope for the scaffold; they can be added when the editor UI needs them.

## Tooling

- **typecheck:** `tsc --noEmit` (strict mode, `moduleResolution: "bundler"`, DOM + Bun types via `@types/bun`). Bun does not typecheck.
- **Biome:** lint + format; indent style: tabs, matching the le-truc codebase.
- **Scripts:** `dev`, `test`, `typecheck`, `lint`.
- `bun.lock` is committed.

## Error handling (scaffold level)

- Dev server: Bun's built-in dev error overlay for bundling errors; uncaught component errors surface in the browser console.
- Tests: failures reported by `bun test`.

## Out of scope (future)

- Editor features (canvas, palette, inspector, direct manipulation).
- DOMPurify integration (constraint recorded: must work with jsdom).
- Playwright browser tests, CI, production build/deploy.
