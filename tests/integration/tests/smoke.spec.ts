import { test, expect } from '@playwright/test';

// One end-to-end happy path that exercises everything cross-origin:
//   - the host shell loads
//   - mock auth via the host's /login form
//   - the React Calendar remote loads over Module Federation and renders
//   - the calendar's "Sign out (from calendar)" button drives the host's
//     auth state via BroadcastChannel — proves remote → host flow
//   - the Angular Reports remote loads via Angular Elements bridge and renders
// If any link in that chain breaks, the host can no longer compose; this
// spec catches it.

test.describe('mf-demo-shell — cross-framework MF + Angular Elements', () => {
  test('host composes both remotes after sign-in', async ({ page }) => {
    // 1. Home page loads (host shell only — no remotes yet).
    await page.goto('/');
    await expect(page).toHaveTitle(/MF Demo/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 2. Sign in via /login.
    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Header user chip flips to authed state.
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();

    // 3. /calendar — React Calendar remote loaded via Module Federation.
    await page.goto('/calendar');
    await expect(page.locator('.cal-grid')).toBeVisible({ timeout: 20_000 });

    const appts = page.locator('.cal-appt');
    await expect(appts.first()).toBeVisible();
    expect(await appts.count()).toBeGreaterThan(0);

    // Clicking an appointment opens the host-owned side panel — proves
    // callbacks cross the MF boundary intact.
    await appts.first().click();
    await expect(page.locator('.appt-panel')).toBeVisible();

    // 4. Cross-remote auth: the calendar remote's "Sign out (from calendar)"
    // button posts auth:logout over BroadcastChannel; the host listens and
    // flips its header from "Log out" back to "Sign in" without any remote
    // → host React wiring. Done from /calendar (still authed) before the
    // route guard redirects us anywhere.
    await page.getByRole('button', { name: /sign out \(from calendar\)/i }).click();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();

    // 5. Sign back in for the reports check.
    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();

    // 6. /reports — Angular Reports remote loaded as a custom element.
    await page.goto('/reports');

    // The custom element gets defined after the bundle finishes loading.
    await expect(page.locator('reports-dashboard')).toBeAttached({ timeout: 30_000 });

    // Inside the custom element, the Angular dashboard renders at least
    // three chart cards.
    const cards = page.locator('reports-dashboard .card');
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(3);

    // The Angular bridge subscribed to the same BroadcastChannel and
    // reads the host's auth state — proves the channel reached Angular too.
    await expect(page.locator('reports-dashboard')).toContainText(/viewing as/i);
  });
});
