import React from "react";
import { ASSETS } from "../config.js";
import { DEMO } from "../data/demo.js";
import { usd, compact } from "../lib/format.js";
import { Scene, PageShell, ChartCard, ExplorerLink, ValuePropBar } from "../components/common.jsx";

export default function Reflections() {
  return (
    <PageShell eyebrow="USDC REFLECTIONS" title="REFLECTIONS" accentTitle="THAT FLOW."
      sub="DRIP rewards holders with real USDC on every transaction. Reflections accrue automatically; claim your USDC on Radardex."
      scene={<Scene img={ASSETS.reflections} dur="6s" glow="drip-glow-blue" />}>
      <section className="drip-split">
        <div className="drip-panel drip-overview">
          <div className="drip-overview-eyebrow">REFLECTIONS OVERVIEW</div>
          <p className="drip-overview-sub">USDC earned and distributed to holders</p>
          <div className="drip-overview-big">{usd(DEMO.usdcReflected)}</div>
          <div className="drip-overview-cap">Total USDC Distributed</div>
        </div>
        <ChartCard title="USDC DISTRIBUTED" unit="(CUMULATIVE)" data={DEMO.reflectionsSeries} color="#38bdf8" gradId="grad-reflect" tickFmt={(v) => "$" + compact(v)} />
      </section>
      <section className="drip-panel drip-prose">
        <div className="drip-prose-eyebrow">ABOUT REFLECTIONS</div>
        <p>A portion of every transaction is converted to USDC and accrues automatically to all eligible DRIP holders in proportion to their holdings. The more DRIP you hold, the larger your share of every reflection.</p>
        <div className="drip-prose-eyebrow" style={{ marginTop: 22 }}>ELIGIBILITY</div>
        <p>Any wallet holding DRIP is eligible. Reflections accrue automatically as you hold, and you withdraw your accumulated USDC by claiming on Radardex. No staking required.</p>
      </section>
      <section className="drip-panel drip-table">
        <div className="drip-table-head">RECENT REFLECTIONS <em>(demo data)</em></div>
        <div className="drip-table-rows">
          <div className="drip-tr drip-tr-head"><span>Wallet</span><span>USDC</span><span>Time</span></div>
          {DEMO.recentReflections.map((r, i) => (
            <div key={i} className="drip-tr"><ExplorerLink value={r.wallet} kind="address" /><span style={{ color: "#38bdf8" }}>{usd(r.usdc)}</span><span className="drip-muted">{r.time}</span></div>
          ))}
        </div>
      </section>
      <ValuePropBar />
    </PageShell>
  );
}
