"use client";

import { useRef } from "react";
import { DiaText } from "@/components/ui/dia-text";
import { useReveal } from "@/lib/use-reveal";
import { Lang, content } from "@/lib/content";

export function About({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = content[lang].about;

  return (
    <section className={`section about${lang === "en" ? " about-en" : ""}`} id="about" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline">
            {t.headLead}{" "}
            <DiaText
              className="-translate-y-[0.06em]"
              repeat
              repeatDelay={1.1}
              fixedWidth
              text={t.headWords}
            />
          </h2>
        </div>
        <p
          className="about-statement reveal reveal-d1"
          dangerouslySetInnerHTML={{ __html: t.statementHtml }}
        />
        <div className="stats-row reveal reveal-d2">
          {t.stats.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-number">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
