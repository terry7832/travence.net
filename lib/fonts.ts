import { Noto_Sans_KR, Outfit } from "next/font/google";

// 구글 폰트를 빌드 시 내려받아 같은 도메인에서 제공한다.
// CSS @import 방식은 HTML → CSS → 폰트 CSS → 폰트 파일로 이어지는 렌더 차단 체인을 만들었다.
// 둘 다 가변(variable) 폰트라 굵기별 파일을 따로 받지 않는다.
export const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

// 한글 글리프는 unicode-range 조각으로 나뉘어 실제 쓰인 범위만 내려받는다.
export const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-kr",
});
