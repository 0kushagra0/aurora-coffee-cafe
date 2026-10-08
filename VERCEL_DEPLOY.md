# Aurora Caffee — GitHub + Vercel deployment

This export is self-contained: the 242 optimized hero frames and café gallery images are bundled under `client/public/`.

## Deploy from GitHub

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In Vercel, choose **Add New Project** → **Import Git Repository**.
4. Confirm:
   - **Framework:** Vite
   - **Install command:** `pnpm install --frozen-lockfile`
   - **Build command:** `pnpm build:vercel`
   - **Output directory:** `dist/public`
5. Click **Deploy**.

No environment variables are required for the static website.

## Local verification

```bash
pnpm install
pnpm check
pnpm build:vercel
pnpm dev
```
