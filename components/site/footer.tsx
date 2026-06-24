import Image from "next/image";
import { Lang, content } from "@/lib/content";

const HREFS = ["#about", "#business", "#brands", "#careers", "#contact"];

export function Footer({ lang }: { lang: Lang }) {
  const t = content[lang].footer;
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <Image className="footer-logo" src="/footer-logo.png" alt="TRAVENCE" width={600} height={388} />
          <div className="footer-links">
            {t.links.map((label, i) => (
              <a key={HREFS[i]} href={HREFS[i]}>{label}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          {t.copyright}<br />
          {t.address}
        </div>
      </div>
    </footer>
  );
}
