"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lang, content } from "@/lib/content";
import { FlagUS, FlagKR } from "@/components/site/flags";

function LangSwitch({ lang, variant, onNav }: { lang: Lang; variant: "nav" | "mobile"; onNav: () => void }) {
  const wrap = variant === "nav" ? "nav-langs" : "mobile-langs";
  const cls = variant === "nav" ? "nav-lang" : "mobile-lang";
  const sep = variant === "nav" ? "nav-lang-sep" : "mobile-lang-sep";
  return (
    <div className={wrap}>
      <Link href="/en" className={`${cls}${lang === "en" ? " active" : ""}`} onClick={onNav} aria-label="English">
        <FlagUS /><span>EN</span>
      </Link>
      <span className={sep} aria-hidden>|</span>
      <Link href="/" className={`${cls}${lang === "ko" ? " active" : ""}`} onClick={onNav} aria-label="한국어">
        <FlagKR /><span>KR</span>
      </Link>
    </div>
  );
}

export function SiteNav({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const t = content[lang].nav;
  const close = () => setOpen(false);
  const base = lang === "en" ? "/en" : "/";

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href={base} className="nav-logo">
            <Image src="/nav-logo.png" alt="TRAVENCE" width={400} height={41} priority />
          </a>
          <ul className="nav-links">
            <li><a href={`${base}#about`}>{t.about}</a></li>
            <li><a href={`${base}#business`}>{t.business}</a></li>
            <li><a href={`${base}#brands`}>{t.brands}</a></li>
            <li><a href={`${base}#careers`}>{t.careers}</a></li>
            <li><LangSwitch lang={lang} variant="nav" onNav={close} /></li>
            <li><a href={`${base}#contact`} className="nav-cta">{t.cta}</a></li>
          </ul>
          <button className="nav-mobile-toggle" onClick={() => setOpen((o) => !o)} aria-label="menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? " open" : ""}`} id="mobileMenu">
        <button className="mobile-close" onClick={close} aria-label="close">&times;</button>
        <a href={`${base}#about`} onClick={close}>{t.about}</a>
        <a href={`${base}#business`} onClick={close}>{t.business}</a>
        <a href={`${base}#brands`} onClick={close}>{t.brands}</a>
        <a href={`${base}#careers`} onClick={close}>{t.careers}</a>
        <LangSwitch lang={lang} variant="mobile" onNav={close} />
        <a href={`${base}#contact`} onClick={close}>{t.contact}</a>
      </div>
    </>
  );
}
