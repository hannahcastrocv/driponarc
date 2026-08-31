import React from "react";
import { ASSETS } from "../config.js";
import { usd, num, compact } from "../lib/format.js";
import { useLiveData } from "../lib/useLiveData.jsx";
import { Scene, PageShell, ChartCard, StatRow, ExplorerLink, ValuePropBar, Notice } from "../components/common.jsx";

export default function Reflections() {
  const { status, error, stats } = useLiveData();
  const ready = status === "ready";
  return (
    <PageShell eyebrow="USDC REFLECTIONS" title="REFLECTIONS" accentTitle="THAT FLOW."
      sub="DRIP rewards holders with real USDC on every transaction. Reflections accrue automatically; claim your USDC on Radardex."
      scene={<Scene img={ASSETS.reflections} dur="6s" glow="drip-glow-blue" />}>
      {!ready ? <Notice status={status} error={error} /> : (
        <>
          <section className="drip-split">
            <div className="drip-panel drip-overview">
              <div className="drip-overview-eyebrow">REFLECTIONS OVERVIEW</div>
              <p className="drip-overview-sub">USDC allocated to holders (claimed + unclaimed)</p>
              <div className="drip-overview-big">{usd(stats.usdcReflected)}</div>
              <div className="drip-overview-cap">Total USDC Reflected</div>
            </div>
            <ChartCard title="USDC REFLECTED" unit="(CUMULATIVE)" data={stats.reflectionsSeries} color="#38bdf8" gradId="grad-reflect" tickFmt={(v) => "$" + compact(v)} />
          </section>

          <StatRow items={[
            { label: "REFLECTED (24H)", value: usd(stats.reflected24h) },
            { label: "REFLECTED (7D)", value: usd(stats.reflected7d) },
            { label: "REFLECTED (30D)", value: usd(stats.reflected30d) },
            { label: "RECIPIENTS", value: num(stats.reflectionRecipients) },
          ]} />
          <StatRow items={[
            { label: "REFLECTION PAYMENTS", value: num(stats.reflectionCount) },
            { label: "AVERAGE REFLECTION", value: usd(stats.avgReflection) },
            { label: "LARGEST REFLECTION", value: usd(stats.largestReflection) },
          ]} />

          <section className="drip-panel drip-table">
            <div className="drip-table-head">RECENT REFLECTIONS <em>(live on-chain)</em></div>
            <div className="drip-table-rows">
              <div className="drip-tr drip-tr-4 drip-tr-head"><span>Holder</span><span>USDC</span><span>Tx</span><span>Time</span></div>
              {stats.recentReflections.map((r, i) => (
                <div key={i} className="drip-tr drip-tr-4">
                  <ExplorerLink value={r.wallet} kind="address" />
                  <span style={{ color: "#38bdf8" }}>{usd(r.usdc)}</span>
                  <ExplorerLink value={r.tx} kind="tx" />
                  <span className="drip-muted">{r.time}</span>
                </div>
              ))}
              {stats.recentReflections.length === 0 && <div className="drip-tr"><span className="drip-muted">No reflections indexed yet.</span></div>}
            </div>
          </section>
        </>
      )}
      <ValuePropBar />
    </PageShell>
  );
}
