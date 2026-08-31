import React from "react";
import { ASSETS } from "../config.js";
import { usd, num, compact } from "../lib/format.js";
import { useLiveData } from "../lib/useLiveData.jsx";
import { Scene, PageShell, StatRow, ChartCard, ExplorerLink, ValuePropBar, Notice } from "../components/common.jsx";

export default function Buyback() {
  const { status, error, stats } = useLiveData();
  const ready = status === "ready";
  return (
    <PageShell eyebrow="MANUAL BUYBACK" title="BUYING BACK" accentTitle="FOR A STRONGER TOMORROW."
      sub="Buybacks are performed manually from the official wallet: USDC is spent to buy DRIP on-chain. Detected directly from swap transactions."
      scene={<Scene img={ASSETS.buyback} dur="6.4s" glow="drip-glow-green" />}>
      {!ready ? <Notice status={status} error={error} /> : (
        <>
          <StatRow items={[
            { label: "TOTAL USDC SPENT ON BUYBACKS", value: usd(stats.buybacksUsd), foot: "Confirmed swaps only" },
            { label: "TOTAL DRIP BOUGHT BACK", value: num(stats.dripBought), unit: "DRIP" },
            { label: "BUYBACKS", value: num(stats.buybackCount), foot: "Confirmed transactions" },
          ]} />
          <StatRow items={[
            { label: "AVG BUYBACK PRICE", value: stats.avgBuybackPrice ? `$${stats.avgBuybackPrice.toFixed(8)}` : "-", foot: "USDC / DRIP (weighted)" },
            { label: "LARGEST BUYBACK", value: usd(stats.largestBuyback) },
            { label: "BUYBACKS (7D)", value: usd(stats.buyback7d) },
            { label: "BUYBACKS (30D)", value: usd(stats.buyback30d) },
          ]} />

          <section className="drip-split">
            <div className="drip-panel drip-prose" style={{ margin: 0 }}>
              <div className="drip-prose-eyebrow">BUYBACK OVERVIEW</div>
              <p>A buyback is counted only when the official buyback wallet spends USDC and receives DRIP in the same transaction. DRIP that merely lands in the wallet is not counted. After a buyback the DRIP may later be burned in a separate transaction, which is tracked on the Burns page.</p>
            </div>
            <ChartCard title="USDC SPENT ON BUYBACKS" unit="(CUMULATIVE)" data={stats.buybackSeries} color="#4ade80" gradId="grad-buyback" tickFmt={(v) => "$" + compact(v)} />
          </section>

          <section className="drip-panel drip-table">
            <div className="drip-table-head">RECENT BUYBACKS <em>(live on-chain)</em></div>
            <div className="drip-table-rows">
              <div className="drip-tr drip-tr-5 drip-tr-head"><span>Tx</span><span>USDC</span><span>DRIP</span><span>Price</span><span>Time</span></div>
              {stats.recentBuybacks.map((b, i) => (
                <div key={i} className="drip-tr drip-tr-5">
                  <ExplorerLink value={b.tx} kind="tx" />
                  <span style={{ color: "#38bdf8" }}>{usd(b.usdc)}</span>
                  <span style={{ color: "#4ade80" }}>{num(b.drip)}</span>
                  <span className="drip-muted">${b.price ? b.price.toFixed(8) : "0"}</span>
                  <span className="drip-muted">{b.time}</span>
                </div>
              ))}
              {stats.recentBuybacks.length === 0 && <div className="drip-tr"><span className="drip-muted">No buybacks detected yet.</span></div>}
            </div>
          </section>
        </>
      )}
      <ValuePropBar />
    </PageShell>
  );
}
