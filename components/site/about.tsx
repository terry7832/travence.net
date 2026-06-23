"use client";

import { useEffect, useRef } from "react";

import { DiaText } from "@/components/ui/dia-text";

export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 120px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section about" id="about" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">About</p>
          <h2 className="section-headline">
            여행을 더{" "}
            <DiaText
              className="-translate-y-[0.06em]"
              repeat
              repeatDelay={1.1}
              fixedWidth
              text={["안전하게.", "가볍게.", "스마트하게.", "재밌게."]}
            />
          </h2>
        </div>
        <p className="about-statement reveal reveal-d1">
          주식회사 트레벤스는 전신인 <strong>에스비에스코리아</strong>에서부터 30여년간{" "}
          <strong>Pacsafe, President, CabinZero</strong> 등 세계적으로 인정받는 프리미엄 여행 브랜드를
          한국 시장에서 운영합니다. 네이버 스마트스토어, 자사몰, 쿠팡 등{" "}
          <span className="blue-em">수많은 판매 채널</span>을 통해 대한민국 여행자에게 최적의 제품을 제안합니다.
        </p>
        <div className="stats-row reveal reveal-d2">
          <div className="stat-item"><div className="stat-number">8+</div><div className="stat-label">보유 브랜드</div></div>
          <div className="stat-item"><div className="stat-number">40+</div><div className="stat-label">판매 채널</div></div>
          <div className="stat-item"><div className="stat-number">600+</div><div className="stat-label">운영 SKU</div></div>
          <div className="stat-item"><div className="stat-number">14만+</div><div className="stat-label">최근 2년간 주문수</div></div>
        </div>
      </div>
    </section>
  );
}
