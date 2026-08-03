import type { Metadata } from "next";
import { Home } from "@/components/site/home";
import { SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: SEO.en.title,
  description: SEO.en.description,
  alternates: {
    canonical: "/en",
    languages: {
      "ko-KR": "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/en",
    title: SEO.en.title,
    description: SEO.en.description,
    siteName: "TRAVENCE",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [
      {
        url: "/hero-matterhorn.webp",
        width: 1672,
        height: 941,
        alt: "TRAVENCE - Global Travel Brand Partner in Korea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.en.title,
    description: SEO.en.description,
    images: ["/hero-matterhorn.webp"],
  },
};

export default function Page() {
  return <Home lang="en" />;
}
