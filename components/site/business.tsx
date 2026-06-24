"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/use-reveal";
import { Lang, content } from "@/lib/content";

export function Business({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = content[lang].business;

  return (
    <section className="section business" id="business" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline" dangerouslySetInnerHTML={{ __html: t.head }} />
          <p className="section-body">{t.body}</p>
        </div>
        <div className="business-tiles">
          {t.tiles.map((tile, i) => (
            <div key={tile.num} className={`business-tile reveal reveal-d${i + 1}`}>
              <div className="business-tile-num">{tile.num}</div>
              <h3 className="business-tile-title">{tile.title}</h3>
              <p className="business-tile-desc">{tile.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
