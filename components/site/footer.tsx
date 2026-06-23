import Image from "next/image";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <Image className="footer-logo" src="/footer-logo.png" alt="TRAVENCE" width={600} height={388} />
          <div className="footer-links">
            <a href="#about">회사소개</a>
            <a href="#brands">브랜드</a>
            <a href="#business">사업영역</a>
            <a href="#careers">채용</a>
            <a href="#contact">문의</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 주식회사 트레벤스 (TRAVENCE Inc.) All rights reserved.<br />
          서울특별시 중구 을지로 5가 40-3 서울패션벤처타운 178호
        </div>
      </div>
    </footer>
  );
}
