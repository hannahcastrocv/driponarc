import React, { useState } from "react";
import { Droplet, Flame, RefreshCw, Shield, BarChart3, ArrowRight } from "lucide-react";
import { ASSETS, TOKENOMICS } from "../config.js";
import { usd, num, pct } from "../lib/format.js";
import { useLiveData } from "../lib/useLiveData.jsx";
import {
  Scene, AccentButton, WalletDashboard, ContractAddressCard, ValuePropBar,
  Notice, ExplorerLink,
} from "../components/common.jsx";

export default function Home() {
  const { status, error, stats, lookupWallet } = useLiveData();
  const ready = status === "ready";
  const [wallet, setWallet] = useState(null);
  const [input, setInput] = useState("");

  const check = () => {
    if (!input.trim() || !ready) return;
    setWallet(lookupWallet(input.trim()));
  };

  const features = [
    { icon: <Droplet size={20} />, t: "USDC REFLECTIONS", s: "Claim on Radardex", c: "#5fb0ff" },
    { icon: <Flame size={20} />, t: "AUTOMATIC BURN", s: "On Every Tx", c: "#fb923c" },
    { icon: <RefreshCw size={20} />, t: "BUYBACK", s: "Manual, on-chain", c: "#4ade80" },
    { icon: <Shield size={20} />, t: "TRANSPARENT & SECURE", s: "On-Chain", c: "#38bdf8" },
  ];
  const fees = [
    { pct: TOKENOMICS.reflection, label: "USDC REFLECTION", icon: <Droplet size={18} />, c: "#5fb0ff" },
    { pct: TOKENOMICS.burnBuyback, label: "BURN & BUYBACK", icon: (<span className="drip-fee-dualicon"><Flame size={18} style={{ color: "#fb923c" }} /><RefreshCw size={18} style={{ color: "#4ade80" }} /></span>), c: "#fb923c" },
    { pct: TOKENOMICS.treasury, label: "TREASURY", icon: <BarChart3 size={18} />, c: "#c084fc" },
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
              <p className="drip-checker-sub">Paste any wallet address to see its live DRIP stats.</p>
              <div className="drip-checker-row">
                <input className="drip-input" placeholder="0x..." value={input}
                  onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} />
                <AccentButton onClick={check}>CHECK STATS <ArrowRight size={15} /></AccentButton>
              </div>
            </div>
            <ContractAddressCard />
          </div>
          <WalletDashboard wallet={wallet} ready={ready} />
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

      {!ready ? (
        <Notice status={status} error={error} />
      ) : (
        <section className="drip-home-two">
          <div className="drip-panel drip-mainstats">
            <div className="drip-mstat"><span className="drip-mstat-label">USDC REFLECTED (TOTAL)</span><span className="drip-mstat-value">{usd(stats.usdcReflected)}</span></div>
            <div className="drip-mstat"><span className="drip-mstat-label">DRIP BURNED (TOTAL)</span><span className="drip-mstat-value"><Flame size={17} style={{ color: "#fb923c" }} /> {num(stats.totalBurned)} <em>DRIP</em></span><span className="drip-mstat-foot">{pct(stats.burnedPct)} of initial supply</span></div>
            <div className="drip-mstat"><span className="drip-mstat-label">DRIP BUYBACKS (TOTAL)</span><span className="drip-mstat-value">{usd(stats.buybacksUsd)}</span><span className="drip-mstat-foot">{num(stats.buybackCount)} buybacks</span></div>
            <div className="drip-mstat"><span className="drip-mstat-label">HOLDERS</span><span className="drip-mstat-value">{num(stats.holders)}</span></div>
            <div className="drip-mstat drip-mstat-wide">
              <span className="drip-mstat-label">CIRCULATING SUPPLY</span>
              <span className="drip-mstat-value">{num(stats.circulating)} <em>DRIP</em></span>
              <div className="drip-supplybar"><span style={{ width: `${Math.min(100, Math.max(0, (stats.circulating / stats.totalSupply) * 100))}%` }} /></div>
              <span className="drip-mstat-foot">{pct((stats.circulating / stats.totalSupply) * 100)} of {num(stats.totalSupply)} initial</span>
            </div>
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
              <span>Buy Tax: <strong style={{ color: "#4ade80" }}>{TOKENOMICS.buyTax}%</strong></span>
              <span className="drip-fee-sep" />
              <span>Sell Tax: <strong style={{ color: "#4ade80" }}>{TOKENOMICS.sellTax}%</strong></span>
            </div>
            <p className="drip-fee-note">Reflection, burn and buyback totals above are read live from Arc Mainnet.</p>
          </div>
        </section>
      )}

      {ready && stats.topHolders.length > 0 && (
        <section className="drip-panel drip-table drip-holders">
          <div className="drip-table-head">TOP HOLDERS <em>(live, excludes burn addresses)</em></div>
          <div className="drip-table-rows">
            <div className="drip-tr drip-tr-holders drip-tr-head"><span>#</span><span>Address</span><span>DRIP</span><span>% Supply</span><span>USDC Reflected</span></div>
            {stats.topHolders.slice(0, 10).map((h, i) => (
              <div key={h.address} className="drip-tr drip-tr-holders">
                <span className="drip-muted">{i + 1}</span>
                <ExplorerLink value={h.address} kind="address" />
                <span>{num(h.balance)}</span>
                <span className="drip-muted">{pct(h.pctTotal)}</span>
                <span style={{ color: "#38bdf8" }}>{usd(h.reflections)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <ValuePropBar />
    </div>
  );
}
