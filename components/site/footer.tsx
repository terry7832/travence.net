"use client";

import Image from "next/image";
import { useState } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Lang, content } from "@/lib/content";
import { EMAIL, WEBSITE, WEBSITE_HREF } from "@/lib/site";

const HREFS = ["#about", "#business", "#brands", "#careers", "#contact"];

export function Footer({ lang }: { lang: Lang }) {
  const t = content[lang].footer;
  const c = content[lang].contact;
  const [emailCopied, setEmailCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setEmailCopied(true);
    } catch {
      window.prompt(c.form.copyEmail, EMAIL);
    }
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-company">
          <div className="footer-brand">
            <Image
              className="footer-brand-logo"
              src="/contact-title.png"
              alt="TRAVENCE"
              width={600}
              height={388}
              sizes="(max-width: 768px) 210px, 280px"
            />
            <div className="footer-company-name">{c.sub}</div>
          </div>

          <div className="footer-contact-grid">
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><MapPin size={20} strokeWidth={1.5} /></div>
              <div>
                <div className="footer-contact-label">{c.labels.address}</div>
                <div className="footer-contact-value" dangerouslySetInnerHTML={{ __html: c.address }} />
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Phone size={20} strokeWidth={1.5} /></div>
              <div>
                <div className="footer-contact-label">{c.labels.phone}</div>
                <div className="footer-contact-value"><a href="tel:02-2274-8240">02.2274.8240</a></div>
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Mail size={20} strokeWidth={1.5} /></div>
              <div>
                <div className="footer-contact-label">{c.labels.email}</div>
                <div className="footer-contact-value">
                  <button type="button" className="footer-email-copy" onClick={copyEmail}>
                    {EMAIL}
                  </button>
                  <span className="footer-copy-hint" aria-live="polite">
                    {emailCopied ? c.form.copiedEmail : c.form.copyEmail}
                  </span>
                </div>
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Globe size={20} strokeWidth={1.5} /></div>
              <div>
                <div className="footer-contact-label">{c.labels.website}</div>
                <div className="footer-contact-value"><a href={WEBSITE_HREF}>{WEBSITE}</a></div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-meta">
          <div className="footer-links">
            {t.links.map((label, i) => (
              <a key={HREFS[i]} href={HREFS[i]}>{label}</a>
            ))}
          </div>
          <div className="footer-bottom">
            {t.copyright}<br />
            {t.address}
          </div>
        </div>
      </div>
    </footer>
  );
}
