"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/use-reveal";
import { Lang, content } from "@/lib/content";

export function Channels({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = content[lang].channels;

  return (
    <section className="section channels" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline">{t.head}</h2>
          <p className="section-body">{t.body}</p>
        </div>
        <div className="channels-wrap reveal reveal-d1">
          {t.pills.map((p) => (
            <span key={p} className="channel-pill">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
