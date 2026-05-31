# Leck CMS — Vacancies & News (setup runbook)

Lets Leck add/edit **vacancies** and **news posts** themselves. Content lives in
Sanity (free); the live site keeps its current design — a Cloudflare Worker injects
the content into the existing `/vacancies` and `/news` pages and renders article
pages server-side (so they're fully indexable + Google Jobs eligible).

**Status:** ✅ Built & verified locally on branch `feat/cms-vacancies-news`.
- Editor (Sanity Studio) scaffolded in `/studio` with Vacancy + News schemas.
- Worker (`/src`) wired into `wrangler.toml` (Project ID `mwcxu5ei` already set).
- `wrangler dev` smoke test passed: `/vacancies` + `/news` render from Sanity
  (empty-state until content is added), other pages pass through untouched,
  bad slugs 404, security headers + Sanity image CSP applied.

**Remaining (yours):** publish content in the Studio, import the news seed, then
deploy. Steps below.

---

## Step 1 — Create the Sanity project  *(only Billy can do this — critical path)*

1. Go to <https://sanity.io>, sign in (Google/GitHub) on the Layered account.
2. `cd studio && npm install`
3. `npx sanity login` then `npx sanity init --env` — choose **Create new project**,
   name it **"Leck Construction"**, dataset **`production`** (public/read).
   *(Or create the project in the web dashboard and copy its ID.)*
4. Copy the **Project ID** it gives you and paste it into **both**:
   - `studio/sanity.config.js`  → replace `REPLACE_WITH_PROJECT_ID`
   - `studio/sanity.cli.js`     → replace `REPLACE_WITH_PROJECT_ID`
5. **Send me the Project ID** — that unblocks the Worker (Step 4).

## Step 2 — Run the editor locally (optional sanity-check)

```
cd studio
npm run dev        # opens http://localhost:3333
```
You'll see **Vacancy** and **News / Newsletter** document types. Add one of each
as test content.

## Step 3 — Deploy the editor + invite Leck

```
cd studio
npx sanity deploy   # hosts the editor at https://leck-construction.sanity.studio
```
Then in <https://sanity.io/manage> → the project → **Members** → invite the Leck
staff member(s) by email (role: **Editor**). They log in at the `.sanity.studio`
URL — email + password, nothing technical.

## Step 4 — Import the existing news (so nothing is lost)

We agreed **option (a)**: `/news` shows Sanity posts, and your current example cards
are preserved as seed content. Import them once:

```
cd studio
npx sanity dataset import seed/news-seed.ndjson production
```
This creates the 7 existing posts (text + dates + categories). Open each in the Studio
and add a **cover image** (the originals were site stock photos — re-add whichever you
want). The standalone insight articles (`lime-mortar-vs-cement.html`, etc.) are left as
static pages, untouched.

## Step 5 — Deploy

Already done for you (on the branch): `wrangler.toml` now has `main = "src/index.js"`,
the `ASSETS` binding, `run_worker_first = true`, and the Sanity vars.

This Worker **deploys the normal Leck way — push to `main`** (the Cloudflare Worker
auto-builds from the connected GitHub repo; do NOT run `wrangler deploy`):

```
npm install                 # optional, only to preview locally
npx wrangler dev            # optional: preview at http://localhost:8788
# to ship:
git checkout main && git merge feat/cms-vacancies-news
git push origin main        # Cloudflare auto-builds the Worker
```
Verify at **https://leck-construction-site.billy-aspden.workers.dev/** (not
leckconstruction.co.uk — that still serves the old WordPress site until DNS cutover).

What the Worker does: intercepts `/vacancies`, `/vacancies/<slug>`, `/news`,
`/news/<slug>`; injects Sanity content into your existing pages via HTMLRewriter
(design untouched); adds `JobPosting` JSON-LD to vacancies (→ Google Jobs eligible)
and `Article` JSON-LD to news; everything else passes straight through to your static
site. If Sanity is ever unreachable, routes fall back to the static page — the site
can't go down because of the CMS.

## Step 6 — Handover

I'll record a ~5-min Loom showing Leck how to add a vacancy and a news post, set the
cover image, and publish. Publishing is live within ~1 minute.

---

### Notes
- **Cost:** £0/month on Sanity's free tier at this volume.
- **Security:** the Worker reads only *published* content via Sanity's public read API
  (server-side, no tokens in the browser). No new attack surface on the contact form.
- `studio/` is **not** deployed with the site (only `public/` is served) — it's a
  separate editor app.
