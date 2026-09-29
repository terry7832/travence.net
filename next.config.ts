import type { NextConfig } from "next";

// 브라우저·검색엔진 신뢰도용 기본 보안 헤더 (Lighthouse Best Practices 항목)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // 최적화된 이미지(/_next/image)를 30일간 캐시 — 기본 60초는 방문마다 재검증을 유발했다
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // public/ 정적 자산은 이름이 고정이라 immutable 은 위험 — 하루 캐시 + 일주일 stale-while-revalidate
        source: "/:path*.(jpg|jpeg|png|webp|ico|svg|txt)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
