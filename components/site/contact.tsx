"use client";

import Image from "next/image";
import { useRef } from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { useReveal } from "@/lib/use-reveal";
import { EMAIL, EMAIL_HREF } from "@/lib/site";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">Contact</p>
          <h2 className="section-headline">비즈니스 문의.</h2>
          <p className="section-body">새로운 브랜드 제안, 유통 협력, 딜러십 문의를 환영합니다.</p>
        </div>
        <div className="contact-card reveal reveal-d1">
          <div className="contact-left">
            <Image className="contact-left-title" src="/contact-title.png" alt="TRAVENCE" width={600} height={388} />
            <div className="contact-left-sub">주식회사 트레벤스</div>
            <div className="contact-row">
              <div className="contact-item">
                <div className="contact-item-icon"><MapPin size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">Address</div>
                  <div className="contact-value">서울특별시 중구 을지로 5가 40-3<br />서울패션벤처타운 178호</div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Phone size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">Phone</div>
                  <div className="contact-value"><a href="tel:02-2274-8240">02.2274.8240</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Mail size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">Email</div>
                  <div className="contact-value"><a href={EMAIL_HREF}>{EMAIL}</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Globe size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">Website</div>
                  <div className="contact-value"><a href="https://www.travence.net">www.travence.net</a></div>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-right">
            <h3>브랜드 제안 및<br />비즈니스 문의</h3>
            <p>새로운 여행 브랜드 제안, 유통 협력, 딜러십 문의 등 비즈니스 관련 문의를 환영합니다.</p>
            <a href={EMAIL_HREF} className="contact-btn">
              이메일 문의
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
