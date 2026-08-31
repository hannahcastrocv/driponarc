import React, { useState } from "react";
import { Droplet, Flame, RefreshCw, Shield, BarChart3, ArrowRight } from "lucide-react";
import { ASSETS } from "../config.js";
import { DEMO } from "../data/demo.js";
import { usd, num } from "../lib/format.js";
import { getWalletStats } from "../lib/stats.js";
import { Scene, AccentButton, WalletDashboard, ContractAddressCard, ValuePropBar } from "../components/common.jsx";

export default function Home() {
  const [wallet, setWallet] = useState(DEMO.wallet);
  const [input, setInput] = useState("");

  const check = async () => {
    if (!input.trim()) return;
    // Demo now. In production getWalletStats reads on-chain values (see lib/stats.js).
    const w = await getWalletStats(input.trim());
    setWallet(w);
  };

  const features = [
    { icon: <Droplet size={20} />, t: "USDC REFLECTIONS", s: "Claim on Radardex", c: "#5fb0ff" },
    { icon: <Flame size={20} />, t: "AUTOMATIC BURN", s: "On Every Tx", c: "#fb923c" },
    { icon: <RefreshCw size={20} />, t: "BUYBACK", s: "On accumulated fees", c: "#4ade80" },
    { icon: <Shield size={20} />, t: "TRANSPARENT & SECURE", s: "On-Chain", c: "#38bdf8" },
  ];
  const fees = [
    { pct: DEMO.fees.reflection, label: "USDC REFLECTION", icon: <Droplet size={18} />, c: "#5fb0ff" },
    { pct: DEMO.fees.burnBuyback, label: "BURN & BUYBACK", icon: (<span className="drip-fee-dualicon"><Flame size={18} style={{ color: "#fb923c" }} /><RefreshCw size={18} style={{ color: "#4ade80" }} /></span>), c: "#fb923c" },
    { pct: DEMO.fees.treasury, label: "TREASURY", icon: <BarChart3 size={18} />, c: "#c084fc" },
  ];

  return (
    <div className="drip-page">
      <section className="drip-hero">
        <div className="drip-hero-head">
          <div className="drip-hero-left">
            <h1 className="drip-h1">HOLD. DRIP.<br /><span className="drip-accent">BURN. REPEAT.</span></h1>
            <p className="drip-lead">
              DRIP is a reflection-powered memecoin on Arc. Every transaction rewards holders with
              USDC, burns DRIP, and supports the market with buybacks.
            </p>
          </div>
          <div className="drip-hero-mascot"><Scene img={ASSETS.home} dur="5.5s" glow="drip-glow-blue" /></div>
        </div>

        <div className="drip-hero-tools">
          <div className="drip-hero-toolstack">
            <div className="drip-panel drip-checker">
              <div className="drip-checker-title">CHECK STATS ON YOUR WALLET</div>
              <p className="drip-checker-sub">Paste your wallet address to see your live DRIP stats.</p>
              <div className="drip-checker-row">
                <input className="drip-input" placeholder="0x8a71...4f3B" value={input}
                  onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} />
                <AccentButton onClick={check}>CHECK STATS <ArrowRight size={15} /></AccentButton>
              </div>
            </div>
            <ContractAddressCard />
          </div>
          <WalletDashboard wallet={wallet} />
        </div>
      </section>

      <section className="drip-panel drip-featstrip">
        {features.map((f) => (
          <div key={f.t} className="drip-feat">
            <span className="drip-feat-icon" style={{ color: f.c, borderColor: `${f.c}33` }}>{f.icon}</span>
            <span className="drip-feat-text"><strong>{f.t}</strong><em>{f.s}</em></span>
          </div>
        ))}
      </section>

      <section className="drip-home-two">
        <div className="drip-panel drip-mainstats">
          <div className="drip-mstat"><span className="drip-mstat-label">USDC REFLECTED (TOTAL)</span><span className="drip-mstat-value">{usd(DEMO.usdcReflected)}</span></div>
          <div className="drip-mstat"><span className="drip-mstat-label">DRIP BURNED (TOTAL)</span><span className="drip-mstat-value"><Flame size={17} style={{ color: "#fb923c" }} /> {num(DEMO.dripBurned)} <em>DRIP</em></span><span className="drip-mstat-foot">{DEMO.burnedPct}% of initial supply</span></div>
          <div className="drip-mstat"><span className="drip-mstat-label">DRIP BUYBACKS (TOTAL)</span><span className="drip-mstat-value">{usd(DEMO.buybacksUsd)}</span></div>
          <div className="drip-mstat"><span className="drip-mstat-label">HOLDERS</span><span className="drip-mstat-value">{num(DEMO.token.holders)}</span></div>
          <div className="drip-mstat"><span className="drip-mstat-label">CIRCULATING SUPPLY</span><span className="drip-mstat-value">{num(DEMO.token.circulating)} <em>DRIP</em></span></div>
        </div>

        <div className="drip-panel drip-fee">
          <div className="drip-fee-title">FEE BREAKDOWN <em>(ON EVERY TRANSACTION)</em></div>
          <div className="drip-fee-grid">
            {fees.map((f) => (
              <div key={f.label} className="drip-fee-item">
                <div className="drip-fee-pct" style={{ color: f.c }}>{f.pct}%</div>
                <span className="drip-fee-icon" style={{ color: f.c }}>{f.icon}</span>
                <div className="drip-fee-label">{f.label}</div>
              </div>
            ))}
          </div>
          <div className="drip-fee-tax">
            <span>Buy Tax: <strong style={{ color: "#4ade80" }}>{DEMO.fees.buyTax}%</strong></span>
            <span className="drip-fee-sep" />
            <span>Sell Tax: <strong style={{ color: "#4ade80" }}>{DEMO.fees.sellTax}%</strong></span>
          </div>
          <p className="drip-fee-note">The above allocations are applied to both buy and sells (Token-side fees are auto burned.)</p>
        </div>
      </section>

      <ValuePropBar />
    </div>
  );
}
