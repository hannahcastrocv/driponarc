import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Droplet, Flame, RefreshCw, Shield, Copy, Check, ArrowRight, ChevronDown,
  CircleDollarSign, Lock, ExternalLink, Radio, Loader2, AlertTriangle,
} from "lucide-react";
import { ASSETS, DRIP_ADDRESS, EXPLORER } from "../config.js";
import { usd, num, pct, shortenAddress } from "../lib/format.js";

export const NAV = [
  { id: "home", label: "Home" },
  { id: "reflections", label: "Reflections" },
  { id: "burns", label: "Burns" },
  { id: "buyback", label: "Buyback" },
  { id: "faq", label: "FAQ" },
];

export function Mark({ style }) {
  return <img className="drip-mark" src={ASSETS.mark} alt="DRIP mascot" style={style} />;
}

export function XLogo({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Scene({ img, dur, glow }) {
  return (
    <div className="drip-scene">
      <img className={`drip-scene-img drip-float ${glow || ""}`} src={img} alt="" style={{ animationDuration: dur }} />
    </div>
  );
}

export function BrandMark({ size = 30 }) {
  return (
    <span className="drip-brand">
      <span className="drip-brand-icon" style={{ width: size, height: size }}><Mark /></span>
      <span className="drip-wordmark">DRIP</span>
    </span>
  );
}

export function Eyebrow({ children }) {
  return <div className="drip-eyebrow">{children}</div>;
}

export function AccentButton({ children, onClick, className = "" }) {
  return <button className={`drip-btn drip-btn-primary ${className}`} onClick={onClick}>{children}</button>;
}

export function GhostButton({ children, onClick, icon }) {
  return <button className="drip-btn drip-btn-ghost" onClick={onClick}>{icon}{children}</button>;
}

export function LiveBadge({ status, latestBlock }) {
  if (status === "ready") {
    return (
      <span className="drip-live drip-live-on" title={`Latest indexed block #${latestBlock}`}>
        <span className="drip-live-dot" /> LIVE <em>#{num(latestBlock)}</em>
      </span>
    );
  }
  if (status === "loading") {
    return <span className="drip-live drip-live-wait"><Loader2 size={12} className="drip-spin" /> INDEXING</span>;
  }
  if (status === "error") {
    return <span className="drip-live drip-live-err"><AlertTriangle size={12} /> RPC ERROR</span>;
  }
  return <span className="drip-live drip-live-off"><Radio size={12} /> RPC NOT SET</span>;
}

export function Notice({ status, error }) {
  if (status === "needs-config") {
    return (
      <div className="drip-panel drip-notice">
        <div className="drip-notice-title"><Radio size={16} /> Connect an Arc RPC to go live</div>
        <p>This dashboard reads all numbers directly from Arc Mainnet. Set <code>ARC.rpcUrl</code> in <code>src/config.js</code> to an Arc Mainnet RPC endpoint, then rebuild. No statistics are shown until the chain is connected.</p>
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div className="drip-panel drip-notice">
        <div className="drip-notice-title"><Loader2 size={16} className="drip-spin" /> Indexing Arc Mainnet...</div>
        <p>Backfilling DRIP transfers, reflections, burns and buybacks from the chain. This can take a moment on first load.</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="drip-panel drip-notice drip-notice-err">
        <div className="drip-notice-title"><AlertTriangle size={16} /> Could not read the chain</div>
        <p>{error || "The RPC request failed."} Check the RPC URL and that it allows <code>eth_getLogs</code>.</p>
      </div>
    );
  }
  return null;
}

export function ChartCard({ title, unit, data, color, gradId, tickFmt }) {
  const empty = !data || data.length === 0;
  return (
    <div className="drip-panel drip-chart-panel">
      <div className="drip-chart-head">
        <div>
          <div className="drip-chart-title">{title}</div>
          <div className="drip-chart-unit">{unit}</div>
        </div>
        <div className="drip-pill">Lifetime <ChevronDown size={13} /></div>
      </div>
      <div style={{ width: "100%", height: 220 }}>
        {empty ? (
          <div className="drip-chart-empty">No on-chain data in range yet</div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 8, right: 10, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#16203a" vertical={false} />
              <XAxis dataKey="label" stroke="#5b6779" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={6} />
              <YAxis stroke="#5b6779" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={44} tickFormatter={tickFmt} />
              <Tooltip
                cursor={{ stroke: color, strokeOpacity: 0.3 }}
                contentStyle={{ background: "#0b1322", border: "1px solid #1c2842", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#8a97ad" }} itemStyle={{ color: color }}
                formatter={(v) => [tickFmt ? tickFmt(v) : num(v), "Total"]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.4} fill={`url(#${gradId})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function ContractAddressCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DRIP_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) { /* clipboard unavailable */ }
  };
  return (
    <div className="drip-panel drip-ca">
      <div className="drip-ca-title">CONTRACT ADDRESS (CA)</div>
      <p className="drip-ca-sub">Always verify the address before you trade.</p>
      <div className="drip-ca-row">
        <span className="drip-ca-addr drip-mono" title={DRIP_ADDRESS}>{DRIP_ADDRESS}</span>
        <button className="drip-ca-copy" onClick={copy} aria-label="Copy contract address">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <a className="drip-ca-scan" href={EXPLORER.token(DRIP_ADDRESS.toLowerCase())} target="_blank" rel="noreferrer">
        View on Arc-Scan <ExternalLink size={13} />
      </a>
    </div>
  );
}

export function ExplorerLink({ value, kind = "tx", className = "" }) {
  const isFull = typeof value === "string" && /^0x[0-9a-fA-F]{40,64}$/.test(value);
  const short = value && value.length > 14 ? value.slice(0, 6) + "..." + value.slice(-4) : value;
  if (!isFull) return <span className={`drip-mono ${className}`}>{short}</span>;
  const href = kind === "address" ? EXPLORER.address(value) : EXPLORER.tx(value);
  return (
    <a className={`drip-mono drip-exlink ${className}`} href={href} target="_blank" rel="noreferrer">{short}</a>
  );
}

export function ValuePropBar() {
  const items = [
    { icon: <Droplet size={17} />, t: "Automatic", s: "Accrual" },
    { icon: <Shield size={17} />, t: "Transparent", s: "On-Chain" },
    { icon: <Lock size={17} />, t: "Secure", s: "& Verified" },
  ];
  return (
    <div className="drip-panel drip-valueprop">
      <div className="drip-valueprop-left">
        <span className="drip-valueprop-mascot"><Mark /></span>
        <div>
          <div className="drip-valueprop-title">AUTOMATIC ACCRUAL. <span className="drip-accent">NO STAKING.</span> NO LOCKUPS.</div>
          <p className="drip-valueprop-sub">Hold DRIP and your USDC reflections accrue automatically. Claim them any time on Radardex.</p>
        </div>
      </div>
      <div className="drip-valueprop-right">
        {items.map((it) => (
          <div key={it.t} className="drip-vp-chip">
            <span className="drip-vp-chip-icon">{it.icon}</span>
            <span><strong>{it.t}</strong><em>{it.s}</em></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`drip-faq-item ${open ? "open" : ""}`}>
      <button className="drip-faq-q" onClick={onToggle}>
        <span>{q}</span><ChevronDown size={18} className="drip-faq-chevron" />
      </button>
      <div className="drip-faq-a-wrap"><div className="drip-faq-a">{a}</div></div>
    </div>
  );
}

export function StatRow({ items }) {
  return (
    <div className="drip-panel drip-statrow">
      {items.map((s) => (
        <div key={s.label} className="drip-mstat">
          <span className="drip-mstat-label">{s.label}</span>
          <span className="drip-mstat-value">{s.icon}{s.icon ? " " : ""}{s.value} {s.unit && <em>{s.unit}</em>}</span>
          {s.foot && <span className="drip-mstat-foot">{s.foot}</span>}
        </div>
      ))}
    </div>
  );
}

export function PageShell({ eyebrow, title, accentTitle, sub, scene, children }) {
  return (
    <div className="drip-page">
      <section className="drip-subhero">
        <div className="drip-subhero-left">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="drip-h1 drip-h1-sub">{title}<br /><span className="drip-accent">{accentTitle}</span></h1>
          <p className="drip-lead">{sub}</p>
        </div>
        <div className="drip-subhero-right">{scene}</div>
      </section>
      {children}
    </div>
  );
}

export function WalletDashboard({ wallet, ready }) {
  if (!wallet) {
    return (
      <div className="drip-panel drip-wallet drip-wallet-empty">
        <span className="drip-eyebrow" style={{ margin: 0 }}>YOUR WALLET STATS</span>
        <p className="drip-wallet-hint">
          {ready ? "Paste a wallet address above to see its live DRIP stats." : "Live data is still loading. Paste an address once indexing finishes."}
        </p>
      </div>
    );
  }
  const tile = (label, sub, icon, value, foot, color) => (
    <div className="drip-wtile">
      <div className="drip-wtile-label">{label}{sub ? <em> {sub}</em> : null}</div>
      <div className="drip-wtile-value"><span className="drip-wtile-icon" style={{ color }}>{icon}</span>{value}</div>
      <div className="drip-wtile-foot">{foot}</div>
    </div>
  );
  return (
    <div className="drip-panel drip-wallet">
      <div className="drip-wallet-head">
        <span className="drip-eyebrow" style={{ margin: 0 }}>YOUR WALLET STATS</span>
        <span className={`drip-connected ${wallet.found ? "" : "drip-connected-off"}`}>
          <span className="drip-dot" /> {wallet.found ? "On-chain" : "No activity"}
        </span>
      </div>
      <div className="drip-wallet-addr">
        <ExplorerLink value={wallet.address} kind="address" />
      </div>
      {wallet.found ? (
        <>
          <div className="drip-wallet-grid">
            {tile("DRIP BALANCE", "", <Droplet size={16} />, num(wallet.balance), "", "#5fb0ff")}
            {tile("% OF TOTAL SUPPLY", "", <CircleDollarSign size={16} />, pct(wallet.pctTotal), "", "#38bdf8")}
            {tile("% OF CIRCULATING", "", <CircleDollarSign size={16} />, pct(wallet.pctCirc), "", "#38bdf8")}
            {tile("TOTAL USDC REFLECTED", "", <CircleDollarSign size={16} />, usd(wallet.reflectionsTotal), "", "#38bdf8")}
            {tile("LAST REFLECTION", "", <CircleDollarSign size={16} />, wallet.lastReflection ? usd(wallet.lastReflection.usdc) : "-", wallet.lastReflection ? wallet.lastReflection.time : "", "#38bdf8")}
          </div>
          <div className="drip-wallet-foot">
            <span>Claimed / unclaimed splits are tracked on Radardex, not on-chain here.</span>
          </div>
        </>
      ) : (
        <p className="drip-wallet-hint">No DRIP balance or reflections found on-chain for this address.</p>
      )}
    </div>
  );
}

export const FAQS = [
  { q: "What is DRIP?", a: "DRIP is a reflection-powered memecoin on Arc. Every transaction rewards holders with USDC, burns DRIP, and supports the market with buybacks." },
  { q: "How do USDC reflections work?", a: "A portion of every transaction is converted to USDC and accrues automatically to all eligible DRIP holders in proportion to their holdings. You withdraw your accumulated USDC by claiming on Radardex." },
  { q: "Do I need to claim my USDC reflections?", a: "Yes. Your USDC reflections accumulate as you hold DRIP, and you claim them on Radardex. Connect your wallet on Radardex to claim your USDC." },
  { q: "What is the DRIP burn mechanism?", a: "DRIP is burned automatically as fees are collected on the token side, permanently removing DRIP from supply over time and increasing scarcity." },
  { q: "How does the buyback mechanism work?", a: "Accumulated fees are used to buy DRIP from the open market, supporting price stability and increasing long-term value." },
  { q: "What are the DRIP transaction fees?", a: "DRIP has a 1% tax on buys and a 1% tax on sells. Fees are allocated 50% to USDC reflections, 25% to a combined burn and buyback, and 25% to treasury." },
  { q: "Is DRIP secure?", a: "DRIP is built with security in mind. All core functions are on-chain, transparent, and verifiable. The contract is verified on the Arc explorer." },
  { q: "How can I buy DRIP?", a: "You can buy DRIP on Radardex on Arc. Use the Buy DRIP button, and always verify the contract address first." },
];
