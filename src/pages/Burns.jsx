import React from "react";
import { Flame } from "lucide-react";
import { ASSETS } from "../config.js";
import { num, pct, compact } from "../lib/format.js";
import { useLiveData } from "../lib/useLiveData.jsx";
import { Scene, PageShell, StatRow, ChartCard, ExplorerLink, ValuePropBar, Notice } from "../components/common.jsx";

export default function Burns() {
  const { status, error, stats } = useLiveData();
  const ready = status === "ready";
  return (
    <PageShell eyebrow="AUTOMATIC BURN" title="BURN TODAY." accentTitle="SCARCITY FOREVER."
      sub="Every DRIP sent to the zero or dead address is burned forever, from any wallet. Circulating supply only falls."
      scene={<Scene img={ASSETS.burns} dur="5s" glow="drip-glow-orange" />}>
      {!ready ? <Notice status={status} error={error} /> : (
        <>
          <StatRow items={[
            { label: "TOTAL DRIP BURNED", value: num(stats.totalBurned), unit: "DRIP", foot: `${pct(stats.burnedPct)} of initial supply`, icon: <Flame size={16} style={{ color: "#fb923c" }} /> },
            { label: "CURRENT CIRCULATING SUPPLY", value: num(stats.circulating), unit: "DRIP" },
            { label: "TOTAL SUPPLY", value: num(stats.totalSupply), unit: "DRIP" },
          ]} />
          <StatRow items={[
            { label: "BURNED (24H)", value: num(stats.burned24h), unit: "DRIP" },
            { label: "BURNED (7D)", value: num(stats.burned7d), unit: "DRIP" },
            { label: "BURNED (30D)", value: num(stats.burned30d), unit: "DRIP" },
            { label: "BURN EVENTS", value: num(stats.burnCount) },
          ]} />

          <section className="drip-split">
            <div className="drip-panel drip-prose" style={{ margin: 0 }}>
              <div className="drip-prose-eyebrow">BURN OVERVIEW</div>
              <p>Total burned is the sum of every DRIP Transfer to the zero address or the dead address, no matter which wallet sent it. Circulating supply is the initial 1,000,000,000 DRIP minus everything burned. LP and buyback-wallet balances are never subtracted.</p>
            </div>
            <ChartCard title="DRIP BURNED" unit="(CUMULATIVE)" data={stats.burnsSeries} color="#fb923c" gradId="grad-burn" tickFmt={(v) => compact(v)} />
          </section>

          <section className="drip-split">
            <div className="drip-panel drip-latest">
              <div className="drip-prose-eyebrow">LATEST BURN</div>
              {stats.latestBurn ? (
                <>
                  <div className="drip-latest-amt"><Flame size={18} style={{ color: "#fb923c" }} /> {num(stats.latestBurn.amount)} <em>DRIP</em></div>
                  <div className="drip-latest-tx">Tx: <ExplorerLink value={stats.latestBurn.tx} kind="tx" /></div>
                  <div className="drip-muted">{stats.latestBurn.time}</div>
                </>
              ) : <div className="drip-muted">No burns indexed yet.</div>}
              <div className="drip-latest-divider" />
              <div className="drip-prose-eyebrow">LAST 7 DAYS</div>
              <div className="drip-latest-amt2">{num(stats.burned7d)} <em>DRIP burned</em></div>
            </div>
            <div className="drip-panel drip-table" style={{ margin: 0 }}>
              <div className="drip-table-head">RECENT BURNS <em>(live on-chain)</em></div>
              <div className="drip-table-rows">
                <div className="drip-tr drip-tr-4 drip-tr-head"><span>From</span><span>Amount</span><span>Tx</span><span>Time</span></div>
                {stats.recentBurns.map((b, i) => (
                  <div key={i} className="drip-tr drip-tr-4">
                    <ExplorerLink value={b.from} kind="address" />
                    <span style={{ color: "#fb923c" }}>{num(b.amount)}</span>
                    <ExplorerLink value={b.tx} kind="tx" />
                    <span className="drip-muted">{b.time}</span>
                  </div>
                ))}
                {stats.recentBurns.length === 0 && <div className="drip-tr"><span className="drip-muted">No burns indexed yet.</span></div>}
              </div>
            </div>
          </section>
        </>
      )}
      <ValuePropBar />
    </PageShell>
  );
}
