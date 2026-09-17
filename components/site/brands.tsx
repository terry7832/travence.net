"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Lang, content } from "@/lib/content";
import { BRANDS } from "@/lib/brands";

const NAV_OFFSET = 56 + 12;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Brands({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const t = content[lang].brandsSection;
  const isEn = lang === "en";

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setShown((prev) => {
          const next = new Set(prev);
          let changed = false;
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const key = (e.target as HTMLElement).dataset.reveal;
              if (key && !next.has(key)) { next.add(key); changed = true; }
            }
          });
          return changed ? next : prev;
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 120px 0px" }
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 펼친 뒤 레이아웃이 확정된 다음 카드 위치를 잡는다.
  // 화면보다 큰 카드는 상단(로고·이름)이 내비 바로 아래 오도록, 작은 카드는 가운데로.
  useEffect(() => {
    if (!expanded) return;
    const card = cardRefs.current[expanded];
    if (!card) return;
    const frame = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const viewH = window.innerHeight;
      const fits = rect.height <= viewH - NAV_OFFSET - 16;
      const top = fits
        ? window.scrollY + rect.top - (viewH - rect.height) / 2
        : window.scrollY + rect.top - NAV_OFFSET;
      window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [expanded]);

  const collapse = (slug: string) => {
    setExpanded(null);
    // 접힌 뒤 카드 상단이 내비 뒤로 숨었다면 다시 보이게 끌어내린다
    requestAnimationFrame(() => {
      const card = cardRefs.current[slug];
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (rect.top < NAV_OFFSET) {
        window.scrollTo({ top: window.scrollY + rect.top - NAV_OFFSET, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    });
  };

  const rev = (key: string) => `reveal${shown.has(key) ? " visible" : ""}`;

  return (
    <section className={`section brands${isEn ? " brands-en" : ""}`} id="brands" ref={ref}>
      <div className="section-inner">
        <div className={rev("head")} data-reveal="head">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline" dangerouslySetInnerHTML={{ __html: t.head }} />
          <p className="section-body">{t.body}</p>
        </div>
        <div className="brands-grid">
          {BRANDS.map((b) => {
            const isOpen = expanded === b.slug;
            const desc = isEn ? b.descEn : b.desc;
            const highlights = isEn ? b.highlightsEn : b.highlights;
            const storeLink = isEn ? b.linkEn : (b.link ?? b.linkEn);
            const isShown = shown.has(b.slug);
            const isLoaded = loaded.has(b.slug);
            return (
              <div
                key={b.slug}
                ref={(el) => { cardRefs.current[b.slug] = el; }}
                data-reveal={b.slug}
                data-photo={b.photo}
                className={`brand-card expandable ${rev(b.slug)} reveal-d${b.delay}${isOpen ? " expanded" : ""}`}
              >
                <div className="brand-card-main">
                  <div className="brand-card-icon">
                    <Image
                      src={`/brands/${b.slug}-logo.png`}
                      alt={`${b.en} logo`}
                      width={b.logoW}
                      height={b.logoH}
                      sizes="(max-width: 768px) 112px, 180px"
                    />
                  </div>
                  <div className="brand-card-name">
                    {isEn ? b.en : (
                      <>
                        <span className="name-kr">{b.kr}</span>
                        <span className="name-en">{b.en}</span>
                      </>
                    )}
                  </div>
                  <div className="brand-card-category">
                    {isEn ? b.catEn : (
                      <>
                        <span className="name-kr">{b.catKr}</span>
                        <span className="name-en">{b.catEn}</span>
                      </>
                    )}
                  </div>
                  <p className="brand-card-desc">{desc}</p>
                  <div className="brand-detail-highlights">
                    {highlights.map((h, i) => (
                      <div key={i} className="brand-highlight"><span className="brand-highlight-text">{h}</span></div>
                    ))}
                  </div>
                  <div className="brand-card-actions">
                    {storeLink ? (
                      <a
                        href={storeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brand-card-link"
                      >
                        {t.officialStore}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="brand-card-toggle"
                      aria-expanded={isOpen}
                      aria-controls={`brand-detail-${b.slug}`}
                      onClick={() => (isOpen ? collapse(b.slug) : setExpanded(b.slug))}
                    >
                      {isOpen ? t.collapse : t.expand}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  </div>
                </div>
                <div className="brand-card-detail" id={`brand-detail-${b.slug}`}>
                  <div className={`brand-detail-visual${isLoaded ? " is-loaded" : ""}`}>
                    {/* 카드가 화면에 들어오면 미리 받아 두어, 펼치는 순간 사진이 바로 보이게 */}
                    <Image
                      src={`/brands/${b.slug}-photo.jpg`}
                      alt={isEn ? `${b.en} ${b.catEn}` : `${b.kr} ${b.catKr} 제품 이미지`}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      loading={isShown ? "eager" : "lazy"}
                      style={{ objectFit: "cover" }}
                      onLoad={() => setLoaded((prev) => (prev.has(b.slug) ? prev : new Set(prev).add(b.slug)))}
                    />
                    {isOpen ? (
                      <button
                        type="button"
                        className="brand-detail-close"
                        onClick={() => collapse(b.slug)}
                      >
                        {t.collapse}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6" /></svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
