import React, { useState } from "react";
import { ASSETS } from "../config.js";
import { Scene, PageShell, FaqItem, ValuePropBar, FAQS } from "../components/common.jsx";

export default function Faq() {
  const [open, setOpen] = useState(0);
  const left = FAQS.slice(0, 4);
  const right = FAQS.slice(4);
  return (
    <PageShell eyebrow="FAQ" title="FREQUENTLY" accentTitle="ASKED QUESTIONS"
      sub="Everything you need to know about DRIP. Cannot find your answer? Join our community."
      scene={<Scene img={ASSETS.faq} dur="5.8s" glow="drip-glow-blue" />}>
      <section className="drip-faq-grid">
        <div>{left.map((f, i) => (<FaqItem key={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />))}</div>
        <div>{right.map((f, i) => { const idx = i + 4; return <FaqItem key={idx} q={f.q} a={f.a} open={open === idx} onToggle={() => setOpen(open === idx ? -1 : idx)} />; })}</div>
      </section>
      <ValuePropBar />
    </PageShell>
  );
}
