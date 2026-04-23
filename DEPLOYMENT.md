# Deployment guide

This project ships with TWO compatible deployment paths.

## 1. Lovable (current, zero-config)

Click the **Publish** button in the Lovable editor. Hosting, SSR, edge functions
and the database are wired automatically. Use this for staging and rapid iteration.

## 2. Vercel (self-hosted production)

The project is structured to be exportable to Vercel without code changes.

### One-time setup

1. Push the repo to GitHub.
2. In Vercel, **Import Project** from your GitHub repo.
3. Framework preset: **Other**. Vercel will use `vercel.json` from the repo.
4. Add the following **Environment Variables** in *Project → Settings → Environment Variables*:

   | Name | Required | Notes |
   | --- | --- | --- |
   | `VITE_SUPABASE_URL` | yes | Public Supabase URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | Public anon/publishable key |
   | `VITE_SUPABASE_PROJECT_ID` | yes | Supabase project ref |
   | `VITE_CLOUDINARY_CLOUD_NAME` | optional | Defaults to bundled value |
   | `VITE_CLOUDINARY_UPLOAD_PRESET` | optional | Defaults to `aexis_unsigned` |
   | `RAZORPAY_KEY_ID` | yes | Razorpay key id (test or live) |
   | `RAZORPAY_KEY_SECRET` | yes | Razorpay key secret |
   | `RAZORPAY_WEBHOOK_SECRET` | yes | Random strong string used to sign webhooks |

5. Configure Razorpay webhook to point at:
   `https://<your-domain>/api/public/razorpay-webhook`

### Cloudinary upload preset

Cloudinary is the file storage layer (images, videos, KYC docs). Uploads use an
**unsigned** preset, so the API secret never ships to the browser.

1. Sign in to the Cloudinary dashboard.
2. Go to *Settings → Upload → Upload presets → Add upload preset*.
3. **Signing Mode = Unsigned**.
4. (Recommended) Folder = `aexis`, **Use filename = false**, **Unique filename = true**.
5. Save the preset name and use it as `VITE_CLOUDINARY_UPLOAD_PRESET`
   (default expected by the code is `aexis_unsigned`).

### Notes for Vercel

- The bundled `vercel.json` adds an SPA fallback rewrite so client-side routes
  (e.g. `/marketplace`, `/listing/foo`) don't 404 on direct visits.
- TanStack Start's standard Vite build emits to `.output/public`, which Vercel
  serves as static + SSR functions automatically.
- The Cloudflare worker config (`wrangler.jsonc`) is only used when deploying
  through Lovable; Vercel ignores it.

## Switching between hosts

No code changes are needed. Both `wrangler.jsonc` (Lovable) and `vercel.json`
(Vercel) live side-by-side and only the active host reads its own file.