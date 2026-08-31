import React, { useState } from "react";
import { Flame, Menu, X, Send } from "lucide-react";
import { LINKS, ASSETS } from "./config.js";
import { NAV, Mark, BrandMark, XLogo, LiveBadge } from "./components/common.jsx";
import { LiveDataProvider, useLiveData } from "./lib/useLiveData.jsx";
import Home from "./pages/Home.jsx";
import Reflections from "./pages/Reflections.jsx";
import Burns from "./pages/Burns.jsx";
import Buyback from "./pages/Buyback.jsx";
import Faq from "./pages/Faq.jsx";

function Navbar({ page, go }) {
  const [open, setOpen] = useState(false);
  const { status, latestBlock } = useLiveData();
  return (
    <header className="drip-nav">
      <div className="drip-nav-inner">
        <button className="drip-nav-brand" onClick={() => go("home")}><BrandMark /></button>
        <nav className="drip-nav-links">
          {NAV.map((n) => (
            <button key={n.id} className={`drip-nav-link ${page === n.id ? "active" : ""}`} onClick={() => go(n.id)}>{n.label}</button>
          ))}
        </nav>
        <div className="drip-nav-right">
          <LiveBadge status={status} latestBlock={latestBlock} />
          <a className="drip-btn drip-btn-primary drip-buy" href={LINKS.buy} target="_blank" rel="noreferrer">BUY DRIP <Flame size={15} /></a>
          <button className="drip-nav-burger" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open && (
        <div className="drip-nav-mobile">
          {NAV.map((n) => (
            <button key={n.id} className={`drip-nav-mlink ${page === n.id ? "active" : ""}`} onClick={() => { go(n.id); setOpen(false); }}>{n.label}</button>
          ))}
          <a className="drip-btn drip-btn-primary" href={LINKS.buy} target="_blank" rel="noreferrer" style={{ margin: "8px 0 0" }}>BUY DRIP <Flame size={15} /></a>
        </div>
      )}
    </header>
  );
}

function Footer({ go }) {
  return (
    <footer className="drip-footer">
      <div className="drip-footer-inner">
        <div className="drip-footer-brand">
          <div className="drip-footer-brandrow">
            <span className="drip-brand-icon" style={{ width: 34, height: 34 }}><Mark /></span>
            <span className="drip-wordmark" style={{ fontSize: 26 }}>DRIP</span>
          </div>
          <div className="drip-footer-tag">HOLD. DRIP. BURN. REPEAT.</div>
          <p className="drip-footer-sub">More DRIP held. More USDC distributed. Less DRIP in circulation.</p>
        </div>
        <div className="drip-footer-col">
          <div className="drip-footer-h">QUICK LINKS</div>
          <div className="drip-footer-links">
            {NAV.map((n) => (<button key={n.id} className="drip-footer-link" onClick={() => go(n.id)}>{n.label}</button>))}
          </div>
        </div>
        <div className="drip-footer-col">
          <div className="drip-footer-h">CONNECT</div>
          <div className="drip-socials">
            <a href={LINKS.x} className="drip-social" aria-label="X" target="_blank" rel="noreferrer"><XLogo /></a>
            <a href={LINKS.telegram} className="drip-social" aria-label="Telegram" target="_blank" rel="noreferrer"><Send size={17} /></a>
          </div>
        </div>
        <div className="drip-footer-col">
          <div className="drip-footer-h">BUILT ON ARC</div>
          <div className="drip-arc">
            <span className="drip-arc-logo-img"><img src={ASSETS.arc} alt="Arc" /></span>
            <span className="drip-arc-word">Arc</span>
          </div>
        </div>
      </div>
      <div className="drip-footer-legal">© 2026 DRIP. All rights reserved.</div>
    </footer>
  );
}

function Shell() {
  const [page, setPage] = useState("home");
  const go = (id) => { setPage(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div className="drip-root">
      <Navbar page={page} go={go} />
      <main className="drip-main">
        {page === "home" && <Home />}
        {page === "reflections" && <Reflections />}
        {page === "burns" && <Burns />}
        {page === "buyback" && <Buyback />}
        {page === "faq" && <Faq />}
      </main>
      <Footer go={go} />
    </div>
  );
}

export default function App() {
  return (
    <LiveDataProvider>
      <Shell />
    </LiveDataProvider>
  );
}
