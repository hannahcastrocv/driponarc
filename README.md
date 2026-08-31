# DRIP Website

Reflection-powered memecoin site for DRIP on Arc. React 18 + Vite 5. This is a
polished preview running on demo data. The token has not launched, so nothing
connects to a live chain yet.

## Run locally

```
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Deploy to a brand-new GitHub repository

This project is repository-name agnostic. You do not edit any path or config to
match the repo name.

1. Create a new empty GitHub repository (any name).
2. Push this project to it (keep the folder structure intact).
3. In the repo: Settings > Pages > Build and deployment > Source: GitHub Actions.
4. Push to the default branch (or run the workflow manually). The included
   workflow at `.github/workflows/deploy.yml` builds and publishes automatically.

Your site will be served at `https://<your-user>.github.io/<your-repo>/` and all
images will load correctly with no code changes.

### Why it works under any repo name

`vite.config.js` uses `base: "./"` (relative paths), and every image is
referenced through `import.meta.env.BASE_URL` in `src/config.js`, so assets
resolve correctly whether the site is served from a subfolder or a root domain.
There is no hard-coded repo name or `/RepoName/` path anywhere.

If you later move to a root custom domain, no change is needed. If you ever add a
client-side router with deep links, set `base` to `"/<your-repo>/"` in
`vite.config.js`; that is the single value you would touch.

## Where to edit things

- `src/config.js` : links, chain, contract addresses, image paths, and the
  `USE_DEMO_DATA` switch. The only file you must edit at launch.
- `src/data/demo.js` : all demo numbers, fee split, charts, and transaction feeds.
- `src/lib/stats.js` : the data seam. Demo now, with commented live-read stubs.
- `public/characters/` : brand art. Swap the files (keep the names) to update the
  mascot, scenes, and Arc logo without touching code.

## Tokenomics shown

- Transaction fees: 1% buy, 1% sell.
- Fee allocation: 50% USDC reflections, 25% combined burn and buyback, 25% treasury.
- Token-side fees are auto burned.

## Notes

- No em dashes anywhere in copy or code, by request.
- Character art bobs slowly and respects the reduced-motion setting.
- Placeholder links are left as `#` so nothing looks like a real official link.
- Arc public mainnet goes live September 16, 2026. Develop against the Arc
  testnet until then. See the build guide for the contract interface, indexer,
  pricing, and launch checklist.
