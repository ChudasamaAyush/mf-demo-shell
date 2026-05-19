# Journey notes

Honest field notes from building this. Skips the easy parts; lingers on the surprising ones.

## Step 2 — the Angular Elements interop spike

**Why this came first.** Spec section 5.2 and section 13 step 2 both flag this as the
single biggest risk: if Angular can't be made to render usefully outside of an Angular
host, the whole cross-framework premise collapses. So we proved it works before writing
a single line of MF wiring.

**The result.** Build-order step 2 cleared in under an hour. A React host can consume
the Reports remote as `<reports-dashboard />` exactly the way it would consume any other
custom element — there is no special "Angular bridge" required at runtime.

**Time spent vs. budget.** Spec budget: 4h. Actual: ~1h. The Angular 17 standalone API
makes this dramatically less ceremonial than the Angular 14-era tutorials suggest. No
NgModules, no `enableProdMode()`, no platformBrowserDynamic.

### The bootstrap

`apps/reports-remote/src/main.ts`:

```ts
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ReportsDashboardComponent } from './app/reports-dashboard.component';

createApplication({ providers: [] })
  .then((app) => {
    const element = createCustomElement(ReportsDashboardComponent, {
      injector: app.injector,
    });
    customElements.define('reports-dashboard', element);
  })
  .catch((err) => console.error('[reports-remote] bootstrap failed', err));
```

That's the whole thing. Key points:

- **`createApplication`, not `bootstrapApplication`.** The latter wants a root component
  to attach to a DOM node; we don't have one. `createApplication` gives us back an
  `ApplicationRef` whose `injector` we hand to `createCustomElement`.
- **No `<app-root>` anywhere.** The Angular CLI scaffold creates one by default; we
  deleted `AppComponent` and `app.config.ts` outright once the spike was working. The
  remote's entire job is to register a custom element — there's no "Angular app" left
  to host anything else.
- **The component selector still says `reports-dashboard`.** Angular's selector lives
  in a different registry than the browser's `customElements`, so there's no collision.
  Could rename to avoid future confusion; left as-is for now since the names match by
  intent.

### The zone.js cost

Spec section 5.2 calls this out — Angular 17 still ships with zone.js by default and
that is a fixed cost the host bundle pays once. Production build numbers:

| Chunk        | Raw     | Gzipped |
| ------------ | ------- | ------- |
| `main`       | 121.55 kB | 35.65 kB |
| `polyfills`  |  33.71 kB | 11.02 kB |
| **Total**    | **155.26 kB** | **46.67 kB** |

The polyfills chunk *is* zone.js. ~11 kB gzipped on top of the Angular runtime itself
is the price of cross-framework interop in v1. Angular 18's zoneless mode would shave
this; not worth chasing for v1.

### The plain-HTML spike host

To prove this works outside Angular's own dev server, the build output is served as a
static site and loaded from a hand-written HTML file:

- `apps/reports-remote/dist/reports-remote/browser/spike-host.html` — points at the
  hashed bundle filenames from the most recent build.
- `docs/spike/element-host.template.html` — the long-lived template; regenerate the
  built copy after each prod build by substituting the new bundle hashes.

Probe results from `npx http-server` on port 4000:

```
200    2304 bytes  /spike-host.html         # plain HTML, no Angular CLI runtime
200  124472 bytes  /main-XXXXXXXX.js        # contains customElements.define('reports-dashboard', ...)
200   34519 bytes  /polyfills-XXXXXXXX.js   # zone.js + friends
```

The page shows three `<chart-card>` instances laid out by `ReportsDashboardComponent`
and reports `customElements.get("reports-dashboard")` resolved within a few hundred ms.

### What this unblocks

Steps 4 and 5 of the build order. The React host's `ReportsRemote.tsx` will:

1. Dynamic-`import()` the Angular bundle (via MF when it's wired; via plain
   `<script>` injection until then).
2. Wait one tick for the bundle to call `customElements.define`.
3. Render `<reports-dashboard />` in JSX. React treats it as an unknown HTML element
   and leaves it alone — the browser hands rendering off to the registered custom
   element. Props become attributes/properties; events come back as `CustomEvent`s.

The whole point of the spike was to confirm that step 3 is uneventful, and it is.

### Gotcha that cost ten minutes: `type="module"`

The Angular 17 application builder emits ES modules. If you load them with plain
`<script src="...">`, the browser parses them as classic scripts, and zone.js
explodes in `scheduleMicroTask` with:

```
Uncaught TypeError: ce[T] is not a function
Uncaught TypeError: Class constructor Ke cannot be invoked without 'new'
```

That second error is the giveaway — ESM class syntax interpreted as a classic
script. Angular's own emitted `index.html` already uses `type="module"`; any
hand-written host page that loads the same bundles must do the same:

```html
<script type="module" src="./polyfills-XXXX.js"></script>
<script type="module" src="./main-XXXX.js"></script>
```

Worth pinning in the React-host integration plan: when `ReportsRemote.tsx` injects
the bundle via dynamic `import()` (the MF path), the loader treats it as ESM
automatically and this gotcha goes away. The risk is anyone who tries to load it
via plain `<script>` injection later.

### What we did *not* test in the spike

- **Cross-origin loading.** The spike serves bundle and host page from the same origin.
  Once each app is on its own Azure SWA URL, the host will fetch the Angular bundle
  from a different origin; CORS on the SWA static asset response is the thing to
  re-verify in step 11.
- **Multiple Angular bundles.** v1 only has one. If a future v2 ships a second Angular
  remote, zone.js singleton management becomes a real consideration.
- **Lazy attribute/property passing.** Inputs flow through fine for the static
  dashboard; passing rich objects (not just strings) into the element from React
  will need property-assignment (not attribute-assignment) and is worth one
  follow-up smoke test once `ReportsRemote.tsx` exists.
