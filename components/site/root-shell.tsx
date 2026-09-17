import "@/app/globals.css";
import "@/app/travence.css";
import { Lang } from "@/lib/content";
import { jsonLdFor } from "@/lib/seo";

/** 언어별 루트 레이아웃이 공유하는 html/body 껍데기 — <html lang>과 JSON-LD를 언어에 맞춘다 */
export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang === "en" ? "en" : "ko"}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdFor(lang)).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
