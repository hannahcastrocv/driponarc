# Making Reflection / Burn / Buyback data accurate

This file explains how the numbers on the site become real, per the on-chain
analytics spec. Read it before flipping `USE_DEMO_DATA` to `false` in
`src/config.js`.

## The one architectural thing to know

This repo is a **static site** (Vite + React) that deploys to GitHub Pages.
GitHub Pages serves files only - it cannot run a Node process or a PostgreSQL
database. The accuracy spec requires an **always-on backend indexer** that
traces Arc events and stores them so totals can be summed correctly. That
indexer therefore has to be a **separate service**, not part of this static
build. This site is the *frontend*; it reads finished figures from the
indexer's API.

Two moving parts:

1. **Indexer + API (separate deploy)** - a Node/TypeScript service using viem,
   writing to PostgreSQL, exposing `/api/stats`, `/api/reflections`,
   `/api/burns`, `/api/buybacks`, `/api/holders`, `/api/activity`,
   `/api/protocol-addresses`. Host it somewhere that runs Node (Railway,
   Render, Fly, a VPS, etc.).
2. **This site** - set `LIVE_API_BASE` in `src/config.js` to that service's URL
   and set `USE_DEMO_DATA = false`. The data seam in `src/lib/stats.js` already
   calls those endpoints.

## Why the numbers must come from events, not balances

- **Reflections** = sum of *qualifying USDC Transfer events* from the reflection
  distributor to holders. Do **not** read the token contract's USDC balance -
  that is a snapshot, not the cumulative total.
- **Burns** = sum of Transfer events whose destination is a burn sink
  (`0x00..00` or `0x00..dEaD`) plus any custom burn events.
- **Buybacks** = USDC leaving the buyback mechanism -> router -> DRIP purchased.
  Detect the swap; record USDC spent and DRIP received.

Every total must reconcile against the raw events (no double counting of
internal contract hops).

## Addresses were NOT invented

Per the spec, no distributor / buyback / burn / treasury addresses are guessed.
They live in `PROTOCOL_ADDRESSES` in `src/config.js` and are blank until you
discover them by tracing real transactions on https://arc-scan.org. The two
burn sinks are the only pre-filled values because they are universal, not
assumptions. Fill the rest in the indexer config once verified, then surface
them via `/api/protocol-addresses`.

## Steps to go live

1. Deploy the indexer service; point it at `ARC_RPC_URL` (chain id 5042) and a
   PostgreSQL `DATABASE_URL`.
2. Discover and verify every protocol address on arc-scan; put them in the
   indexer config.
3. Backfill historical events, then keep indexing new blocks.
4. In `src/config.js`: set `LIVE_API_BASE`, set `USE_DEMO_DATA = false`, and (for
   per-wallet reads) set `CHAIN.rpcUrl` and `PROTOCOL_ADDRESSES.token` /
   `.reflectionDistributor`.
5. Confirm the site's totals match arc-scan before announcing.

Until step 4, the site keeps rendering the demo values in `src/data/demo.js`,
and every recent-activity row already links to arc-scan once it carries a full
`0x` hash/address.
