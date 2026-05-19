# mf-demo-shell

Cross-framework Module Federation demo: a React host loads a React Calendar remote and an Angular Reports remote, each deployed independently to Azure Static Web Apps.

> **Status:** scaffolding (v0.1.0). See `mf-demo-shell-spec.md` for the full build plan.

## Quick start

```bash
pnpm install
pnpm dev:host       # http://localhost:3000
pnpm dev:calendar   # http://localhost:3001
pnpm dev:reports    # http://localhost:3002
```

## Apps

| App             | Stack                  | Port  | Role                                    |
| --------------- | ---------------------- | ----- | --------------------------------------- |
| host            | React 18 + Rsbuild     | 3000  | Shell, routing, auth, design tokens     |
| calendar-remote | React 18 + Rsbuild     | 3001  | Exposes `<Calendar />` via MF           |
| reports-remote  | Angular 17 (Webpack)   | 3002  | Exposes `<reports-dashboard />` (Web Component) |

## Packages

- `@mf-demo/contracts` — shared TypeScript types (auth, theme, events)
- `@mf-demo/design-tokens` — `tokens.css` with CSS custom properties

## What's next

See `mf-demo-shell-spec.md` section 13 (Suggested Build Order) for the remaining work: MF wiring, Angular Elements interop, BroadcastChannel auth, Azure pipelines, independent-deploy demo.
