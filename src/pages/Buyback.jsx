import React from "react";
import { ASSETS } from "../config.js";
import { DEMO } from "../data/demo.js";
import { usd, num, compact } from "../lib/format.js";
import { Scene, PageShell, StatRow, ChartCard, ExplorerLink, ValuePropBar } from "../components/common.jsx";

export default function Buyback() {
  return (
    <PageShell eyebrow="AUTOMATIC BUYBACK" title="BUYING BACK" accentTitle="FOR A STRONGER TOMORROW."
      sub="Accumulated fees are used to buy DRIP from the open market, supporting price stability and long-term growth."
      scene={<Scene img={ASSETS.buyback} dur="6.4s" glow="drip-glow-green" />}>
      <StatRow items={[
        { label: "TOTAL USDC SPENT ON BUYBACKS", value: usd(DEMO.buybacksUsd), foot: "Total USDC Used" },
        { label: "TOTAL DRIP BOUGHT", value: num(DEMO.dripBought), unit: "DRIP", foot: "Total DRIP Purchased" },
        { label: "BUYBACKS COMPLETED", value: num(DEMO.buybackTxns), foot: "Total Transactions" },
      ]} />
      <section className="drip-split">
        <div className="drip-panel drip-prose" style={{ margin: 0 }}>
          <div className="drip-prose-eyebrow">BUYBACK OVERVIEW</div>
          <p>The protocol uses accumulated fees to buy DRIP from the open market. These tokens can be held in the treasury or used for future ecosystem initiatives, adding steady buy pressure independent of market sentiment.</p>
        </div>
        <ChartCard title="DRIP BOUGHT" unit="(CUMULATIVE)" data={DEMO.buybackSeries} color="#4ade80" gradId="grad-buyback" tickFmt={(v) => compact(v)} />
      </section>
      <section className="drip-panel drip-table">
        <div className="drip-table-head">RECENT BUYBACKS <em>(demo data)</em></div>
        <div className="drip-table-rows">
          <div className="drip-tr drip-tr-head drip-tr-4"><span>Tx</span><span>USDC</span><span>DRIP</span><span>Time</span></div>
          {DEMO.recentBuybacks.map((b, i) => (
            <div key={i} className="drip-tr drip-tr-4"><ExplorerLink value={b.tx} kind="tx" /><span style={{ color: "#38bdf8" }}>{usd(b.usdc)}</span><span style={{ color: "#4ade80" }}>{num(b.drip)}</span><span className="drip-muted">{b.time}</span></div>
          ))}
        </div>
      </section>
      <ValuePropBar />
    </PageShell>
  );
}
