# Independent deploy — demonstrated

The point of this repo: a remote can ship without rebuilding or redeploying
its consumers. Most cross-framework Module Federation tutorials don't
*demonstrate* this property — they just claim it. This page shows it on real
infrastructure.

## Setup

| App      | Stack                | Azure SWA                                                 |
| -------- | -------------------- | --------------------------------------------------------- |
| host     | React 18 + Rsbuild   | `https://nice-flower-030343610.7.azurestaticapps.net`     |
| calendar | React 18 + Rsbuild   | `https://witty-river-02c1eea10.7.azurestaticapps.net`     |
| reports  | Angular 17 + Webpack | `https://lively-flower-0bdc24110.7.azurestaticapps.net`   |

Three Azure DevOps pipelines, one per app, each with a `paths.include` filter
that scopes it to its own app folder plus shared packages.

## The experiment

A single change to the Reports remote: bump four dashboard stat values.

```diff
- { title: 'Revenue this week', value: '$12,840', delta: '+8.2%',   ... },
- { title: 'No-show rate',      value: '3.4%',    delta: '-0.6 pp', ... },
- { title: 'Top staff',         value: 'Casey',   delta: '92% util',... },
- { title: 'Avg ticket',        value: '$68.40',  delta: '+4.1%',   ... },
+ { title: 'Revenue this week', value: '$13,420', delta: '+12.7%',  ... },
+ { title: 'No-show rate',      value: '2.9%',    delta: '-1.1 pp', ... },
+ { title: 'Top staff',         value: 'Alex',    delta: '94% util',... },
+ { title: 'Avg ticket',        value: '$71.20',  delta: '+8.2%',   ... },
```

Commit message: see commit
[`7130b42`](../../../commit/7130b42fcf051795a98e8d3304972eefb17335f5)
("chore(reports): bump demo stats — independent deploy demo trigger").
One file changed, four lines.

## What the screenshots show

### 1. The commit diff (one file, one app)

![diff screenshot](screenshots/01-commit-diff.png)

`git diff --stat` after the change:

```
apps/reports-remote/src/app/reports-dashboard.component.ts | 8 ++++----
1 file changed, 4 insertions(+), 4 deletions(-)
```

Zero touches outside `apps/reports-remote/`.

### 2. Azure DevOps Pipelines list — only one ran

![pipelines list screenshot](screenshots/02-pipelines-only-reports.png)

In the Pipelines view, only `mf-demo-shell-reports` shows a run for this
commit. `mf-demo-shell-host` and `mf-demo-shell-calendar` did not trigger
— their path filters didn't match anything in the commit.

### 3. The reports pipeline succeeded

![reports pipeline succeeded](screenshots/03-reports-pipeline-success.png)

Steps: install Node, install pnpm, install workspace deps, build
reports-remote, deploy to `mf-demo-reports` SWA via `AzureStaticWebApp@0`.

### 4. The host bundle hash is unchanged

Before:
```
GET https://nice-flower-030343610.7.azurestaticapps.net/static/js/index.<HASH_A>.js
```

After the reports deploy:
```
GET https://nice-flower-030343610.7.azurestaticapps.net/static/js/index.<HASH_A>.js
```

Identical content hash — the host bundle on the SWA is the byte-for-byte
same file. Confirming no host rebuild happened.

### 5. The reports dashboard shows the new numbers

Before:

![host /reports before](screenshots/04-host-before.png)

After (hard refresh of `/reports`):

![host /reports after](screenshots/05-host-after.png)

The host fetched the new Angular bundle from the reports SWA on next page
load — no host code was modified, no host bundle was rebuilt, no host
deployment ran.

## Why this works

1. **Path-filtered pipelines** (see `pipelines/azure-pipelines.*.yml`):
   only the pipeline whose `paths.include` matches the commit gets queued.
2. **Cache-Control: no-store** on the reports producer's `main.js` and
   `polyfills.js` (set via `apps/reports-remote/public/staticwebapp.config.json`):
   the Azure SWA edge serves the new bytes the moment the deploy completes.
3. **The host script-injects** `reports-remote/main.js + polyfills.js`
   from the producer's URL on first visit to `/reports`. With no-store
   headers, each visit gets the producer's latest publish.

The same property holds for the React Calendar remote — that one goes
through proper Module Federation manifest resolution and the host fetches
`mf-manifest.json` fresh on each page load (also no-store), then loads
the chunks listed in it from `https://witty-river-...`.

## What this *doesn't* prove

- **Backwards compatibility.** Bumping a stat value is shape-compatible.
  Changing the exposed component's *props* would break the host until a
  host rebuild — that's a contract change, not a deploy change. The
  `@mf-demo/contracts` package is where TypeScript catches those before
  they ship.
- **Atomicity across multiple remotes.** Each remote redeploys
  independently; there's no transaction. A breaking change in calendar +
  reports together needs two pipeline runs and is observable as
  partially-deployed for a moment.

Honest scope: one remote, one shape-compatible change, captured live.
