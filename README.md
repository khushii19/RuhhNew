# Ruhh — Home bakery ordering app

Storefront, checkout and admin panel for **Ruhh**, Shweta's home bakery in Dubai.
Customers browse the menu, build mix-and-match boxes, pick a delivery area and
time, and place an order that is saved to the database and handed to WhatsApp.
Shweta manages orders, menu, specials, delivery areas, custom-cake enquiries
and reviews from `/admin`.

Built with **Next.js 16 · TypeScript · Tailwind v4 · Supabase (Postgres, Auth,
Storage)**, deployed on **Vercel**. Optional **WhatsApp Business Cloud API**
integration for automated status messages.

---

## Features

**Customer**
- Home with weekly specials, about, reviews, WhatsApp chat
- Menu with search, category filters, photos, serving sizes, flavours and
  "mix your box" (split a box of N across flavours)
- Cart persisted in the browser; prices always re-validated on the server
- Checkout: delivery by area (fee + minimum) or free pickup, date picker that
  respects per-category lead time, closed days and a daily order cap, time
  slots, gift card, special requests, cash or bank transfer
- Order saved with a unique reference (`RUH-1001`, …) then WhatsApp opens with
  the full order pre-filled for the customer to send
- Track: live status by order reference + phone, with history
- Custom cake enquiry form, reviews (moderated), Instagram link, PWA install

**Admin** (`/admin`, magic-link login, multiple admins)
- Orders board with filters, search, one-click status progression and payment
  status; customers get a WhatsApp message on each status change when the API
  is configured
- Menu items with sizes, flavours, mixable flag, photo upload, show/hide
- Categories with lead times, weekly specials, delivery areas
- Custom-cake enquiries, review moderation, admins
- Settings: brand, WhatsApp number, pickup address, bank details, slots,
  closed days/dates, daily cap, default lead time, free-delivery threshold, logo

---

## 1. Create the Supabase project

1. Go to <https://supabase.com>, create a project (free tier is fine). Pick a
   region close to Dubai (e.g. Mumbai or Frankfurt).
2. Open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_photos_featured.sql`
   - `supabase/migrations/0003_operations.sql`
   - `supabase/migrations/0004_allergens.sql`
   - `supabase/seed.sql` — **first edit the last statement** to Shweta's real
     email (the first admin), and optionally the WhatsApp number / Instagram /
     pickup address in the first `update settings` block.
3. **Authentication → URL configuration**: set *Site URL* to your production
   URL and add `https://<your-domain>/auth/callback` (and
   `http://localhost:3000/auth/callback` for local dev) to *Redirect URLs*.
4. **Authentication → Email templates → Magic Link**: make sure the link uses
   `{{ .ConfirmationURL }}` (default). Email sign-in must be enabled (default).
5. **Project settings → API**: copy the *Project URL*, *anon public* key and
   *service_role* key for the next step.

The seed also sets a launch photo on every menu item, the two specials, the
home hero and the about section. These are AI-generated placeholders hosted by
Porter Metrics. After deploying, press **Bring photos in-house** in
Admin → Settings once: it copies them into your own Supabase storage at web
size so the site never depends on another service. Replace any of them with
real photography from **Admin → Menu** and **Admin → Settings** as it becomes
available.

**Email deliverability.** Supabase's built-in email sender is rate-limited and
often lands in spam. Before launch, set a custom SMTP provider under
Authentication → SMTP settings (Resend, Postmark or similar) so magic links
arrive reliably.

The migration creates all tables, the `media` storage bucket, and row-level
security so the public key can only read storefront data. All writes go
through the server with the service-role key.

## 2. Deploy to Vercel

There is also a manual GitHub Actions workflow, `.github/workflows/deploy.yml`,
for deploying without the dashboard integration. It needs a `VERCEL_TOKEN`
repository secret and reads the app variables from secrets of the same names;
see `docs/DEPLOY_CHECKLIST.md` section 2A.

1. Push this repo to GitHub (already done if you are reading this there).
2. <https://vercel.com/new> → import the repo. Framework is auto-detected.
3. Add the environment variables from `.env.example`:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only) |
   | `NEXT_PUBLIC_SITE_URL` | `https://<project>.vercel.app` (update after adding a domain) |
   | `ADMIN_EMAILS` | Shweta's email (bootstrap admin; more can be added in the panel) |

   Optional but recommended:

   | Variable | Value |
   |---|---|
   | `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_ALERT_EMAIL` | Email alert to Shweta for every new order and enquiry (free Resend account, verified sender) |
   | `CRON_SECRET` | Any long random string; protects the daily keep-alive endpoint |

4. Deploy. Open `https://<project>.vercel.app/admin`, enter the admin email,
   click the magic link from the email, and you are in. The orders board shows
   a **launch checklist** until every setup item is done.

**Which branch deploys.** The repository's default branch is currently
`claude/boutique-bakery-app-plan-8f3h8z`, so Vercel deploys from it. Rename or
merge it to `main` whenever convenient and update Vercel's production branch.

**Plans.** Vercel's free Hobby plan is licensed for non-commercial use; a shop
taking orders should be on Pro. Supabase's free tier pauses projects after a
week without activity; the daily keep-alive cron in `vercel.json` prevents
that, but the Pro plan also adds daily backups.

**Abuse protection.** Order, enquiry and review endpoints are rate-limited per
IP and carry honeypot fields. For stronger protection enable Vercel Firewall
rules or Attack Challenge Mode in the Vercel dashboard.
5. In **Admin → Settings** enter the real WhatsApp number, pickup address and
   bank details. In **Admin → Menu** set the Chocolate Bark prices and switch
   them to visible.

Every push to the main branch redeploys automatically. Preview URLs are
created for other branches.

### Custom domain (later)
Vercel → Project → Settings → Domains → add the domain and follow the DNS
instructions. Then update `NEXT_PUBLIC_SITE_URL` and the Supabase redirect
URLs.

## 3. WhatsApp Business Cloud API (optional)

The app works without this: every order and enquiry opens WhatsApp with a
pre-filled message the customer sends themselves. The API adds **automatic
messages from the bakery** (order received, confirmed, baking, on the way…)
and a log of messages per order in the admin.

1. Create a Meta Business account and a Meta app with the *WhatsApp* product
   (<https://developers.facebook.com>). Complete business verification and add
   the bakery's phone number (it cannot be a number currently used in the
   regular WhatsApp app unless you migrate it).
2. From *WhatsApp → API setup* copy the **Phone number ID** and create a
   **permanent access token** (System user with `whatsapp_business_messaging`
   permission).
3. Create two **message templates** (WhatsApp → Manage templates), category
   *Utility*, language English, and wait for approval:
   - `ruhh_order_received` — body:
     `Hi {{1}}, thanks for your order {{2}} with Ruhh! Total {{3}}. We'll confirm shortly.`
   - `ruhh_order_status` — body:
     `Hi {{1}}, an update on your Ruhh order {{2}}: {{3}}. Reply here if you have any questions.`
4. Set the environment variables in Vercel and redeploy:

   ```
   WHATSAPP_ACCESS_TOKEN=...
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_VERIFY_TOKEN=<any long random string>
   WHATSAPP_APP_SECRET=<Meta app secret, for webhook signature checks>
   WHATSAPP_ORDER_TEMPLATE=ruhh_order_received
   WHATSAPP_STATUS_TEMPLATE=ruhh_order_status
   WHATSAPP_TEMPLATE_LANG=en
   WHATSAPP_OWNER_ALERT_NUMBER=9715xxxxxxxx   # optional: Shweta's personal number for new-order pings
   ```

5. Webhook: in the Meta app, *WhatsApp → Configuration*, set the callback URL
   to `https://<your-domain>/api/whatsapp/webhook` with the same verify token,
   and subscribe to `messages`. Inbound messages and delivery statuses are then
   logged against orders.

Without templates configured the app falls back to free-form text, which
WhatsApp only delivers inside the 24-hour window after the customer last
messaged the bakery (which they do when they send the order).

## 4. Payments

Launches with **cash on delivery/pickup** and **bank transfer** (details shown
after ordering and included in the WhatsApp message). The order model already
carries `payment_method` / `payment_status`, so a card gateway can be added
later without schema changes:

- **Ziina** or **Tap** — UAE-focused, quick onboarding for small businesses.
- **Stripe** — needs a UAE trade licence for a UAE account.

Either would be wired in as a redirect from the checkout after the order is
saved, with a webhook marking `payment_status = 'paid'`.

## Dark mode

The site follows the visitor's system preference and offers an Auto / Light /
Dark switch in the footer. Everything is driven by colour tokens, so both
themes stay in sync automatically; the logo swaps to a light-on-dark variant.

## Local development

```bash
cp .env.example .env.local   # fill in Supabase values
npm install
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + unit tests
```

Fonts are loaded with `next/font` at build time, so the build needs network
access to Google Fonts.

Without Supabase variables the storefront renders with an empty menu and the
admin shows a configuration notice, which is enough to work on the UI.

## Project layout

```
supabase/            SQL migration + seed (real menu, delivery areas, settings)
src/app/(site)/      customer pages: home, menu, order, track, custom-cakes, reviews
src/app/admin/       admin panel (login outside the guarded (panel) group) + server actions
src/app/api/         orders, order lookup, enquiries, reviews, WhatsApp webhook
src/components/      UI (customer + admin/*)
src/lib/             data loaders, order pricing/validation, availability rules,
                     WhatsApp client, auth guard, Supabase clients
src/proxy.ts         refreshes the admin auth cookie on /admin and /auth routes
tests/               unit tests (vitest)
prototype/           the original single-file prototype, for reference
docs/PLAN.md         audit of the prototype and the build plan
```

## Security notes

- The browser only ever holds the Supabase *anon* key; RLS limits it to
  reading available menu items, active specials/zones, settings and approved
  reviews. Orders, enquiries, admin tables and the WhatsApp log are
  server-only.
- Prices, sizes, flavours, mix counts, dates, closed days, daily cap and
  delivery fees are all re-computed from the database when an order is placed.
- Admin routes and every server action call `requireAdmin()`; admins are the
  `admin_users` table plus the `ADMIN_EMAILS` variable. Magic links are only
  sent to admin emails.
- Webhook posts are verified with the Meta app secret (`X-Hub-Signature-256`).
