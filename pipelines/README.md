# Pipelines

Three near-identical Azure DevOps pipelines, one per app. Each triggers only on
changes inside its app folder (plus shared deps), so a commit touching only
`apps/reports-remote/` rebuilds *only* the reports pipeline — the headline
property of this whole repo.

## Pipeline variables

Set these in Azure DevOps → Pipelines → *each pipeline* → Edit → Variables.
Mark every `*_TOKEN` value as **Keep this value secret**. The `PUBLIC_*_URL`
values are not secrets and can be plain variables.

| Variable                       | Required by         | Where to find it                                            |
| ------------------------------ | ------------------- | ----------------------------------------------------------- |
| `HOST_SWA_TOKEN`               | host pipeline       | Azure portal → `mf-demo-host` SWA → Manage deployment token |
| `CALENDAR_SWA_TOKEN`           | calendar pipeline   | Azure portal → `mf-demo-calendar` SWA → Manage deployment token |
| `REPORTS_SWA_TOKEN`            | reports pipeline    | Azure portal → `mf-demo-reports` SWA → Manage deployment token |
| `PUBLIC_CALENDAR_REMOTE_URL`   | host + calendar pipelines | The Calendar SWA's *defaultHostname* with `https://` prefix. The host uses it to find the calendar; the calendar uses it as its own assetPrefix so MF-manifest URLs are absolute. |
| `PUBLIC_REPORTS_REMOTE_URL`    | host pipeline       | The Reports SWA's *defaultHostname* with `https://` prefix  |
| `PUBLIC_HOST_URL`              | host pipeline       | The Host SWA's *defaultHostname* with `https://` prefix. Used by the post-deploy Playwright smoke test that runs against the live deployed host. |

## URLs (this deployment)

| App      | URL                                                          |
| -------- | ------------------------------------------------------------ |
| host     | `https://nice-flower-030343610.7.azurestaticapps.net`        |
| calendar | `https://witty-river-02c1eea10.7.azurestaticapps.net`        |
| reports  | `https://lively-flower-0bdc24110.7.azurestaticapps.net`      |

## How the path filters defend independent deploy

```yaml
# host pipeline
paths:
  include:
    - apps/host/**
    - packages/contracts/**
    - packages/design-tokens/**
    - pipelines/azure-pipelines.host.yml
    - pnpm-lock.yaml
    - pnpm-workspace.yaml
```

- A commit touching only `apps/reports-remote/chart-card.component.ts` matches
  *only* the reports pipeline's filter → host and calendar pipelines do not
  run → no host/calendar rebuild → the host bundle on the SWA is unchanged.
- A commit touching `packages/contracts/` matches all three filters → all
  three rebuild (correct: a type change can affect any consumer).
- A commit touching `pnpm-lock.yaml` matches all three filters (a dependency
  graph change can affect any build).
