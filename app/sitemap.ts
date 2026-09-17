import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const languages = {
  "ko-KR": `${SITE_URL}/`,
  en: `${SITE_URL}/en`,
  "x-default": `${SITE_URL}/`,
};

// 배포 시점 기준 — 콘텐츠를 크게 바꾸면 갱신
const LAST_MODIFIED = new Date("2026-09-17");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
      images: [`${SITE_URL}/og-image.jpg`],
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages },
      images: [`${SITE_URL}/og-image.jpg`],
    },
  ];
}
