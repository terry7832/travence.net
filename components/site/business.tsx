"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/use-reveal";

const TILES = [
  { num: "01", title: "브랜드 소싱 & 운영", desc: "글로벌 시장에서 경쟁력 있는 여행 브랜드를 발굴하고, 한국 시장에 최적화된 포지셔닝 전략을 수립합니다.", delay: 1 },
  { num: "02", title: "브랜딩 & 마케팅 전략", desc: "하나의 브랜드로 성장하기 위해 시장과 고객을 다방면으로 분석하고, 브랜드 정체성에 맞는 창의적인 마케팅 전략을 설계합니다.", delay: 2 },
  { num: "03", title: "온라인 커머스 운영", desc: "네이버 스마트스토어, 자사몰, 쿠팡 등 주요 플랫폼에서 최적의 구매 환경을 만들어 갑니다.", delay: 3 },
  { num: "04", title: "데이터 기반 성장", desc: "자체 개발 데이터 시스템으로 매출, 리뷰, 고객 행동을 실시간 분석하여 의사결정에 활용합니다.", delay: 4 },
  { num: "05", title: "고객 케어 & A/S", desc: "판매가 끝이 아닙니다. 체계적인 사후 A/S 시스템으로 고객과의 관계를 이어가며, 브랜드에 대한 신뢰를 끝까지 지켜냅니다.", delay: 5 },
];

export function Business() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section className="section business" id="business" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">Business</p>
          <h2 className="section-headline">트래블 커머스의<br />모든 것.</h2>
          <p className="section-body">브랜드 발굴부터 운영, 마케팅, 데이터 분석까지 — 전 과정을 직접 운영합니다.</p>
        </div>
        <div className="business-tiles">
          {TILES.map((t) => (
            <div key={t.num} className={`business-tile reveal reveal-d${t.delay}`}>
              <div className="business-tile-num">{t.num}</div>
              <h3 className="business-tile-title">{t.title}</h3>
              <p className="business-tile-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
