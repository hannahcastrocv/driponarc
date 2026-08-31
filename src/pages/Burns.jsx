import React from "react";
import { Flame } from "lucide-react";
import { ASSETS } from "../config.js";
import { DEMO } from "../data/demo.js";
import { num, compact } from "../lib/format.js";
import { Scene, PageShell, StatRow, ChartCard, ExplorerLink, ValuePropBar } from "../components/common.jsx";

export default function Burns() {
  return (
    <PageShell eyebrow="AUTOMATIC BURN" title="BURN TODAY." accentTitle="SCARCITY FOREVER."
      sub="DRIP is burned automatically on every transaction, reducing the total supply forever."
      scene={<Scene img={ASSETS.burns} dur="5s" glow="drip-glow-orange" />}>
      <StatRow items={[
        { label: "TOTAL DRIP BURNED", value: num(DEMO.dripBurned), unit: "DRIP", foot: `${DEMO.burnedPct}% of initial supply`, icon: <Flame size={16} style={{ color: "#fb923c" }} /> },
        { label: "CURRENT CIRCULATING SUPPLY", value: num(DEMO.token.circulating), unit: "DRIP" },
        { label: "TOTAL SUPPLY", value: num(DEMO.token.totalSupply), unit: "DRIP" },
      ]} />
      <section className="drip-split">
        <div className="drip-panel drip-prose" style={{ margin: 0 }}>
          <div className="drip-prose-eyebrow">BURN OVERVIEW</div>
          <p>DRIP is burned automatically as token-side fees are collected. Burned tokens are sent to the dead address and can never be recovered, so circulating supply only moves in one direction over time.</p>
        </div>
        <ChartCard title="DRIP BURNED" unit="(CUMULATIVE)" data={DEMO.burnsSeries} color="#fb923c" gradId="grad-burn" tickFmt={(v) => compact(v)} />
      </section>
      <section className="drip-split">
        <div className="drip-panel drip-latest">
          <div className="drip-prose-eyebrow">LATEST BURN</div>
          <div className="drip-latest-amt"><Flame size={18} style={{ color: "#fb923c" }} /> {num(DEMO.latestBurn.amount)} <em>DRIP</em></div>
          <div className="drip-latest-tx">Tx: <ExplorerLink value={DEMO.latestBurn.tx} kind="tx" /></div>
          <div className="drip-muted">{DEMO.latestBurn.time}</div>
          <div className="drip-latest-divider" />
          <div className="drip-prose-eyebrow">LAST 7 DAYS</div>
          <div className="drip-latest-amt2">{num(DEMO.last7dBurned)} <em>DRIP burned</em></div>
        </div>
        <div className="drip-panel drip-table" style={{ margin: 0 }}>
          <div className="drip-table-head">RECENT BURNS <em>(demo data)</em></div>
          <div className="drip-table-rows">
            <div className="drip-tr drip-tr-head"><span>Tx</span><span>Amount</span><span>Time</span></div>
            {DEMO.recentBurns.map((b, i) => (
              <div key={i} className="drip-tr"><ExplorerLink value={b.tx} kind="tx" /><span style={{ color: "#fb923c" }}>{num(b.amount)}</span><span className="drip-muted">{b.time}</span></div>
            ))}
          </div>
        </div>
      </section>
      <ValuePropBar />
    </PageShell>
  );
}
