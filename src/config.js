/* ============================================================================
   DRIP site configuration
   ----------------------------------------------------------------------------
   Everything launch-specific lives here. Nothing else in the app needs editing
   when DRIP goes live: flip USE_DEMO_DATA to false, fill in the values below,
   and point LIVE_API_BASE at your indexer API (see DATA_ACCURACY.md).
   ============================================================================ */

// While true, the site renders the demo/mock values in src/data/demo.js.
// Flip to false only once the indexer API and/or on-chain addresses below are
// filled in and verified. See DATA_ACCURACY.md.
export const USE_DEMO_DATA = true;

// The DRIP contract address shown/copied in the UI, and the address the
// "View on Arc-Scan" link and Buy link point to. Change it here in one place.
export const DRIP_ADDRESS = "0x3fa48a2234de3e65d81055f72ab00217803780b2";

// Arc Mainnet. Chain id 5042. Explorer is arc-scan.org.
export const CHAIN = {
  id: 5042,
  name: "Arc Mainnet",
  rpcUrl: "REPLACE_WITH_ARC_MAINNET_RPC_URL", // ARC_RPC_URL
  wsUrl: "",                                  // ARC_WS_URL (optional websocket)
  explorerUrl: "https://arc-scan.org",
  usdc: "", // native USDC token address on Arc. Do NOT guess. Verify on-chain.
};

// Base URL of the backend indexer API that serves the aggregated stats
// (/api/stats, /api/reflections, /api/burns, /api/buybacks, /api/holders,
// /api/activity, /api/protocol-addresses). Leave "" until it is deployed.
export const LIVE_API_BASE = "";

/* Protocol addresses. IMPORTANT: do not invent these. They must be discovered by
   tracing real on-chain transactions/events (see message.txt + DATA_ACCURACY.md),
   then pasted here. The two burn sinks below are the canonical, universal burn
   addresses, not assumptions. Everything left "" is intentionally unset. */
export const PROTOCOL_ADDRESSES = {
  token: DRIP_ADDRESS,
  reflectionDistributor: "",
  usdc: "",
  buyback: "",
  router: "",
  liquidityPool: "",
  treasury: "",
  feeCollector: "",
  burnAddresses: [
    "0x0000000000000000000000000000000000000000",
    "0x000000000000000000000000000000000000dEaD",
  ],
};

// Addresses excluded from the circulating-supply calculation (treasury, locked,
// distributor, etc.). Configurable. Empty by default so nothing is assumed.
export const EXCLUDED_FROM_CIRCULATING = [];

// External links. Replace remaining "#" values before launch.
export const LINKS = {
  buy: "https://radardex.pro/#0x3fa48a2234de3e65d81055f72ab00217803780b2",
  x: "https://x.com/driponarc",
  telegram: "#",
  explorer: CHAIN.explorerUrl,
  contract: `${CHAIN.explorerUrl}/address/${DRIP_ADDRESS}`,
};

// Explorer URL helpers (arc-scan.org). Used to link addresses and tx hashes.
export const EXPLORER = {
  address: (a) => `${CHAIN.explorerUrl}/address/${a}`,
  tx: (h) => `${CHAIN.explorerUrl}/tx/${h}`,
  token: (a) => `${CHAIN.explorerUrl}/token/${a}`,
};

// Brand art. Files live in public/characters and are served from the site root.
// import.meta.env.BASE_URL resolves to whatever base Vite is built with, so
// these paths work locally and on a GitHub Pages subfolder with no edits.
// Swap the files (keep the names) to update the art without touching code.
export const ASSETS = {
  mark: `${import.meta.env.BASE_URL}characters/drip-mark.png`,
  arc: `${import.meta.env.BASE_URL}characters/arc-logo.webp`,
  home: `${import.meta.env.BASE_URL}characters/scene-home.webp`,
  reflections: `${import.meta.env.BASE_URL}characters/scene-reflections.webp`,
  burns: `${import.meta.env.BASE_URL}characters/scene-burns.webp`,
  buyback: `${import.meta.env.BASE_URL}characters/scene-buyback.webp`,
  faq: `${import.meta.env.BASE_URL}characters/scene-faq.webp`,
};
