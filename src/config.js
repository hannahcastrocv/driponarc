/* ============================================================================
   DRIP site configuration - Change v4 (live Arc Mainnet on-chain data)
   ----------------------------------------------------------------------------
   All statistics are read live from Arc Mainnet by the client-side indexer in
   src/lib/indexer.js. There are no hardcoded stat numbers anywhere.

   YOU MUST SET: ARC.rpcUrl (an Arc Mainnet RPC endpoint). Without it the site
   cannot read the chain and will show a "connect an RPC" state. See the notes
   at the bottom of this file.
   ============================================================================ */

// -- Arc Mainnet + DRIP protocol constants (all provided / verified on-chain) --
export const ARC = {
  chainId: 5042,                 // Arc Mainnet (0x13b2)
  name: "Arc Mainnet",

  // REQUIRED: an Arc Mainnet JSON-RPC HTTP endpoint. Circle has not published a
  // free public mainnet RPC; use your own node or a provider key (QuickNode,
  // dRPC, Chainstack, Alchemy, etc.). Do NOT commit a secret key to a public
  // repo - inject it at build time via an env var if it is private.
  rpcUrl: "https://rpc.arc-scan.org",   // Arc Mainnet public RPC (confirmed)
  wsUrl: "",                     // optional websocket endpoint for live blocks

  // Explorer used for every address/tx link on the site.
  explorerUrl: "https://arc-scan.org",

  drip: "0x3Fa48a2234dE3e65D81055F72ab00217803780B2",
  dripDecimals: 18,
  initialSupply: 1_000_000_000,  // 1,000,000,000 DRIP (fixed)

  usdc: "0x3600000000000000000000000000000000000000",
  usdcDecimals: 6,

  // Official wallet used for MANUAL buybacks.
  buybackWallet: "0xDb432A31fd4F723176D038BBB15b929dbb8039fa",

  // Any DRIP sent to either address is a burn, regardless of sender.
  burnAddresses: [
    "0x0000000000000000000000000000000000000000",
    "0x000000000000000000000000000000000000dEaD",
  ],

  // Event topics.
  transferTopic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  // Custom reflection event: (indexed holder address, uint256 USDC amount).
  reflectionTopic: "0x5efa67896a23b651b741b525caacba039c00ca7853be3de8eb1f4269e8669c56",

  // Backfill start block. Set this to the DRIP deployment block so the initial
  // scan is small and fast. Leave 0 to scan from genesis (much slower).
  deployBlock: 18382412,   // DRIP mint block (1,000,000,000 minted here). Backfill start.

  // Indexer tuning. rpc.arc-scan.org caps eth_getLogs at a 10,000-block range,
  // so chunkSize stays at/below that. Auto-halves further on any range error.
  chunkSize: 10_000,
  pollMs: 12_000,                // how often to check for new blocks
};

// Contract address shown/copied in the UI + the "View on Arc-Scan" target.
export const DRIP_ADDRESS = ARC.drip;

// Explorer URL helpers.
export const EXPLORER = {
  address: (a) => `${ARC.explorerUrl}/address/${a}`,
  tx: (h) => `${ARC.explorerUrl}/tx/${h}`,
  token: (a) => `${ARC.explorerUrl}/token/${a}`,
};

// Tokenomics shown in the Fee Breakdown panel. These are protocol design
// values (not on-chain statistics), kept as the site already displayed them.
export const TOKENOMICS = {
  reflection: 50, burnBuyback: 25, treasury: 25, buyTax: 1, sellTax: 1,
};

// External links.
export const LINKS = {
  buy: "https://radardex.pro/#0x3fa48a2234de3e65d81055f72ab00217803780b2",
  x: "https://x.com/driponarc",
  telegram: "https://t.me/officialdrip",
  explorer: ARC.explorerUrl,
  contract: `${ARC.explorerUrl}/address/${ARC.drip}`,
};

// Brand art (served from public/characters via the build base).
export const ASSETS = {
  mark: `${import.meta.env.BASE_URL}characters/drip-mark.png`,
  arc: `${import.meta.env.BASE_URL}characters/arc-logo.webp`,
  home: `${import.meta.env.BASE_URL}characters/scene-home.webp`,
  reflections: `${import.meta.env.BASE_URL}characters/scene-reflections.webp`,
  burns: `${import.meta.env.BASE_URL}characters/scene-burns.webp`,
  buyback: `${import.meta.env.BASE_URL}characters/scene-buyback.webp`,
  faq: `${import.meta.env.BASE_URL}characters/scene-faq.webp`,
};
