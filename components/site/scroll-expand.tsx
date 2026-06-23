"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function ScrollExpand() {
  const secRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const media = mediaRef.current;
    const cover = coverRef.current;
    const cta = ctaRef.current;
    const hint = hintRef.current;
    if (!sec || !media || !cover || !cta || !hint) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    let vw = 0, vh = 0, startW = 0, startH = 0;
    function recalc() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      startW = Math.min(360, vw * 0.86);
      startH = Math.min(480, vh * 0.56);
    }

    let ticking = false;
    function update() {
      ticking = false;
      if (!sec || !media || !cover || !cta || !hint) return;
      const rect = sec.getBoundingClientRect();
      const total = sec.offsetHeight - vh;
      const passed = clamp(-rect.top, 0, total);
      const p = total > 0 ? passed / total : 0;
      const e = clamp(p / 0.8, 0, 1);

      media.style.width = lerp(startW, vw, e) + "px";
      media.style.height = lerp(startH, vh, e) + "px";
      media.style.borderRadius = lerp(24, 0, e) + "px";
      cover.style.opacity = String(clamp(1 - e * 2, 0, 1));        // 로고 커버 사라짐
      cta.style.opacity = String(clamp(1 - e * 2.5, 0, 1));        // 버튼 사라짐
      cta.style.pointerEvents = e > 0.25 ? "none" : "auto";
      hint.style.opacity = String(clamp(1 - e * 2, 0, 1));
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    function onResize() {
      recalc();
      update();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    recalc();
    update();
    const timer = setTimeout(() => { recalc(); update(); }, 250);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="scroll-expand" id="scrollExpand" ref={secRef}>
      <div className="se-sticky">
        <div className="se-media" id="seMedia" ref={mediaRef}>
          <video src="/hero-bg.mp4" autoPlay muted loop playsInline preload="auto"></video>
          <div className="se-overlay"></div>
          <div className="se-logo-cover" ref={coverRef}>
            <Image src="/hero-logo.png" alt="TRAVENCE" width={912} height={598} priority />
            <p className="se-logo-tagline">여행의 본질을 담다</p>
          </div>
        </div>
        <div className="se-cta" ref={ctaRef}>
          <a href="#brands" className="btn-blue">
            브랜드 살펴보기
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
          <a href="#about" className="btn-outline">
            더 알아보기
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </a>
        </div>
        <div className="se-hint" id="seHint" ref={hintRef}>스크롤하여 펼치기</div>
      </div>
    </section>
  );
}
