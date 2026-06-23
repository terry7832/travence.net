"use client";

import Image from "next/image";
import { useState } from "react";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <Image src="/nav-logo.png" alt="TRAVENCE" width={400} height={41} priority />
          </a>
          <ul className="nav-links">
            <li><a href="#about">회사소개</a></li>
            <li><a href="#brands">브랜드</a></li>
            <li><a href="#business">사업영역</a></li>
            <li><a href="#careers">채용</a></li>
            <li><a href="#contact" className="nav-cta">문의하기</a></li>
          </ul>
          <button className="nav-mobile-toggle" onClick={() => setOpen((o) => !o)} aria-label="메뉴 열기">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? " open" : ""}`} id="mobileMenu">
        <button className="mobile-close" onClick={close} aria-label="메뉴 닫기">&times;</button>
        <a href="#about" onClick={close}>회사소개</a>
        <a href="#brands" onClick={close}>브랜드</a>
        <a href="#business" onClick={close}>사업영역</a>
        <a href="#careers" onClick={close}>채용</a>
        <a href="#contact" onClick={close}>문의</a>
      </div>
    </>
  );
}
