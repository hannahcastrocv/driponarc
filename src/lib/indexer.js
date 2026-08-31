/* ============================================================================
   DRIP live indexer - reads Arc Mainnet directly (client-side) and computes
   every statistic from on-chain events. No hardcoded numbers.

   Implements the rules from the spec:
     - TOTAL BURNED = sum of DRIP Transfers to 0x0 or 0xdEaD, from ANY sender
     - CIRCULATING  = initialSupply - totalBurned  (no LP / wallet subtraction)
     - HOLDERS      = balances replayed from full Transfer history, minus 0x0/dEaD
     - REFLECTIONS  = sum of the custom reflection event (counts unclaimed too)
     - BUYBACKS     = txs where the buyback wallet spends USDC AND receives DRIP
     - dedup by (txHash, logIndex); BigInt math; correct decimals
   ============================================================================ */
import { ARC } from "../config.js";

const ZERO = ARC.burnAddresses[0].toLowerCase();
const DEAD = ARC.burnAddresses[1].toLowerCase();
const DRIP = ARC.drip.toLowerCase();
const USDC = ARC.usdc.toLowerCase();
const WALLET = ARC.buybackWallet.toLowerCase();
const DRIP_SCALE = 10n ** BigInt(ARC.dripDecimals);
const USDC_SCALE = 10n ** BigInt(ARC.usdcDecimals);

/* ---- low level helpers ---------------------------------------------------- */

let rpcId = 1;
async function rpc(method, params) {
  if (!ARC.rpcUrl) throw new Error("NO_RPC");
  const res = await fetch(ARC.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: rpcId++, method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${method} HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message || json.error.code}`);
  return json.result;
}

const hexToBig = (h) => (h && h !== "0x" ? BigInt(h) : 0n);
const toHexBlock = (n) => "0x" + BigInt(n).toString(16);
const topicAddr = (a) => "0x" + a.toLowerCase().replace(/^0x/, "").padStart(64, "0");
const addrFromTopic = (t) => "0x" + t.slice(26).toLowerCase();

export function toNumber(raw, decimals) {
  const scale = 10n ** BigInt(decimals);
  return Number(raw / scale) + Number(raw % scale) / Number(scale);
}
export const dripToNum = (raw) => toNumber(raw, ARC.dripDecimals);
export const usdcToNum = (raw) => toNumber(raw, ARC.usdcDecimals);

/* Chunked eth_getLogs that auto-shrinks the range if the RPC rejects it. */
async function getLogs(address, topics, fromBlock, toBlock, chunk) {
  const out = [];
  let start = BigInt(fromBlock);
  const end = BigInt(toBlock);
  let step = BigInt(chunk);
  while (start <= end) {
    const stop = start + step - 1n > end ? end : start + step - 1n;
    try {
      const logs = await rpc("eth_getLogs", [{
        address,
        topics,
        fromBlock: toHexBlock(start),
        toBlock: toHexBlock(stop),
      }]);
      out.push(...logs);
      start = stop + 1n;
    } catch (e) {
      // Range too large / too many results: halve and retry the same window.
      if (step > 1n) { step = step / 2n; continue; }
      throw e;
    }
  }
  return out;
}

/* Fetch (and cache) block timestamps for a set of block numbers. */
const tsCache = new Map();
async function blockTimes(blockNumbers) {
  const need = [...new Set(blockNumbers)].filter((b) => !tsCache.has(b));
  for (const b of need) {
    try {
      const blk = await rpc("eth_getBlockByNumber", [toHexBlock(b), false]);
      tsCache.set(b, blk ? Number(hexToBig(blk.timestamp)) : 0);
    } catch {
      tsCache.set(b, 0);
    }
  }
  return tsCache;
}

/* ---- indexer factory ------------------------------------------------------ */

export function createIndexer() {
  // Raw event stores (deduped by txHash-logIndex).
  const seen = new Set();
  const transfers = [];   // { from, to, value(BigInt), block, tx, logIndex }
  const reflections = []; // { holder, amount(BigInt), block, tx, logIndex }
  const usdcOut = [];     // USDC transfers FROM buyback wallet: { to, value, block, tx, logIndex }

  const balances = new Map();     // address -> BigInt
  const reflByHolder = new Map(); // address -> BigInt (USDC raw)
  let totalBurnedRaw = 0n;
  let lastBlock = 0;

  const key = (l) => `${l.transactionHash}-${l.logIndex}`;
  const bump = (map, k, d) => map.set(k, (map.get(k) || 0n) + d);

  function ingestTransfer(l) {
    if (seen.has(key(l))) return;
    seen.add(key(l));
    const from = addrFromTopic(l.topics[1]);
    const to = addrFromTopic(l.topics[2]);
    const value = hexToBig(l.data);
    const block = Number(hexToBig(l.blockNumber));
    transfers.push({ from, to, value, block, tx: l.transactionHash, logIndex: Number(hexToBig(l.logIndex)) });
    // balances
    if (from !== ZERO) bump(balances, from, -value);
    bump(balances, to, value);
    // burn rule: ANY sender, to zero or dead
    if (to === ZERO || to === DEAD) totalBurnedRaw += value;
  }

  function ingestReflection(l) {
    if (seen.has(key(l))) return;
    seen.add(key(l));
    const holder = addrFromTopic(l.topics[1]);
    const amount = hexToBig(l.data);
    const block = Number(hexToBig(l.blockNumber));
    reflections.push({ holder, amount, block, tx: l.transactionHash, logIndex: Number(hexToBig(l.logIndex)) });
    bump(reflByHolder, holder, amount);
  }

  function ingestUsdcOut(l) {
    if (seen.has(key(l))) return;
    seen.add(key(l));
    usdcOut.push({
      to: addrFromTopic(l.topics[2]),
      value: hexToBig(l.data),
      block: Number(hexToBig(l.blockNumber)),
      tx: l.transactionHash,
      logIndex: Number(hexToBig(l.logIndex)),
    });
  }

  async function scanRange(from, to) {
    const chunk = ARC.chunkSize;
    const [tLogs, rLogs, uLogs] = await Promise.all([
      getLogs(ARC.drip, [ARC.transferTopic], from, to, chunk),
      getLogs(ARC.drip, [ARC.reflectionTopic], from, to, chunk),
      getLogs(ARC.usdc, [ARC.transferTopic, topicAddr(WALLET)], from, to, chunk),
    ]);
    tLogs.forEach(ingestTransfer);
    rLogs.forEach(ingestReflection);
    uLogs.forEach(ingestUsdcOut);
  }

  // Buybacks: group by tx where wallet spent USDC (usdcOut) AND received DRIP.
  function computeBuybacks() {
    const dripInByTx = new Map(); // tx -> { drip:BigInt, block, pool }
    for (const t of transfers) {
      if (t.to === WALLET) {
        const cur = dripInByTx.get(t.tx) || { drip: 0n, block: t.block, pool: t.from };
        cur.drip += t.value;
        dripInByTx.set(t.tx, cur);
      }
    }
    const usdcOutByTx = new Map(); // tx -> { usdc:BigInt, block, router }
    for (const u of usdcOut) {
      const cur = usdcOutByTx.get(u.tx) || { usdc: 0n, block: u.block, router: u.to };
      cur.usdc += u.value;
      usdcOutByTx.set(u.tx, cur);
    }
    const list = [];
    for (const [tx, din] of dripInByTx) {
      const uout = usdcOutByTx.get(tx);
      if (!uout || uout.usdc === 0n || din.drip === 0n) continue; // must spend USDC and get DRIP
      list.push({
        tx,
        block: din.block,
        usdcRaw: uout.usdc,
        dripRaw: din.drip,
        pool: din.pool,     // DRIP came from here (pool/router)
        router: uout.router // USDC went here
      });
    }
    list.sort((a, b) => a.block - b.block);
    return list;
  }

  function holderEntries() {
    const out = [];
    for (const [addr, bal] of balances) {
      if (addr === ZERO || addr === DEAD) continue;
      if (bal > 0n) out.push([addr, bal]);
    }
    out.sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0));
    return out;
  }

  async function snapshot() {
    const initialRaw = BigInt(ARC.initialSupply) * DRIP_SCALE;
    const circulatingRaw = initialRaw - totalBurnedRaw;
    const holders = holderEntries();
    const buybacks = computeBuybacks();

    // Totals
    const totalReflRaw = reflections.reduce((s, r) => s + r.amount, 0n);
    const totalUsdcSpentRaw = buybacks.reduce((s, b) => s + b.usdcRaw, 0n);
    const totalDripBoughtRaw = buybacks.reduce((s, b) => s + b.dripRaw, 0n);

    // Timestamps for time-window stats, charts and recent lists.
    const evtBlocks = [
      ...reflections.map((r) => r.block),
      ...transfers.filter((t) => t.to === ZERO || t.to === DEAD).map((t) => t.block),
      ...buybacks.map((b) => b.block),
    ];
    await blockTimes(evtBlocks);
    const nowSec = Math.floor(Date.now() / 1000);
    const since = (days) => nowSec - days * 86400;
    const startOfToday = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

    const sumRefl = (pred) => reflections.reduce((s, r) => (pred(tsCache.get(r.block) || 0) ? s + r.amount : s), 0n);
    const burns = transfers.filter((t) => t.to === ZERO || t.to === DEAD);
    const sumBurn = (pred) => burns.reduce((s, t) => (pred(tsCache.get(t.block) || 0) ? s + t.value : s), 0n);
    const sumBuy = (pred) => buybacks.reduce((s, b) => (pred(tsCache.get(b.block) || 0) ? s + b.usdcRaw : s), 0n);

    // Daily cumulative series builder.
    const series = (items, valueOf, toNum) => {
      const byDay = new Map();
      for (const it of items) {
        const ts = tsCache.get(it.block) || 0;
        if (!ts) continue;
        const day = new Date(ts * 1000); day.setHours(0, 0, 0, 0);
        const k = day.getTime();
        byDay.set(k, (byDay.get(k) || 0n) + valueOf(it));
      }
      const days = [...byDay.keys()].sort((a, b) => a - b);
      let cum = 0n;
      return days.map((k) => {
        cum += byDay.get(k);
        const d = new Date(k);
        return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: toNum(cum) };
      });
    };

    const withTime = (block) => {
      const ts = tsCache.get(block) || 0;
      return ts ? new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
    };

    const largestRefl = reflections.reduce((m, r) => (r.amount > m ? r.amount : m), 0n);
    const latestRefl = reflections.length ? reflections.reduce((a, b) => (b.block >= a.block ? b : a)) : null;
    const largestBuy = buybacks.reduce((m, b) => (b.usdcRaw > m ? b.usdcRaw : m), 0n);
    const latestBuy = buybacks.length ? buybacks[buybacks.length - 1] : null;

    const recent = (arr, n) => arr.slice().sort((a, b) => b.block - a.block).slice(0, n);

    return {
      latestBlock: lastBlock,

      // headline (5)
      totalSupply: ARC.initialSupply,
      totalBurned: dripToNum(totalBurnedRaw),
      burnedPct: Number(initialRaw) ? (Number(totalBurnedRaw) / Number(initialRaw)) * 100 : 0,
      circulating: dripToNum(circulatingRaw),
      holders: holders.length,
      usdcReflected: usdcToNum(totalReflRaw),
      buybacksUsd: usdcToNum(totalUsdcSpentRaw),
      dripBought: dripToNum(totalDripBoughtRaw),

      // reflections extra
      reflectionCount: reflections.length,
      reflectionRecipients: reflByHolder.size,
      largestReflection: usdcToNum(largestRefl),
      avgReflection: reflections.length ? usdcToNum(totalReflRaw) / reflections.length : 0,
      latestReflection: latestRefl ? { usdc: usdcToNum(latestRefl.amount), holder: latestRefl.holder, tx: latestRefl.tx, time: withTime(latestRefl.block) } : null,
      reflectedToday: usdcToNum(sumRefl((ts) => ts >= startOfToday)),
      reflected24h: usdcToNum(sumRefl((ts) => ts >= since(1))),
      reflected7d: usdcToNum(sumRefl((ts) => ts >= since(7))),
      reflected30d: usdcToNum(sumRefl((ts) => ts >= since(30))),

      // burns extra
      burnCount: burns.length,
      burnedToday: dripToNum(sumBurn((ts) => ts >= startOfToday)),
      burned24h: dripToNum(sumBurn((ts) => ts >= since(1))),
      burned7d: dripToNum(sumBurn((ts) => ts >= since(7))),
      burned30d: dripToNum(sumBurn((ts) => ts >= since(30))),
      latestBurn: burns.length ? (() => { const b = recent(burns, 1)[0]; return { amount: dripToNum(b.value), tx: b.tx, from: b.from, to: b.to, time: withTime(b.block) }; })() : null,

      // buybacks extra
      buybackCount: buybacks.length,
      avgBuybackPrice: totalDripBoughtRaw > 0n ? usdcToNum(totalUsdcSpentRaw) / dripToNum(totalDripBoughtRaw) : 0,
      largestBuyback: usdcToNum(largestBuy),
      latestBuyback: latestBuy ? { usdc: usdcToNum(latestBuy.usdcRaw), drip: dripToNum(latestBuy.dripRaw), tx: latestBuy.tx, time: withTime(latestBuy.block) } : null,
      buyback24h: usdcToNum(sumBuy((ts) => ts >= since(1))),
      buyback7d: usdcToNum(sumBuy((ts) => ts >= since(7))),
      buyback30d: usdcToNum(sumBuy((ts) => ts >= since(30))),

      // lists
      recentReflections: recent(reflections, 8).map((r) => ({ wallet: r.holder, usdc: usdcToNum(r.amount), tx: r.tx, time: withTime(r.block) })),
      recentBurns: recent(burns, 8).map((b) => ({ from: b.from, amount: dripToNum(b.value), tx: b.tx, time: withTime(b.block) })),
      recentBuybacks: recent(buybacks, 8).map((b) => ({ tx: b.tx, usdc: usdcToNum(b.usdcRaw), drip: dripToNum(b.dripRaw), price: b.dripRaw > 0n ? usdcToNum(b.usdcRaw) / dripToNum(b.dripRaw) : 0, time: withTime(b.block) })),

      // holders
      topHolders: holders.slice(0, 50).map(([addr, bal]) => ({
        address: addr,
        balance: dripToNum(bal),
        pctTotal: (Number(bal) / Number(initialRaw)) * 100,
        pctCirc: Number(circulatingRaw) ? (Number(bal) / Number(circulatingRaw)) * 100 : 0,
        reflections: usdcToNum(reflByHolder.get(addr) || 0n),
      })),

      // series
      reflectionsSeries: series(reflections, (r) => r.amount, usdcToNum),
      burnsSeries: series(burns, (t) => t.value, dripToNum),
      buybackSeries: series(buybacks, (b) => b.usdcRaw, usdcToNum),
    };
  }

  function getWallet(addr) {
    const a = addr.toLowerCase();
    const initialRaw = BigInt(ARC.initialSupply) * DRIP_SCALE;
    const circulatingRaw = initialRaw - totalBurnedRaw;
    const bal = balances.get(a) || 0n;
    const refl = reflByHolder.get(a) || 0n;
    const mine = reflections.filter((r) => r.holder === a).sort((x, y) => y.block - x.block);
    const last = mine[0];
    return {
      address: addr,
      found: bal > 0n || refl > 0n,
      balance: dripToNum(bal),
      pctTotal: (Number(bal) / Number(initialRaw)) * 100,
      pctCirc: Number(circulatingRaw) ? (Number(bal) / Number(circulatingRaw)) * 100 : 0,
      reflectionsTotal: usdcToNum(refl),
      lastReflection: last ? { usdc: usdcToNum(last.amount), time: (tsCache.get(last.block) ? new Date(tsCache.get(last.block) * 1000).toLocaleString() : "") } : null,
    };
  }

  return {
    // Full historical backfill from deployBlock -> head.
    async backfill() {
      const head = Number(hexToBig(await rpc("eth_blockNumber")));
      await scanRange(ARC.deployBlock || 0, head);
      lastBlock = head;
      return snapshot();
    },
    // Process only new blocks since last time.
    async update() {
      const head = Number(hexToBig(await rpc("eth_blockNumber")));
      if (head <= lastBlock) return null; // nothing new
      await scanRange(lastBlock + 1, head);
      lastBlock = head;
      return snapshot();
    },
    getWallet,
    get lastBlock() { return lastBlock; },
  };
}
