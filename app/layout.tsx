import type { Metadata } from "next";
import "./globals.css";
import "./travence.css";
import { organizationJsonLd, SEO, websiteJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SEO.ko.title,
  description: SEO.ko.description,
  applicationName: "TRAVENCE",
  creator: "주식회사 트레벤스",
  publisher: "주식회사 트레벤스",
  category: "Travel commerce",
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: SEO.ko.title,
    description: SEO.ko.description,
    siteName: "TRAVENCE",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/hero-matterhorn.webp",
        width: 1672,
        height: 941,
        alt: "TRAVENCE - 글로벌 여행 브랜드 전문 기업",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.ko.title,
    description: SEO.ko.description,
    images: ["/hero-matterhorn.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
