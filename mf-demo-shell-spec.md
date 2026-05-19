# Module Federation Demo Shell — Build Spec

A working demonstration of cross-framework Module Federation: a React host loading a React remote and an Angular remote, each deployed independently to Azure Static Web Apps via separate Azure DevOps pipelines. Built with Rsbuild and `@module-federation/rsbuild-plugin`.

The point of this repo is to defend the resume claim that you shipped a React micro-frontend into a non-React host at Vagaro. Most public MF demos are React+React in a monorepo — they prove MF *exists* but skip the hard parts. This one targets the hard parts.

---

## 1. Goal

Three independently-deployable apps that compose into one product:

- **Host shell** (React 18 + Rsbuild) — navigation, auth, layout, design tokens. Owns routing.
- **Calendar remote** (React 18 + Rsbuild) — appointment day/week views. Exposes `<Calendar />`.
- **Reports remote** (Angular 17 + Webpack) — revenue, no-shows, staff utilization. Exposes a standalone Angular component as a Web Component via Angular Elements.

The money shot: change the Reports remote, push to `main`, watch its pipeline deploy in ~90 seconds, see the host pick up the new version on next page load — with **no rebuild or redeploy of the host or Calendar**.

---

## 2. Tech Stack

- **Bundlers**: Rsbuild 1.x for host + React remote; Webpack 5 (Angular CLI default) for Angular remote
- **MF plugins**: `@module-federation/rsbuild-plugin` (latest) on the React side; `@angular-architects/module-federation` on the Angular side
- **Frameworks**: React 18, Angular 17 (standalone components, signals)
- **Interop**: Angular Elements (custom elements) to expose the Angular remote as a Web Component the React host can use as `<reports-dashboard />`
- **Auth**: JWT in `localStorage` + a `BroadcastChannel`-based event bus so remotes react to login/logout
- **Styling**: CSS custom properties (design tokens) defined in host, consumed by remotes; Tailwind in each app for utility classes
- **Routing**: TanStack Router (or React Router 6) in the host. Remotes don't own routes for v1.
- **Mock data**: JSON files served from each remote's `public/` dir. No backend.
- **CI/CD**: 3 Azure DevOps pipelines, 3 Azure Static Web Apps.
- **Testing**: Jest + React Testing Library on React; Jasmine/Karma on Angular (default).
- **Type sharing**: `@mf-demo/contracts` workspace package with TypeScript interfaces for cross-remote contracts.

---

## 3. Repo Structure

Monorepo via pnpm workspaces — easier for shared types, but each app still builds and deploys independently.

```
mf-demo-shell/
├── apps/
│   ├── host/                                # React 18 + Rsbuild
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── routes/
│   │   │   ├── remotes/                     # typed wrappers around remote imports
│   │   │   │   ├── CalendarRemote.tsx
│   │   │   │   └── ReportsRemote.tsx
│   │   │   └── tokens.css                   # design tokens
│   │   ├── rsbuild.config.ts
│   │   ├── module-federation.config.ts
│   │   └── package.json
│   ├── calendar-remote/                     # React 18 + Rsbuild
│   │   ├── src/
│   │   │   ├── Calendar.tsx                 # the exposed component
│   │   │   ├── components/
│   │   │   ├── data/mock-appointments.json
│   │   │   └── bootstrap.tsx                # standalone mode entry
│   │   ├── rsbuild.config.ts
│   │   ├── module-federation.config.ts
│   │   └── package.json
│   └── reports-remote/                      # Angular 17
│       ├── src/
│       │   ├── app/
│       │   │   ├── reports-dashboard.component.ts
│       │   │   └── chart-card.component.ts
│       │   ├── bootstrap.ts                 # createCustomElement registration
│       │   └── main.ts
│       ├── webpack.config.js                # MF config
│       └── angular.json
├── packages/
│   ├── contracts/                           # @mf-demo/contracts
│   │   └── src/
│   │       ├── auth.ts                      # AuthState, AuthEvent
│   │       ├── theme.ts                     # ThemeTokens
│   │       └── events.ts                    # event bus types
│   └── design-tokens/                       # @mf-demo/design-tokens
│       └── tokens.css
├── pipelines/
│   ├── azure-pipelines.host.yml
│   ├── azure-pipelines.calendar.yml
│   └── azure-pipelines.reports.yml
├── docs/
│   ├── architecture.md
│   ├── independent-deploy-demo.md           # the money shot, with screenshots
│   ├── journey.md
│   └── screenshots/
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## 4. The Domain

Vagaro-adjacent but generic: a salon/spa appointment manager. Three views:

- **Today's Calendar** (Calendar remote): horizontal time-slot grid showing the day's appointments across 3–5 staff members. Click an appointment → opens a side-panel detail view inside the host.
- **Reports Dashboard** (Reports remote): three Angular Material cards — revenue this week, no-show rate, top-performing staff. Each card has a small Recharts/ngx-charts visualization.
- **Settings** (host only): toggle dark/light mode, log out. Demonstrates that the host owns its own routes.

Mock data only. The seeded dataset lives as JSON inside each remote — 30 days of appointments for the calendar, 90 days of aggregated stats for reports.

---

## 5. The Hard Parts

This is what the README and journey.md will be built around. Most MF tutorials don't address these honestly.

### 5.1 Shared dependencies — React version pinning

If the host bundles React 18.2.0 and the Calendar remote bundles 18.3.1, you get two Reacts in the same DOM, which breaks hooks. Solution: configure `shared: { react: { singleton: true, requiredVersion: '^18.0.0' }, 'react-dom': { singleton: true, requiredVersion: '^18.0.0' } }` in both `module-federation.config.ts` files. Lock the versions in `package.json` to the exact same number.

### 5.2 Angular as a Web Component

Angular's MF story is messier than React's because Angular wants to own bootstrap, zone.js, the DI container, everything. The cleanest interop for v1 is:

1. The Reports remote builds with `@angular-architects/module-federation`.
2. Inside Angular, the dashboard component is registered as a custom element via `createCustomElement`:
   ```ts
   const el = createCustomElement(ReportsDashboardComponent, { injector });
   customElements.define('reports-dashboard', el);
   ```
3. The host's `ReportsRemote.tsx` does a one-time dynamic `import()` of the Angular bundle to register the custom element, then renders `<reports-dashboard />` in JSX. React doesn't know it's Angular.
4. Props pass via attributes/properties; events pass back via custom DOM events.

The catch: zone.js. Angular 17's standalone API is moving toward zoneless, but for v1, ship with zone.js and accept the ~40KB of shared bundle cost. Document this in journey.md.

### 5.3 Cross-remote communication

Two channels:

- **Auth state**: `BroadcastChannel('auth')`. Host posts `{ type: 'auth:login', user, token }` and `{ type: 'auth:logout' }`. Each remote subscribes. Reason: avoids prop-drilling auth through MF boundaries and works across tabs.
- **Theme**: CSS custom properties. Host sets `--color-primary` etc. on `:root`. Remotes consume via `var(--color-primary)`. Theme switch = one DOM mutation, no remote code change.

A naive shared React Context across MF boundaries works only if `react` is a singleton (it is — see 5.1) AND the remote imports the Context provider from the host. That coupling defeats independent deployment. The `BroadcastChannel` pattern keeps the remotes self-contained.

### 5.4 Type sharing

Three apps, one set of TypeScript interfaces (`AuthEvent`, `Appointment`, `ThemeTokens`). The `packages/contracts` workspace package is consumed by all three. The Angular app uses these types directly; the React apps too. **The contracts package never reaches runtime** — it's `.d.ts` only after build, which means there's no shared-deps version dance to do for it.

### 5.5 Independent deployment

The whole point. Each remote ships a `mf-manifest.json` (or `remoteEntry.js`) at a known URL. The host's `module-federation.config.ts` references those URLs:

```ts
remotes: {
  calendar: 'calendar@https://calendar-remote.azurestaticapps.net/mf-manifest.json',
  reports:  'reports@https://reports-remote.azurestaticapps.net/remoteEntry.js'
}
```

When Calendar deploys, its `mf-manifest.json` updates. Next time a user loads the host, it fetches the new manifest. **No host rebuild.** This is the property to demonstrate in `docs/independent-deploy-demo.md`.

---

## 6. CI/CD — Three Pipelines

Three near-identical Azure DevOps pipelines, one per app. Each:

1. Triggers only on changes to its app folder (`paths:` filter)
2. Installs deps via pnpm (`pnpm install --filter <app>...`)
3. Builds the app for production
4. Deploys the build output to its Azure Static Web App via `AzureStaticWebApp@0` task

```yaml
# pipelines/azure-pipelines.calendar.yml
trigger:
  branches: { include: [main] }
  paths:
    include:
      - apps/calendar-remote/**
      - packages/contracts/**
      - packages/design-tokens/**

pool: { vmImage: 'ubuntu-latest' }

steps:
  - task: NodeTool@0
    inputs: { versionSpec: '20.x' }
  - script: corepack enable && pnpm install --frozen-lockfile
  - script: pnpm --filter calendar-remote build
  - task: AzureStaticWebApp@0
    inputs:
      app_location: 'apps/calendar-remote/dist'
      azure_static_web_apps_api_token: $(CALENDAR_SWA_TOKEN)
      skip_app_build: true
```

The three SWA deployment tokens live as pipeline secrets, one per pipeline.

**Why this matters for the demo**: a commit touching only `apps/reports-remote/` triggers only the reports pipeline. Host and Calendar don't rebuild. This is the property the README screenshots will defend.

---

## 7. Auth Flow

Mock auth — no real identity provider. v1 has two hard-coded users (`admin / admin`, `staff / staff`) and issues a fake JWT (just a base64-encoded JSON, no signature) for shape.

1. User clicks Login in host → host validates against the hard-coded list → stores `{ token, user }` in `localStorage`.
2. Host posts `{ type: 'auth:login', user, token }` to `BroadcastChannel('auth')`.
3. Each remote, on bootstrap, reads `localStorage` once and subscribes to `BroadcastChannel('auth')` for updates.
4. Logout works the same in reverse.

The fake JWT is fine for a demo, but call it out explicitly in the README. Don't let a reviewer assume this is your idea of production auth.

---

## 8. Type Contracts

`packages/contracts/src/auth.ts`:
```ts
export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type AuthEvent =
  | { type: 'auth:login'; user: User; token: string }
  | { type: 'auth:logout' };
```

`packages/contracts/src/events.ts`:
```ts
export const AUTH_CHANNEL = 'mf-demo:auth';
export const THEME_CHANNEL = 'mf-demo:theme';
```

Both remotes and the host import from `@mf-demo/contracts`. If you change an event shape, TypeScript yells in all three projects on the next `pnpm build`.

---

## 9. Testing

Modest, on purpose. Don't over-invest in unit tests for a demo repo; do invest in one high-signal integration test.

- **Host**: Jest + RTL. One smoke test that the Login flow renders, validates, and dispatches an auth event.
- **Calendar remote**: Jest. Two tests — the standalone Calendar renders with mock data; clicking an appointment fires the expected callback.
- **Reports remote**: Jasmine/Karma (Angular default). One test that the dashboard component renders three cards.
- **Integration**: a Playwright spec that runs against the deployed Azure SWA URLs, logs in via the host UI, navigates to /calendar, navigates to /reports, asserts content from both remotes is visible. **This is the test that proves MF actually works end-to-end.** Run it as the last step of the host pipeline.

---

## 10. README — Outline

Mirrors the API Perf Lab style. Lead with proof.

1. **One-line pitch**: "Cross-framework Module Federation, three independently-deployed apps, demonstrated live."
2. **Live URLs** — the three deployed Azure SWA links above the fold.
3. **30-second video / GIF** — short capture of editing the Reports remote, pushing, and the host updating without rebuild. This is the single highest-impact asset in the repo.
4. **Architecture diagram** — three boxes, arrows showing manifest fetches, BroadcastChannel for auth. Commit it as an SVG or Mermaid.
5. **The hard parts** — the five items from section 5 above, condensed. Each links to a section in `docs/architecture.md`.
6. **Quick start** — `pnpm install`, `pnpm dev:host`, `pnpm dev:calendar`, `pnpm dev:reports`, open localhost:3000.
7. **Independent deploy demonstration** — link to `docs/independent-deploy-demo.md` with screenshots showing only one pipeline running for a remote-only change.
8. **What this isn't** — the caveats. Mock auth. Mock data. No SSR. Single-region SWA. zone.js still present in the Angular bundle.
9. **Journey notes** — link to `docs/journey.md`.

---

## 11. journey.md — Topics to Hit

These are the "interview gold" sections. Write them honestly as you go.

- **Why Rsbuild over Webpack 5 directly.** Real performance numbers from your dev loop. Cold start, HMR, prod build times.
- **The Angular interop dance.** Why Angular Elements + custom elements, not direct Angular component import. The zone.js cost. What you'd do differently with Angular 18's zoneless mode.
- **The first time you saw two Reacts in the DOM.** The hooks error, the bundle analyzer screenshot showing both Reacts, the fix.
- **The auth-via-Context trap.** Why you started with React Context across MF boundaries, why it broke independent deployability, why you moved to `BroadcastChannel`.
- **The pnpm + Rsbuild + Angular CLI integration friction.** Where Angular CLI fights monorepos. What you patched.
- **Cache invalidation on the manifest.** Azure SWA caches `mf-manifest.json` by default; you'll need a cache-busting story. Document it.
- **Bundle sizes per remote.** Numbers. Before and after the dependency-sharing config.

---

## 12. Out of Scope for v1

Park in `IDEAS.md`. Resist scope creep — this project is harder than #1 and will sprawl if you let it.

- A real backend (could point at `api-perf-lab` in v2 — fun crosslink)
- SSR / Next.js host
- A third remote (Vue or Svelte) — diminishing returns past two
- Routing federation (remotes owning their own routes)
- A11y audit and fix-up
- Theming beyond light/dark
- i18n
- E2E tests across both remotes via Playwright matrix
- Performance budgets enforced in CI
- Storybook for the design tokens
- Deploying the Angular remote with Vite/Rsbuild instead of Webpack (Angular's official tooling there is still rough)

---

## 13. Suggested Build Order

Sequence matters more here than in #1 — get blocked on the hard parts early, before you've built scaffolding around them.

1. **pnpm workspace + three empty apps** (host, calendar, reports), each running standalone in dev. Confirm Rsbuild dev server for React apps, Angular CLI dev server for the Angular app. ~half a day.
2. **Spike the Angular Elements interop first** — before any MF, before any host. Build a hello-world Angular standalone component, register it as a custom element, load the bundle from a plain HTML file, render the element. **If this works, the project is feasible. If it doesn't, you find out on day one, not week three.** This is the biggest risk-reduction step.
3. **Host shell with mock auth and routing** — Login form, AuthContext (host-local), three routes (`/`, `/calendar`, `/reports`), each rendering a placeholder div. No MF yet.
4. **Wire the React Calendar remote into the host via MF.** This is the "happy path" — both ends Rsbuild, both ends React. Get `shared: { react: singleton }` right. Bundle-analyze to confirm only one React in the host.
5. **Wire the Angular Reports remote into the host via MF.** Reuse the spike from step 2. The host loads the Angular `remoteEntry.js`, registers the custom element on first use, renders `<reports-dashboard />`.
6. **`BroadcastChannel` auth.** Login in host → both remotes update. Log out from a remote → host updates.
7. **Design tokens.** Define in host. Consume in both remotes. Add a dark-mode toggle.
8. **Mock data wired up** in both remotes so they look real, not skeletal.
9. **Provision three Azure Static Web Apps** in the portal. Grab the deployment tokens.
10. **Three Azure DevOps pipelines.** Start with one, copy it twice. Verify path filters work.
11. **Update host's MF config to point at the deployed URLs** for prod builds. Local dev still uses `localhost:3000/3001/3002`.
12. **Independent-deploy demo.** Make a trivial change to Reports (change a chart color). Push. Watch only one pipeline run. Reload host. Confirm no host rebuild was needed. Screenshot everything. This is the proof.
13. **Playwright integration test** against the deployed URLs.
14. **README + journey.md + architecture diagram.**
15. **Record the 30-second demo video/GIF** (LICEcap or ScreenToGif works).
16. **Tag v1.0.0, push, done.**

---

## 14. Definition of Done

- [ ] `pnpm install && pnpm dev` brings up all three apps locally with MF working
- [ ] All three apps deployed to Azure Static Web Apps with public URLs
- [ ] Three Azure DevOps pipelines, each triggering only on its app's path
- [ ] Independent deploy demonstrated and documented with screenshots
- [ ] BroadcastChannel auth works across both remotes
- [ ] Design tokens propagate without remote rebuild
- [ ] No "two Reacts" warnings in the host console
- [ ] Bundle analyzer screenshots committed for host, both remotes
- [ ] Playwright integration test passes against deployed URLs
- [ ] README leads with live URLs and the demo GIF
- [ ] `journey.md` is honest about the Angular interop friction
- [ ] LICENSE, topics, description, social preview image set
- [ ] Tagged v1.0.0

---

## 15. Estimated Effort

Substantially harder than #1. Honest estimate: **40–55 focused hours**, broken roughly as:

- pnpm workspace + three apps standalone: 4h
- Angular Elements spike (risk-reduction): 4h
- Host shell + mock auth + routing: 4h
- React remote via MF: 4h
- Angular remote via MF: 8h  ← this is where most of the surprise lives
- BroadcastChannel auth + design tokens: 4h
- Mock data + UI polish: 4h
- Azure SWA + pipelines: 6h
- Independent-deploy demo + screenshots: 2h
- Playwright integration test: 3h
- README + journey + architecture diagram + demo GIF: 6h

If the Angular interop spike (step 2 in build order) takes longer than 4 hours, stop and re-evaluate. Either find a fundamentally different interop approach (iframe? Web Component bundled with `@angular/elements` but loaded as a plain `<script>` tag, no MF on the Angular side?) or drop the cross-framework ambition and ship a React+React v1.

Plan across 3–4 weekends, not one.

---

## 16. Crosslinks for the Portfolio

When this is done, the two repos compose:

- `api-perf-lab` → backend perf
- `mf-demo-shell` → frontend architecture

The natural v2 of this project replaces mock data with calls to a deployed copy of `api-perf-lab`. Worth mentioning that bridge in the README as a "what's next" — signals you think about portfolio coherence, not isolated demos.
