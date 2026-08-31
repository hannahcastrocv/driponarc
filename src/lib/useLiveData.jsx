import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ARC } from "../config.js";
import { createIndexer } from "./indexer.js";

const Ctx = createContext(null);

/* localStorage cache: lets a reload skip the full history scan and only fetch
   new blocks. Key is tied to chain + token + deployBlock so config changes
   invalidate old caches automatically. */
const CACHE_KEY = `dripidx:${ARC.chainId}:${(ARC.drip || "").toLowerCase()}:${ARC.deployBlock || 0}:v1`;
function loadCache() {
  try { const raw = localStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function saveCache(state) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch { /* quota / unavailable: ignore */ }
}

/* Boots one indexer, restores cached state if present, then polls Arc for new
   blocks. All pages read the same live snapshot through useLiveData(). */
export function LiveDataProvider({ children }) {
  const [state, setState] = useState({
    status: ARC.rpcUrl ? "loading" : "needs-config",
    error: null,
    live: false,
    stats: null,
    latestBlock: 0,
  });
  const idx = useRef(null);

  useEffect(() => {
    if (!ARC.rpcUrl) return;
    let alive = true;
    let timer = null;
    const indexer = createIndexer();
    idx.current = indexer;

    const persist = () => saveCache(indexer.dumpState());

    (async () => {
      try {
        // 1) Instant paint from cache if we have it.
        const cached = loadCache();
        if (cached && indexer.hydrate(cached)) {
          try {
            const snap = await indexer.snapshot();
            if (alive) setState({ status: "ready", error: null, live: true, stats: snap, latestBlock: snap.latestBlock });
          } catch { /* ignore, will backfill below */ }
        }

        // 2) Catch up: only new blocks if hydrated, else full backfill.
        const snap = indexer.lastBlock > 0 ? (await indexer.update()) : (await indexer.backfill());
        if (!alive) return;
        if (snap) setState({ status: "ready", error: null, live: true, stats: snap, latestBlock: snap.latestBlock });
        else if (!state.stats) setState((p) => ({ ...p, status: "ready", live: true }));
        persist();

        // 3) Poll for new blocks.
        const tick = async () => {
          try {
            const s = await indexer.update();
            if (alive && s) { setState((p) => ({ ...p, stats: s, latestBlock: s.latestBlock, live: true })); persist(); }
          } catch (e) {
            if (alive) setState((p) => ({ ...p, live: false, error: String(e.message || e) }));
          } finally {
            if (alive) timer = setTimeout(tick, ARC.pollMs);
          }
        };
        timer = setTimeout(tick, ARC.pollMs);
      } catch (e) {
        // If we already painted from cache, keep showing it; just mark not-live.
        if (alive) setState((p) => p.stats
          ? { ...p, live: false, error: String(e.message || e) }
          : { status: "error", error: String(e.message || e), live: false, stats: null, latestBlock: 0 });
      }
    })();

    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, []);

  const lookupWallet = (addr) => (idx.current ? idx.current.getWallet(addr) : null);

  return <Ctx.Provider value={{ ...state, lookupWallet }}>{children}</Ctx.Provider>;
}

export function useLiveData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLiveData must be used inside LiveDataProvider");
  return v;
}
