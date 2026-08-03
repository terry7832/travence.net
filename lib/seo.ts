import { EMAIL, SITE_URL } from "@/lib/site";

export const SEO = {
  ko: {
    title: "TRAVENCE | 글로벌 여행 브랜드 전문 기업",
    description:
      "트레벤스는 30여 년의 경험을 바탕으로 Pacsafe, President, CabinZero 등 글로벌 여행 브랜드의 한국 유통, 브랜딩, 마케팅과 커머스 운영을 전개합니다.",
  },
  en: {
    title: "TRAVENCE | Global Travel Brand Partner in Korea",
    description:
      "Travence brings global travel brands to Korea through distribution, brand operations, marketing, e-commerce, data-driven growth, and customer care.",
  },
} as const;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "주식회사 트레벤스",
  alternateName: ["TRAVENCE", "Travence Inc."],
  url: SITE_URL,
  logo: `${SITE_URL}/hero-logo.png`,
  image: `${SITE_URL}/hero-poster.jpg`,
  description: SEO.ko.description,
  email: EMAIL,
  telephone: "+82-2-2274-8240",
  address: {
    "@type": "PostalAddress",
    streetAddress: "을지로 5가 40-3 서울패션벤처타운 178호",
    addressLocality: "중구",
    addressRegion: "서울특별시",
    addressCountry: "KR",
  },
  areaServed: {
    "@type": "Country",
    name: "South Korea",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "business inquiries",
    email: EMAIL,
    telephone: "+82-2-2274-8240",
    availableLanguage: ["Korean", "English"],
  },
  knowsAbout: [
    "Travel brand distribution in Korea",
    "Travel goods and luggage",
    "Brand operations",
    "E-commerce operations",
    "Brand marketing",
  ],
  brand: [
    "Pacsafe",
    "President",
    "CabinZero",
    "Mark Ryden",
    "MIXI",
    "Travelers Choice",
    "Conwood",
    "Landor & Hawa",
    "EasyNap",
  ].map((name) => ({ "@type": "Brand", name })),
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "TRAVENCE",
  alternateName: "트레벤스",
  inLanguage: ["ko-KR", "en"],
  publisher: { "@id": `${SITE_URL}/#organization` },
};
