"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Lang, content } from "@/lib/content";

export function ScrollExpand({ lang }: { lang: Lang }) {
  const t = content[lang].hero;
  const base = lang === "en" ? "/en" : "/";
  const secRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const sticky = stickyRef.current;
    const media = mediaRef.current;
    const zoom = zoomRef.current;
    const shadow = shadowRef.current;
    const cover = coverRef.current;
    const cta = ctaRef.current;
    const hint = hintRef.current;
    const eyebrow = eyebrowRef.current;
    const title = titleRef.current;
    const body = bodyRef.current;
    if (!sec || !sticky || !media || !zoom || !shadow || !cover || !cta || !hint || !eyebrow || !title || !body) return;
    const sectionElement = sec;
    const stickyElement = sticky;
    const mediaElement = media;
    const zoomElement = zoom;
    const shadowElement = shadow;
    const coverElement = cover;
    const ctaElement = cta;
    const hintElement = hint;
    const eyebrowElement = eyebrow;
    const titleElement = title;
    const bodyElement = body;

    const lerp = (a: number, b: number, t2: number) => a + (b - a) * t2;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const smoothstep = (v: number) => v * v * (3 - 2 * v);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = 0, vh = 0, startW = 0, startH = 0;
    function recalc() {
      // 스티키 박스 실측 — 모바일 주소창 변동에도 카드가 정중앙에 오도록
      vw = stickyElement.clientWidth;
      vh = stickyElement.clientHeight;
      startW = Math.min(360, vw * 0.86);
      startH = Math.min(480, vh * 0.56);
    }

    function readProgress() {
      const rect = sectionElement.getBoundingClientRect();
      const total = sectionElement.offsetHeight - vh;
      const passed = clamp(-rect.top, 0, total);
      const p = total > 0 ? passed / total : 0;
      return clamp(p / 0.8, 0, 1);
    }

    function render(progress: number) {
      const e = smoothstep(progress);

      // 카드는 clip-path 창으로만 열린다 — 이미지 리레이아웃 없이 합성만 하므로 매끄럽다
      const w = lerp(startW, vw, e);
      const h = lerp(startH, vh, e);
      const r = lerp(28, 0, e);
      const ix = Math.max((vw - w) / 2, 0);
      const iy = Math.max((vh - h) / 2, 0);
      mediaElement.style.clipPath = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${r.toFixed(2)}px)`;
      zoomElement.style.transform = `scale(${lerp(1.14, 1, e).toFixed(4)})`;
      // 스토리 텍스트가 창 가장자리에 잘리지 않고 함께 미끄러져 들어오도록 창 안쪽 기준으로 앵커
      mediaElement.style.setProperty("--se-ix", `${ix.toFixed(2)}px`);
      mediaElement.style.setProperty("--se-iy", `${iy.toFixed(2)}px`);

      shadowElement.style.width = `${w.toFixed(2)}px`;
      shadowElement.style.height = `${h.toFixed(2)}px`;
      shadowElement.style.borderRadius = `${r.toFixed(2)}px`;
      shadowElement.style.opacity = String(1 - smoothstep(clamp((e - 0.5) / 0.4, 0, 1)));

      coverElement.style.opacity = String(1 - smoothstep(clamp((e - 0.05) / 0.45, 0, 1)));
      ctaElement.style.opacity = String(1 - smoothstep(clamp((e - 0.02) / 0.32, 0, 1)));
      ctaElement.style.pointerEvents = e > 0.25 ? "none" : "auto";
      hintElement.style.opacity = String(1 - smoothstep(clamp((e - 0.05) / 0.37, 0, 1)));

      // 스토리는 눈썹글 → 제목 → 본문 순서로 시차를 두고 떠오른다
      const reveal = (from: number, span: number) => smoothstep(clamp((e - from) / span, 0, 1));
      const eEyebrow = reveal(0.4, 0.26);
      const eTitle = reveal(0.45, 0.28);
      const eBody = reveal(0.51, 0.3);
      eyebrowElement.style.opacity = String(eEyebrow);
      eyebrowElement.style.transform = `translateY(${lerp(18, 0, eEyebrow).toFixed(2)}px)`;
      titleElement.style.opacity = String(eTitle);
      titleElement.style.transform = `translateY(${lerp(26, 0, eTitle).toFixed(2)}px)`;
      bodyElement.style.opacity = String(eBody);
      bodyElement.style.transform = `translateY(${lerp(22, 0, eBody).toFixed(2)}px)`;
    }

    let currentProgress = 0;
    let targetProgress = 0;
    let frameId = 0;
    let lastFrame = 0;
    let initialized = false;

    function animate(now: number) {
      const deltaSeconds = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const damping = 1 - Math.exp(-9 * deltaSeconds);
      currentProgress += (targetProgress - currentProgress) * damping;

      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress;
        render(currentProgress);
        frameId = 0;
        return;
      }

      render(currentProgress);
      frameId = requestAnimationFrame(animate);
    }

    function syncProgress(immediate = false) {
      targetProgress = readProgress();
      if (!initialized || immediate || reduceMotion) {
        initialized = true;
        currentProgress = targetProgress;
        render(currentProgress);
        return;
      }
      if (!frameId) {
        lastFrame = performance.now();
        frameId = requestAnimationFrame(animate);
      }
    }

    function onScroll() {
      syncProgress();
    }
    function onResize() {
      // 모바일 주소창이 접히며 높이만 바뀔 땐 스냅 없이 부드럽게 따라간다
      const widthChanged = stickyElement.clientWidth !== vw;
      recalc();
      syncProgress(widthChanged);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    recalc();
    syncProgress(true);
    const timer = setTimeout(() => { recalc(); syncProgress(true); }, 250);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="scroll-expand" id="scrollExpand" ref={secRef}>
      <div className="se-sticky" ref={stickyRef}>
        <div className="se-card-shadow" ref={shadowRef} aria-hidden="true"></div>
        <div className="se-media" id="seMedia" ref={mediaRef}>
          <div className="se-zoom" ref={zoomRef}>
            <Image
              className="se-background"
              src="/hero-matterhorn.webp"
              alt={lang === "en" ? "The Matterhorn at dawn above the clouds" : "구름 위로 솟은 새벽의 마테호른"}
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="se-overlay"></div>
          <div className="se-story">
            <p className="se-story-eyebrow" ref={eyebrowRef}>{t.origin.eyebrow}</p>
            <h2 ref={titleRef}>
              {t.origin.title.map((line) => <span key={line}>{line}</span>)}
            </h2>
            <p className="se-story-body" ref={bodyRef}>{t.origin.body}</p>
          </div>
          <div className="se-logo-cover" ref={coverRef}>
            <Image src="/hero-logo.png" alt="TRAVENCE" width={912} height={598} priority />
            <p className="se-logo-tagline">{t.tagline}</p>
          </div>
        </div>
        <div className="se-action-stack">
          <div className="se-hint" id="seHint" ref={hintRef}>
            <span>{t.scrollHint}</span>
            <svg className="se-hint-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <div className="se-cta" ref={ctaRef}>
            <a href={`${base}#brands`} className="btn-blue">
              {t.exploreBrands}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href={`${base}#about`} className="btn-outline">
              {t.learnMore}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
