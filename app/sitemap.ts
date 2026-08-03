import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const languages = {
  "ko-KR": SITE_URL,
  en: `${SITE_URL}/en`,
  "x-default": SITE_URL,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
      images: [`${SITE_URL}/hero-matterhorn.webp`],
    },
    {
      url: `${SITE_URL}/en`,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages },
      images: [`${SITE_URL}/hero-matterhorn.webp`],
    },
  ];
}
