# PostHog Setup & Dashboard — TC8 Analytics

This guide walks through wiring PostHog into ReLoop, deploying it to
Vercel, and building the three core dashboard panels needed for the
Chung kết TC8 analytics scorecard.

---

## 1. Create the PostHog project

1. Go to [posthog.com](https://posthog.com) → sign up (Free tier is fine
   for the demo; 1M events / month included).
2. Create a new project named `ReLoop`.
3. From **Project settings → Project API key**, copy:
   - **Project API key** (starts with `phc_…`) — public, ships in the
     browser bundle.
   - **API host** — usually `https://us.i.posthog.com` for US cloud or
     `https://eu.i.posthog.com` for EU cloud. Pick EU if your demo
     audience cares about EU residency (it does — VinUni jurors).

> EU residency: pick the EU cloud and update `NEXT_PUBLIC_POSTHOG_HOST`
> accordingly. Do NOT mix regions; analytics will silently drop.

## 2. Set Vercel environment variables

In **Vercel → Project Settings → Environment Variables**, add (for all
environments — Production, Preview, Development):

| Key                          | Value                                | Notes                                                   |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`    | `phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Project API key                                         |
| `NEXT_PUBLIC_POSTHOG_HOST`   | `https://eu.i.posthog.com`           | Region host                                             |
| `POSTHOG_WEBHOOK_SECRET`     | (optional) random 32-char string     | Required if you wire the `/api/webhooks/posthog` route. |

Redeploy. Both vars are picked up by `lib/analytics.ts` automatically.

## 3. Verify in production

1. Open the deployed site in an Incognito window.
2. Click **Đồng ý** on the cookie banner.
3. Trigger a few actions: scan an image, pin a point, click a hero CTA.
4. In PostHog **Activity → Live**, watch events stream in real time.

You should see at minimum: `$pageview`, `cta_clicked`, `scan_started`,
`scan_success`, `point_pinned`. If `signup_completed` is missing,
re-check the auth callback route is hit (server-side event).

## 4. Build the three required dashboards

PostHog → **Dashboards → New dashboard → ReLoop Core**.

### Panel 1 — DAU (Daily Active Users)

- Insight type: **Trends**
- Series: **Unique users** of `$pageview`
- Interval: **Daily**
- Date range: **Last 30 days**
- Title: `DAU — Daily Active Users`

### Panel 2 — Conversion Funnel

- Insight type: **Funnels**
- Steps:
  1. `scan_started`
  2. `scan_success`
  3. `listing_created`
- Conversion window: **7 days**
- Date range: **Last 30 days**
- Title: `Funnel: Scan → Success → Listing`

This is the headline funnel for TC8: shows how many scans become
real listings inside a week.

### Panel 3 — Top events 7d

- Insight type: **Trends**
- Series: **Total count** of:
  - `$pageview`
  - `signup_completed`
  - `scan_success`
  - `listing_created`
  - `point_pinned`
  - `vote_cast`
  - `badge_unlocked`
  - `cta_clicked`
  - `share_clicked`
- Interval: **Daily** (or weekly for cleaner bars)
- Date range: **Last 7 days**
- Visualization: **Bar chart**
- Title: `Top events — last 7 days`

Optional bonus panels (recommended but not required):

- **Retention** — Cohort: signed up this week, returning event:
  `scan_started`. Lifecycle 0–7 days.
- **Material distribution** — Trends, breakdown by `material_code`
  property on `scan_success`.

## 5. Mirror to Postgres `analytics_events`

Two pipelines write into `analytics_events`:

1. **Server-side (default):** `trackServer()` in `lib/analytics.ts`
   captures to PostHog AND inserts into `analytics_events` directly via
   the service-role admin client. Always-on, no PostHog plan required.
2. **Webhook (optional, paid plan):** Configure PostHog → Project
   Settings → Webhooks → POST destination
   `https://reloop.vercel.app/api/webhooks/posthog`. Add `Authorization:
   Bearer <POSTHOG_WEBHOOK_SECRET>` header. The route handler in
   `app/api/webhooks/posthog/route.ts` validates and inserts.

For MVP we ship pipeline #1 because pipeline #2 needs a PostHog paid
tier. Browser-side events (`$pageview`, `cta_clicked`,
`listing_viewed`, `share_clicked`) only land in PostHog unless the
webhook is wired.

Admin UI can read the table via `is_admin()`-gated SELECT (see
`supabase/migrations/0001_init.sql`).

## 6. EU cookie consent

The `<CookieBanner />` mounted in `app/layout.tsx` defaults to **opt-out**
until the user clicks **Đồng ý**. PostHog respects `opt_out_capturing()`
client-side, so until consent we capture nothing in the browser.

Server-side `trackServer()` still fires (legitimate-interest analytics
on the operator's own backend), but browser fingerprinting is gated.

## 7. Smoke test checklist

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set in Vercel
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` set in Vercel
- [ ] Cookie banner shows on first visit (incognito)
- [ ] After `Đồng ý` → `$pageview` event in PostHog Live
- [ ] After `Từ chối` → no events in PostHog Live
- [ ] `cta_clicked` fires when clicking hero buttons
- [ ] `scan_success` fires after analyzing an image
- [ ] `listing_created` fires after submitting a listing
- [ ] `point_pinned` fires after pinning a collection point
- [ ] `vote_cast` fires after voting on a point
- [ ] `badge_unlocked` fires when a new badge is earned
- [ ] `signup_completed` fires after Google OAuth callback
- [ ] DAU dashboard shows the smoke-test traffic
- [ ] Funnel dashboard shows scan→success conversion
