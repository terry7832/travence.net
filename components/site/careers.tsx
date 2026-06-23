"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/use-reveal";
import { EMAIL_HREF } from "@/lib/site";

export function Careers() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section className="section careers" id="careers" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">Careers</p>
          <h2 className="section-headline">함께 만들어갈<br />동료를 찾습니다.</h2>
        </div>

        <div className="careers-message reveal reveal-d1">
          <div className="careers-ceo-label">대표 메시지</div>
          <div className="careers-quote">
            <p>업무와 마케팅에 정답이라는 것은 없습니다. 더 나은 방향을 찾기 위해 유연하게 사고하고, 직접 시도하며 답을 찾아나가는 <strong>시도가 중요</strong>하다고 생각합니다. 답은 그 과정 속에서 자연스럽게 나올 것입니다.</p>
            <p>저희는 <span className="blue-em">트렌디한 기술과 AI를 적극적으로 활용</span>하며 업무를 최대한 효율화시키는 방법에 대해 연구하고, 시장과 고객을 이해하며 사람들의 선택을 받는 창의적인 마케팅을 추구합니다.</p>
            <p>저는 <strong>개인의 성장이 곧 회사의 경쟁력</strong>이라고 믿습니다. 그래서 각자의 성장이 자연스럽게 성과로 이어지는 환경을 만드는 데 진심입니다. 성장하고자 하는 의지와 열정만 있다면 지원을 아끼지 않겠습니다.</p>
            <p>트레벤스는 단순히 일을 하는 곳이 아니라 <span className="blue-em">자신의 야망과 방향을 실현할 수 있는 곳</span>입니다. 이곳에 들어와서 오래 함께하면 가장 좋겠지만, 언젠가 더 큰 도전을 위해 떠나게 되더라도 <strong>&quot;여기서 진짜 많이 배웠다&quot;</strong>라는 말을 남기고 나갈 수 있도록 저 또한 최선을 다하겠습니다.</p>
            <p><strong>저희와 함께할 유능한 인재를 모집합니다.</strong></p>
          </div>

          <div className="careers-signature">
            <div className="careers-sig-info">
              <div className="careers-sig-name">정진수</div>
              <div className="careers-sig-title">주식회사 트레벤스 대표</div>
            </div>
            <div className="careers-cta-row">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScUCbXb32zdz2vkzEU5cKztBQK5M2kPz1qGalL9R6zEkCN0LA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="careers-btn"
              >
                지원하기
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <span className="careers-email-note">또는 <a href={EMAIL_HREF}>이메일 문의</a></span>
            </div>
          </div>
        </div>

        <div className="careers-positions reveal reveal-d2">
          <div className="careers-position">
            <div className="careers-position-top">
              <div className="careers-position-title">콘텐츠 마케터</div>
              <span className="careers-hiring-badge"><span className="hiring-dot"></span>채용중</span>
            </div>
            <div className="careers-position-meta">SNS 콘텐츠 · 바이럴 콘텐츠 · 마케팅 콘텐츠 · 정규직</div>
          </div>
          <div className="careers-position">
            <div className="careers-position-top">
              <div className="careers-position-title">마케팅 디렉터 (MD)</div>
              <span className="careers-hiring-badge"><span className="hiring-dot"></span>채용중</span>
            </div>
            <div className="careers-position-meta">마케팅 총괄 · 브랜드 전략 · 매출 성장 · 정규직</div>
          </div>
        </div>
      </div>
    </section>
  );
}
