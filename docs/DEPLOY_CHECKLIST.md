# First deploy checklist

Work through these in order. Each step says what you should see when it worked.
Expect about an hour end to end.

## 1. Supabase (database, login, photo storage)

- [ ] Sign in at https://supabase.com and create a project. Name: `ruhh`. Region: Mumbai or Frankfurt. Save the database password somewhere safe.
- [ ] Open **SQL Editor → New query**. Paste the contents of `supabase/migrations/0001_init.sql`, run it. You should see "Success. No rows returned".
- [ ] Repeat for `supabase/migrations/0002_photos_featured.sql`, then `supabase/migrations/0003_operations.sql`.
- [ ] Open `supabase/seed.sql`. On the last lines, replace `shweta@example.com` with Shweta's real email. Paste and run. You should see rows returned for the `seed_item` calls.
- [ ] **Authentication → URL Configuration**: set *Site URL* to your Vercel URL (you will have it after step 2; come back and fill it in), and add `https://<your-vercel-url>/auth/callback` to *Redirect URLs*.
- [ ] **Authentication → Providers → Email**: confirm Email is enabled. Leave "Confirm email" on.
- [ ] Recommended: **Authentication → SMTP Settings** and connect a sender (Resend or Postmark) so sign-in emails arrive reliably.
- [ ] **Project Settings → API**: copy *Project URL*, *anon public* key and *service_role* key.

## 2. Vercel (hosting)

- [ ] Sign in at https://vercel.com, **Add New → Project**, import `dgtldubai4-Create/Ruhh`.
- [ ] Under *Environment Variables*, add:
  - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
  - `NEXT_PUBLIC_SITE_URL` = the URL Vercel will give you, e.g. `https://ruhh.vercel.app` (edit after the first deploy if it differs)
  - `ADMIN_EMAILS` = Shweta's email
  - `CRON_SECRET` = any long random string
- [ ] Optional now, recommended before launch: `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_ALERT_EMAIL` for order alerts.
- [ ] Click **Deploy**. Wait for the green tick. Open the URL: the home page should load with the arch hero and photos.
- [ ] Go back to Supabase step 5 and enter this URL if you have not already.
- [ ] Plan: a shop taking orders should be on Vercel Pro. The Hobby plan is for non-commercial use.

## 3. First sign-in and setup

- [ ] Open `https://<your-url>/admin`. Enter Shweta's email. Click the link in the email. You should land on the orders board with a **Launch checklist** box at the top.
- [ ] **Settings**: WhatsApp number (digits, starting 971), pickup address, bank transfer details, closed days, time slots. Save.
- [ ] **Settings → Bring photos in-house**: click once and wait. It should end with "Imported 21 photos into your own storage."
- [ ] **Menu**: open each Chocolate Bark item, enter prices, tick "Visible to customers", save.
- [ ] **Admins**: add a second admin if wanted.
- [ ] The Launch checklist box should now be gone from the orders board.

## 4. Test an order end to end

- [ ] On your phone, open the site, add a cookie box (mix six pieces) and a cheesecake, go to Order, fill your own details, place the order. WhatsApp should open with the order text.
- [ ] In the admin, the order appears at the top as "Received". Click **→ Confirmed**, then **→ Baking**.
- [ ] On your phone, open Track, enter the reference and your number. The steps should show Baking as current.
- [ ] Cancel the test order from the admin so it does not count as revenue.

## 5. Optional, after launch

- [ ] Custom domain: Vercel → Settings → Domains. Then update `NEXT_PUBLIC_SITE_URL` and the Supabase redirect URLs.
- [ ] WhatsApp Business API: see README section 3. Needs a number that is not used in the regular WhatsApp app.
- [ ] Card payments: Ziina or Tap. See README section 4.
- [ ] Supabase Pro for daily backups.
