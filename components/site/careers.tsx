"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/use-reveal";
import { EMAIL_HREF } from "@/lib/site";
import { Lang, content } from "@/lib/content";

const APPLY_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLScUCbXb32zdz2vkzEU5cKztBQK5M2kPz1qGalL9R6zEkCN0LA/viewform";

export function Careers({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = content[lang].careers;

  return (
    <section className="section careers" id="careers" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline" dangerouslySetInnerHTML={{ __html: t.head }} />
        </div>

        <div className="careers-message reveal reveal-d1">
          <div className="careers-ceo-label">{t.ceoLabel}</div>
          <div className="careers-quote">
            {t.quoteHtml.map((html, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>

          <div className="careers-signature">
            <div className="careers-sig-info">
              <div className="careers-sig-name">{t.sigName}</div>
              <div className="careers-sig-title">{t.sigTitle}</div>
            </div>
            <div className="careers-cta-row">
              <a href={lang === "en" ? EMAIL_HREF : APPLY_FORM} target="_blank" rel="noopener noreferrer" className="careers-btn">
                {t.apply}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              {t.orEmailLink && (
                <span className="careers-email-note">{t.orEmailPre}<a href={EMAIL_HREF}>{t.orEmailLink}</a></span>
              )}
            </div>
          </div>
        </div>

        <div className="careers-positions reveal reveal-d2">
          {t.positions.map((pos, i) => (
            <div key={i} className="careers-position">
              <div className="careers-position-top">
                <div className="careers-position-title">{pos.title}</div>
                <span className="careers-hiring-badge"><span className="hiring-dot"></span>{t.hiring}</span>
              </div>
              <div className="careers-position-meta">{pos.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
