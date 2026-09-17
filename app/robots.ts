import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 검색엔진과 AI 답변엔진(GEO) 크롤러 모두 전체 공개.
// 명시적으로 나열해 두면 크롤러별 정책을 나중에 개별 조정하기 쉽다.
const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Bingbot",
  "Yeti", // Naver
  "Daum",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
