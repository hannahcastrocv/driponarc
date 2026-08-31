/* ============================================================================
   Data seam. Every component reads through here, so it never needs to know
   whether it is showing demo or live values.

   Two live sources are supported and both are OFF until configured:

   1) Aggregates, charts, holder counts and recent-activity feeds come from a
      backend indexer API (LIVE_API_BASE), because - per message.txt - the
      browser must NOT scan the whole chain. The indexer traces real Transfer /
      USDC events, sums only qualifying events (no double counting), excludes
      burn addresses from holders, and applies the configurable
      circulating-supply exclusions. See DATA_ACCURACY.md for the exact rules
      and the /api/* contract.

   2) Per-wallet single-value reads (balance, withdrawable USDC) can be read
      straight from the contract with viem when CHAIN.rpcUrl and the protocol
      addresses are filled in. These are cheap point reads, safe from the client.

   Nothing here invents an address. Every protocol address lives in config.js
   and must be discovered on-chain first (message.txt: "Do not invent addresses").
   ============================================================================ */
import {
  USE_DEMO_DATA, LIVE_API_BASE, CHAIN, PROTOCOL_ADDRESSES,
} from "../config.js";
import { DEMO } from "../data/demo.js";
import { shortenAddress } from "./format.js";

/* ---- backend indexer API -------------------------------------------------- */

async function api(path) {
  if (!LIVE_API_BASE) throw new Error("LIVE_API_BASE is not configured");
  const res = await fetch(`${LIVE_API_BASE}${path}`, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// Global stats for the whole site. Falls back to DEMO if live is not configured,
// so the site always renders. Swap USE_DEMO_DATA to false once the API is up.
export async function getGlobalStats() {
  if (USE_DEMO_DATA || !LIVE_API_BASE) return DEMO;
  // Indexer returns figures already reconciled against on-chain events.
  return api("/api/stats");
}

export async function getReflections(range = "all") { return api(`/api/reflections?range=${range}`); }
export async function getBurns(range = "all")        { return api(`/api/burns?range=${range}`); }
export async function getBuybacks(range = "all")     { return api(`/api/buybacks?range=${range}`); }
export async function getHolders(limit = 50)         { return api(`/api/holders?limit=${limit}`); }
export async function getActivity(limit = 50)        { return api(`/api/activity?limit=${limit}`); }
export async function getProtocolAddresses()         { return api("/api/protocol-addresses"); }

/* ---- per-wallet on-chain reads (viem) ------------------------------------- */

// Minimal ABI for the point reads we need.
const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals",  stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
];
const TRACKER_ABI = [
  { type: "function", name: "withdrawableDividendOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
];

let _client = null;
async function getClient() {
  if (_client) return _client;
  const { createPublicClient, http } = await import("viem");
  _client = createPublicClient({
    chain: { id: CHAIN.id, name: CHAIN.name, nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [CHAIN.rpcUrl] } } },
    transport: http(CHAIN.rpcUrl),
  });
  return _client;
}

export async function getWalletStats(address) {
  // Demo mode: return the mock wallet with the entered address shortened.
  if (USE_DEMO_DATA) {
    return { ...DEMO.wallet, address: shortenAddress(address) || DEMO.wallet.address };
  }

  const { isAddress, formatUnits } = await import("viem");
  if (!isAddress(address)) throw new Error("Invalid address");
  if (!PROTOCOL_ADDRESSES.token) throw new Error("Token address not configured");

  const client = await getClient();
  const reads = [
    client.readContract({ address: PROTOCOL_ADDRESSES.token, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
    client.readContract({ address: PROTOCOL_ADDRESSES.token, abi: ERC20_ABI, functionName: "decimals" }),
  ];
  if (PROTOCOL_ADDRESSES.reflectionDistributor) {
    reads.push(client.readContract({ address: PROTOCOL_ADDRESSES.reflectionDistributor, abi: TRACKER_ABI, functionName: "withdrawableDividendOf", args: [address] }));
  }
  const [rawBalance, decimals, rawClaimable] = await Promise.all(reads);
  const balance = Number(formatUnits(rawBalance, Number(decimals)));
  const claimableUsdc = rawClaimable != null ? Number(formatUnits(rawClaimable, 6)) : 0; // USDC = 6 dp

  // Per-wallet lifetime aggregates (reflections earned, buybacks benefited, etc.)
  // require indexed history - fetch them from the indexer when available.
  let extra = {};
  if (LIVE_API_BASE) {
    try { extra = await api(`/api/holders/${address}`); } catch (e) { /* optional */ }
  }

  return {
    address: shortenAddress(address),
    balance,
    balanceUsd: extra.balanceUsd ?? 0,
    reflectionsEarned: claimableUsdc,
    totalReflections: extra.totalReflections ?? claimableUsdc,
    monthly: extra.monthly ?? 0,
    burnedFromYou: extra.burnedFromYou ?? 0,
    burnedFromYouUsd: extra.burnedFromYouUsd ?? 0,
    buybacksBenefited: extra.buybacksBenefited ?? 0,
    buybacksBenefitedUsd: extra.buybacksBenefitedUsd ?? 0,
  };
}
