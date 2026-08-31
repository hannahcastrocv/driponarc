import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ARC } from "../config.js";
import { createIndexer } from "./indexer.js";

const Ctx = createContext(null);

/* Boots one indexer, backfills, then polls Arc for new blocks. All pages read
   the same live snapshot through useLiveData(). */
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

    (async () => {
      try {
        const snap = await indexer.backfill();
        if (!alive) return;
        setState({ status: "ready", error: null, live: true, stats: snap, latestBlock: snap.latestBlock });
        const tick = async () => {
          try {
            const s = await indexer.update();
            if (alive && s) setState((p) => ({ ...p, stats: s, latestBlock: s.latestBlock }));
          } catch (e) {
            if (alive) setState((p) => ({ ...p, live: false, error: String(e.message || e) }));
          } finally {
            if (alive) timer = setTimeout(tick, ARC.pollMs);
          }
        };
        timer = setTimeout(tick, ARC.pollMs);
      } catch (e) {
        if (alive) setState({ status: "error", error: String(e.message || e), live: false, stats: null, latestBlock: 0 });
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
