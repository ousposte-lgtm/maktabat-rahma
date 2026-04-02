# 🚀 Hosting Guide — Maktabat Rahma

Your app is a static React/Vite SPA. You need a host that:
1. Serves the `dist/` folder
2. Redirects all URLs to `index.html` (for React Router)
3. Accepts environment variables (for Supabase keys)

---

## ✅ Option 1 — Vercel (RECOMMENDED — Easiest & Fastest)

**Free tier:** Unlimited personal projects, custom domain, HTTPS

### Steps:

**A) Via website (no CLI needed):**
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
   - If not on GitHub yet: drag & drop your project folder, OR push to GitHub first
4. Vercel auto-detects Vite → Build Command: `npm run build`, Output: `dist`
5. Click **"Environment Variables"** and add:

```
VITE_SUPABASE_URL        = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY   = your-anon-key
VITE_ADMIN_EMAIL         = your-admin@email.com
VITE_WHATSAPP_NUMBER     = 212600000000
```

6. Click **Deploy** → Done! You get a URL like `maktabat-rahma.vercel.app`

**B) Via CLI:**
```bash
npm install -g vercel
vercel login
vercel                  # follow prompts
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_ADMIN_EMAIL
vercel env add VITE_WHATSAPP_NUMBER
vercel --prod           # deploy to production
```

> The `vercel.json` file in this project already handles React Router redirects.

---

## ✅ Option 2 — Netlify (Also free, also great)

**Free tier:** 100GB bandwidth/month, custom domain, HTTPS

### Steps:

**A) Via drag & drop (fastest):**
```bash
npm run build           # creates dist/ folder
```
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag your `dist/` folder into the browser
3. You instantly get a URL like `random-name.netlify.app`
4. Go to **Site Settings → Environment Variables** and add the 4 vars above
5. Trigger a redeploy

**B) Via GitHub (automatic deploys on push):**
1. Push your project to GitHub
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Select your repo
4. Build command: `npm run build` | Publish dir: `dist`
5. Add env vars under **Site Settings → Environment Variables**
6. Deploy

> The `netlify.toml` and `public/_redirects` files handle React Router routing.

---

## ✅ Option 3 — GitHub Pages (Free, but extra config needed)

Not ideal for React Router apps — requires a hash router or extra workarounds.
**Use Vercel or Netlify instead.**

---

## ✅ Option 4 — Keep Firebase Hosting (just for hosting, not the database)

You can use Firebase Hosting as a CDN while using Supabase for the database.

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools
firebase login

# Initialize hosting only (say NO to Firestore, Storage, etc.)
firebase init hosting
# Public dir: dist
# Single-page app: YES
# Overwrite index.html: NO

# Build and deploy
npm run build
firebase deploy --only hosting
```

Add your env vars to `.env` before building.
Firebase Hosting serves from the `dist/` folder — Supabase handles the backend.

---

## 🔑 Important: Environment Variables

**Never put your `.env` file on GitHub.**

On every host, you set env vars through their dashboard (not the `.env` file).
The `.env` file is only for local development.

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public |
| `VITE_ADMIN_EMAIL` | The email you created in Supabase Auth |
| `VITE_WHATSAPP_NUMBER` | Your WhatsApp number (international format, no +) |

---

## 🌐 Custom Domain

Both Vercel and Netlify let you connect a custom domain for free:
- **Vercel:** Project → Settings → Domains → Add
- **Netlify:** Site Settings → Domain Management → Add custom domain

---

## 🔄 Auto-deploy on code changes

Both platforms watch your GitHub repo. Every `git push` triggers an automatic rebuild and deploy — no manual steps needed.

```bash
git add .
git commit -m "update books layout"
git push                # → auto deploys in ~30 seconds
```
