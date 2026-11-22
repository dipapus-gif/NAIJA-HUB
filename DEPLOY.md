# Deploy Naija Hub to Vercel

A Vercel project `naija-hub` (team PASCAL) and a Neon database already exist, with `DATABASE_URL` and `SESSION_SECRET` set in Vercel.

    npm install -g vercel
    npm install
    vercel link --project naija-hub     # choose team PASCAL
    vercel --prod

Optional env vars: `AI_GATEWAY_API_KEY` (real LLM co-pilot; otherwise a built-in offline assistant answers), `COPILOT_MODEL`, `NEXT_PUBLIC_SITE_URL`.
Note: new Vercel projects have Deployment Protection on; turn it off in Project Settings > Deployment Protection for a public site.
Desktop app: see desktop/README.md (set NAIJA_HUB_URL / edit APP_URL in desktop/main.js to your final domain).
