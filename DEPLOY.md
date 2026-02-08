# Deployment Guide: Render & Arevo.dk

This guide details the steps to deploy the **Vue.js Frontend** (Static Site) to Render.

## 1. Create Static Site on Render
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Static Site**.
3. Connect the GitHub repository you just pushed.

## 2. Configure Service Settings
Use the following settings for the Static Site:
- **Name**: `arevo-frontend` (or your preferred name)
- **Branch**: `main`
- **Root Directory**: (Leave empty if `package.json` is in the root)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

## 3. Configuring SPA Routing (CRITICAL)
To ensure the Vue Router works correctly (preventing 404 errors on refresh), you must add a Rewrite Rule.

1. Go to your **Static Site Dashboard**.
2. In the **left-hand sidebar menu**, click on **"Redirects/Rewrites"**.
3. Click **Add Rule**.
4. Configure the rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Click **Save Changes**.

## 4. Environment Variables
To connect to your backend, you will eventually add this variable:
1. Go to the **Environment** tab.
2. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (Add this later once backend is deployed)

## 5. Custom Domain (arevo.dk)
Once the site is live:
1. Go to the **Settings** tab.
2. Scroll to **Custom Domains**.
3. Add `arevo.dk`.
4. Follow the DNS instructions (adding an A record and CNAME record at your domain provider).

## 6. Auth0 Configuration (CRITICAL)
For login to work on the new domain, you **MUST** update your Auth0 Dashboard:
1. Go to [manage.auth0.com](https://manage.auth0.com).
2. Navigate to **Applications** -> **Applications**.
3. **Select the "Single Page Application"**.
   - *Verification*: Ensure the **Client ID** matches `3LmjmekKi98gx3T8jd0nO6H6MiB85nKt` (from your `src/main.ts`).
4. Scroll down to **"Application URIs"**.
5. Add `https://arevo.dk` (and `https://www.arevo.dk`) to:
   - **Allowed Callback URLs**
   - **Allowed Logout URLs**
   - **Allowed Web Origins**
6. Scroll down and click **Save Changes**.

*Note: Your code uses `window.location.origin` for redirects, so no code changes are needed, just these dashboard settings.*
