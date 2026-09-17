import type { Metadata } from "next";
import { BRANDS } from "@/lib/brands";
import { Lang } from "@/lib/content";
import { EMAIL, PHONE, SITE_URL } from "@/lib/site";

export const SEO = {
  ko: {
    title: "TRAVENCE | 글로벌 여행 브랜드 전문 기업",
    description:
      "트레벤스는 30여 년의 경험을 바탕으로 Pacsafe, President, CabinZero 등 글로벌 여행 브랜드의 한국 유통, 브랜딩, 마케팅과 커머스 운영을 전개합니다.",
    keywords: [
      "트레벤스", "TRAVENCE", "여행 브랜드 유통", "여행용품 총판", "팩세이프 한국", "Pacsafe 공식",
      "프레지던트 캐리어", "캐빈제로", "마크라이든 백팩", "여행가방 브랜드", "트래블 커머스", "브랜드 마케팅 대행",
    ],
    ogAlt: "TRAVENCE — 글로벌 여행 브랜드 전문 기업",
    locale: "ko_KR",
    path: "/",
  },
  en: {
    title: "TRAVENCE | Global Travel Brand Partner in Korea",
    description:
      "Travence brings global travel brands to Korea through distribution, brand operations, marketing, e-commerce, data-driven growth, and customer care.",
    keywords: [
      "Travence", "Korea travel brand distributor", "Pacsafe Korea", "President luggage Korea", "CabinZero Korea",
      "Korean market entry travel goods", "luggage distribution Korea", "brand operations Korea", "travel commerce",
    ],
    ogAlt: "TRAVENCE — Global Travel Brand Partner in Korea",
    locale: "en_US",
    path: "/en",
  },
} as const;

const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg" } as const;

const LANGUAGES = { "ko-KR": "/", en: "/en", "x-default": "/" } as const;

/** 언어별 페이지 메타데이터 — 두 루트 레이아웃이 공유 */
export function metadataFor(lang: Lang): Metadata {
  const s = SEO[lang];
  const other = lang === "ko" ? SEO.en : SEO.ko;
  return {
    metadataBase: new URL(SITE_URL),
    title: s.title,
    description: s.description,
    keywords: [...s.keywords],
    applicationName: "TRAVENCE",
    creator: "주식회사 트레벤스",
    publisher: "주식회사 트레벤스",
    category: "Travel commerce",
    alternates: { canonical: s.path, languages: LANGUAGES },
    openGraph: {
      type: "website",
      url: s.path,
      title: s.title,
      description: s.description,
      siteName: "TRAVENCE",
      locale: s.locale,
      alternateLocale: [other.locale],
      images: [{ ...OG_IMAGE, alt: s.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.title,
      description: s.description,
      images: [OG_IMAGE.url],
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
}

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const brandJsonLd = (lang: Lang) =>
  BRANDS.map((b) => {
    const url = lang === "en" ? b.linkEn : (b.link ?? b.linkEn);
    return {
      "@type": "Brand",
      name: b.en,
      alternateName: lang === "en" ? undefined : b.kr,
      description: lang === "en" ? b.descEn : b.desc,
      ...(url ? { url } : {}),
    };
  });

/** 페이지에 삽입할 JSON-LD 묶음 (Organization / WebSite / WebPage) */
export function jsonLdFor(lang: Lang) {
  const s = SEO[lang];
  const pageUrl = `${SITE_URL}${s.path === "/" ? "/" : s.path}`;
  const inLanguage = lang === "en" ? "en" : "ko-KR";

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "주식회사 트레벤스",
    legalName: "주식회사 트레벤스",
    alternateName: ["TRAVENCE", "Travence Inc.", "트레벤스"],
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/hero-logo.png`, width: 912, height: 598 },
    image: `${SITE_URL}/og-image.jpg`,
    slogan: lang === "en" ? "Capturing the essence of travel" : "여행의 본질을 담다",
    description: s.description,
    email: EMAIL,
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "을지로 5가 40-3 서울패션벤처타운 178호",
      addressLocality: "중구",
      addressRegion: "서울특별시",
      addressCountry: "KR",
    },
    areaServed: { "@type": "Country", name: "South Korea" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business inquiries",
      email: EMAIL,
      telephone: PHONE,
      availableLanguage: ["Korean", "English"],
    },
    knowsAbout: [
      "Travel brand distribution in Korea",
      "Travel goods and luggage",
      "Anti-theft travel gear",
      "Brand operations and marketing",
      "E-commerce operations (Naver SmartStore, Coupang, Cafe24)",
      "Data-driven growth",
      "Customer care and after-sales service",
    ],
    brand: brandJsonLd(lang),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "TRAVENCE",
    alternateName: "트레벤스",
    inLanguage: ["ko-KR", "en"],
    publisher: { "@id": ORG_ID },
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: s.title,
    description: s.description,
    inLanguage,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 },
  };

  return [organization, website, webpage];
}
