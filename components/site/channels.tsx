"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/use-reveal";

const PILLS = ["Naver SmartStore", "Cafe24 자사몰", "쿠팡", "11번가", "G마켓", "SSG닷컴", "롯데ON", "+More"];

export function Channels() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section className="section channels" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">Channels</p>
          <h2 className="section-headline">어디서든 만날 수 있습니다.</h2>
          <p className="section-body">주요 이커머스 플랫폼과 자사 채널에서 최적의 구매 경험을 제공합니다.</p>
        </div>
        <div className="channels-wrap reveal reveal-d1">
          {PILLS.map((p) => (
            <span key={p} className="channel-pill">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
