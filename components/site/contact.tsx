"use client";

import Image from "next/image";
import { useRef } from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { useReveal } from "@/lib/use-reveal";
import { EMAIL, EMAIL_HREF } from "@/lib/site";
import { Lang, content } from "@/lib/content";

export function Contact({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = content[lang].contact;

  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline">{t.head}</h2>
          <p className="section-body">{t.body}</p>
        </div>
        <div className="contact-card reveal reveal-d1">
          <div className="contact-left">
            <Image className="contact-left-title" src="/contact-title.png" alt="TRAVENCE" width={600} height={388} />
            <div className="contact-left-sub">{t.sub}</div>
            <div className="contact-row">
              <div className="contact-item">
                <div className="contact-item-icon"><MapPin size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.address}</div>
                  <div className="contact-value" dangerouslySetInnerHTML={{ __html: t.address }} />
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Phone size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.phone}</div>
                  <div className="contact-value"><a href="tel:02-2274-8240">02.2274.8240</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Mail size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.email}</div>
                  <div className="contact-value"><a href={EMAIL_HREF}>{EMAIL}</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Globe size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.website}</div>
                  <div className="contact-value"><a href="https://www.travence.net">www.travence.net</a></div>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-right">
            <h3 dangerouslySetInnerHTML={{ __html: t.rightHead }} />
            <p>{t.rightBody}</p>
            <a href={EMAIL_HREF} className="contact-btn">
              {t.emailBtn}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
