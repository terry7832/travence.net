"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Lang, content } from "@/lib/content";

export function ScrollExpand({ lang }: { lang: Lang }) {
  const t = content[lang].hero;
  const base = lang === "en" ? "/en" : "/";
  const secRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const media = mediaRef.current;
    const cover = coverRef.current;
    const cta = ctaRef.current;
    const hint = hintRef.current;
    const story = storyRef.current;
    if (!sec || !media || !cover || !cta || !hint || !story) return;
    const sectionElement = sec;
    const mediaElement = media;
    const coverElement = cover;
    const ctaElement = cta;
    const hintElement = hint;
    const storyElement = story;

    const lerp = (a: number, b: number, t2: number) => a + (b - a) * t2;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const smoothstep = (v: number) => v * v * (3 - 2 * v);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = 0, vh = 0, startW = 0, startH = 0;
    function recalc() {
      vw = window.innerWidth;
      vh = window.innerHeight;
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

      mediaElement.style.width = lerp(startW, vw, e) + "px";
      mediaElement.style.height = lerp(startH, vh, e) + "px";
      mediaElement.style.borderRadius = lerp(24, 0, e) + "px";
      coverElement.style.opacity = String(1 - smoothstep(clamp((e - 0.04) / 0.46, 0, 1)));
      ctaElement.style.opacity = String(1 - smoothstep(clamp((e - 0.02) / 0.32, 0, 1)));
      ctaElement.style.pointerEvents = e > 0.25 ? "none" : "auto";
      hintElement.style.opacity = String(1 - smoothstep(clamp((e - 0.05) / 0.37, 0, 1)));
      const storyReveal = smoothstep(clamp((e - 0.42) / 0.3, 0, 1));
      storyElement.style.opacity = String(storyReveal);
      storyElement.style.transform = `translateY(${lerp(24, 0, storyReveal)}px)`;
    }

    let currentProgress = 0;
    let targetProgress = 0;
    let frameId = 0;
    let lastFrame = 0;
    let initialized = false;

    function animate(now: number) {
      const deltaSeconds = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const damping = 1 - Math.exp(-11 * deltaSeconds);
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
      recalc();
      syncProgress(true);
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
      <div className="se-sticky">
        <div className="se-media" id="seMedia" ref={mediaRef}>
          <Image
            className="se-background"
            src="/hero-matterhorn.webp"
            alt={lang === "en" ? "The Matterhorn at dawn above the clouds" : "구름 위로 솟은 새벽의 마테호른"}
            fill
            priority
            sizes="100vw"
          />
          <div className="se-overlay"></div>
          <div className="se-story" ref={storyRef}>
            <p className="se-story-eyebrow">{t.origin.eyebrow}</p>
            <h2>
              {t.origin.title.map((line) => <span key={line}>{line}</span>)}
            </h2>
            <p className="se-story-body">{t.origin.body}</p>
          </div>
          <div className="se-logo-cover" ref={coverRef}>
            <Image src="/hero-logo.png" alt="TRAVENCE" width={912} height={598} priority />
            <p className="se-logo-tagline">{t.tagline}</p>
          </div>
        </div>
        <div className="se-action-stack">
          <div className="se-hint" id="seHint" ref={hintRef}>{t.scrollHint}</div>
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
