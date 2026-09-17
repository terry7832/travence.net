// 브랜드 포트폴리오 데이터 — 브랜드 섹션 UI와 SEO(JSON-LD, llms.txt)가 함께 사용한다.

export type Brand = {
  slug: string;
  kr: string;
  en: string;
  catKr: string;
  catEn: string;
  desc: string;
  descEn: string;
  link?: string;
  linkEn?: string;
  highlights: string[];
  highlightsEn: string[];
  delay: number;
  logoW: number;
  logoH: number;
  /** 제품 사진 원본 비율 — 모바일에서 잘리지 않도록 박스 비율을 맞추는 데 사용 */
  photo: "portrait" | "square";
};

export const BRANDS: Brand[] = [
  {
    slug: "pacsafe", kr: "팩세이프", en: "Pacsafe", catKr: "도난방지 여행용품", catEn: "Anti-Theft Travel Gear",
    desc: "도난 방지 기술을 적용한 보안 여행용품 글로벌 No.1",
    descEn: "The global No.1 in anti-theft travel gear, engineered for security.",
    link: "https://pacsafekorea.co.kr/",
    linkEn: "https://pacsafe.com/",
    highlights: ["소매치기 걱정 없이 여행에만 집중할 수 있는 보안 설계", "전 세계 여행자가 선택한 도난 방지 No.1 브랜드", "가방 하나로 여행의 불안을 안심으로 바꿉니다"],
    highlightsEn: ["Security-engineered so you can focus on the journey, not pickpockets.", "The No.1 anti-theft brand chosen by travelers worldwide.", "One bag that turns travel anxiety into peace of mind."],
    delay: 1, logoW: 300, logoH: 72,
    photo: "portrait",
  },
  {
    slug: "president", kr: "프레지던트", en: "President", catKr: "프리미엄 여행가방", catEn: "Premium Luggage",
    desc: "60년 전통의 프리미엄 여행가방 브랜드",
    descEn: "A premium luggage brand with 60 years of heritage.",
    link: "https://sbskorea1998.cafe24.com/shop7",
    linkEn: "https://www.presidentluggage.com/",
    highlights: ["1960년 일본에서 시작된, 60년을 이어온 장인 정신", "비즈니스 출장부터 가족 여행까지 — 믿고 맡기는 가방", "전 세계 90개 이상의 매장에서 만날 수 있는 글로벌 신뢰"],
    highlightsEn: ["Craftsmanship carried on since its founding in Japan in 1960 — 60 years strong.", "From business trips to family travel — luggage you can rely on.", "Global trust, available in over 90 stores around the world."],
    delay: 2, logoW: 300, logoH: 53,
    photo: "square",
  },
  {
    slug: "cabinzero", kr: "캐빈제로", en: "CabinZero", catKr: "초경량 백팩", catEn: "Ultra-Light Backpack",
    desc: "초경량 기내반입 백팩, 영국 어드벤처 브랜드",
    descEn: "Ultra-light cabin backpacks from a British adventure brand.",
    link: "https://cabinzero.co.kr/",
    linkEn: "https://www.cabinzero.com/",
    highlights: ["760g, 물병보다 가벼운 백팩으로 기내반입 고민 끝", "짐이 아니라 자유를 메고 떠나는 여행", "영국에서 시작해 전 세계 배낭여행자의 국민 백팩이 된 브랜드"],
    highlightsEn: ["At 760g — lighter than a water bottle — carry-on worries are over.", "Travel carrying freedom on your back, not baggage.", "Born in the UK, now a go-to backpack for backpackers worldwide."],
    delay: 3, logoW: 300, logoH: 212,
    photo: "portrait",
  },
  {
    slug: "markryden", kr: "마크라이든", en: "Mark Ryden", catKr: "스마트 백팩", catEn: "Smart Backpack",
    desc: "비즈니스 & 일상을 위한 스마트 기능 백팩",
    descEn: "Smart-feature backpacks for business and everyday life.",
    linkEn: "https://www.markrydenglobal.com/",
    highlights: ["출퇴근길부터 출장까지, 일상과 여행의 경계를 없앤 백팩", "USB 충전, 도난방지, 방수까지 — 기능이 곧 스타일", "\"백팩 어디꺼야?\" 질문을 가장 많이 받는 브랜드"],
    highlightsEn: ["From the commute to the business trip — a backpack that erases the line between daily life and travel.", "USB charging, anti-theft, water resistance — function becomes style.", "The brand that gets asked \"where's that backpack from?\" the most."],
    delay: 4, logoW: 182, logoH: 52,
    photo: "portrait",
  },
  {
    slug: "mixi", kr: "믹시", en: "MIXI", catKr: "스마트 캐리어", catEn: "Smart Carrier",
    desc: "가볍고 기능적인 스마트 여행 캐리어",
    descEn: "Light, functional smart luggage for travel.",
    linkEn: "https://www.mixiluggage.net/",
    highlights: ["실용성과 디자인을 모두 잡은 스마트 캐리어", "가볍고 튼튼한 소재로 어떤 여행에도 든든한 동반자", "합리적인 가격에 프리미엄 품질을 담았습니다"],
    highlightsEn: ["Smart luggage that captures both practicality and design.", "Light yet durable materials make it a dependable companion on any trip.", "Premium quality at a reasonable price."],
    delay: 5, logoW: 300, logoH: 59,
    photo: "square",
  },
  {
    slug: "travelerschoice", kr: "트래블러스초이스", en: "Travelers Choice", catKr: "여행가방", catEn: "Travel Luggage",
    desc: "합리적인 가격의 글로벌 여행가방",
    descEn: "Global travel luggage at a reasonable price.",
    linkEn: "https://www.travelerchoice.com/",
    highlights: ["프리미엄 품질을 합리적인 가격으로 — 캘리포니아 감성", "처음 여행가방을 사는 사람도, 열 번째 사는 사람도 만족", "튼튼하고, 조용하고, 예쁜 — 세 마리 토끼를 다 잡은 캐리어"],
    highlightsEn: ["Premium quality at a fair price — with California spirit.", "Satisfying whether it's your first suitcase or your tenth.", "Sturdy, quiet, and good-looking — luggage that nails all three."],
    delay: 5, logoW: 300, logoH: 70,
    photo: "square",
  },
  {
    slug: "conwood", kr: "콘우드", en: "Conwood", catKr: "스타일리시 캐리어", catEn: "Stylish Luggage",
    desc: "50개국 이상에서 사랑받는 스타일리시 캐리어",
    descEn: "Stylish luggage loved in over 50 countries.",
    linkEn: "https://conwoodtravel.com/",
    highlights: ["도쿄·밀라노·상하이 디자이너가 함께 만든 글로벌 감성", "공항에서 시선을 사로잡는 컬러와 디자인", "50개국 여행자가 인정한 스타일과 내구성의 균형"],
    highlightsEn: ["A global sensibility crafted by designers from Tokyo, Milan, and Shanghai.", "Colors and design that turn heads at the airport.", "A balance of style and durability recognized by travelers in 50 countries."],
    delay: 5, logoW: 300, logoH: 63,
    photo: "square",
  },
  {
    slug: "landorhawa", kr: "랜도르앤하와", en: "Landor & Hawa", catKr: "모던 캐리어", catEn: "Modern Luggage",
    desc: "모던 디자인의 프리미엄 트래블 기어",
    descEn: "Premium travel gear with modern design.",
    highlights: ["군더더기 없는 모던 디자인, 여행도 미니멀하게", "꺼내놓으면 인테리어가 되는 트래블 기어", "디자인을 아는 여행자가 선택하는 브랜드"],
    highlightsEn: ["Clean, modern design — travel kept minimal.", "Travel gear that doubles as décor when left out.", "The brand chosen by travelers who know design."],
    delay: 6, logoW: 300, logoH: 300,
    photo: "square",
  },
  {
    slug: "easynap", kr: "이지냅", en: "EasyNap", catKr: "트래블 컴포트", catEn: "Travel Comfort",
    desc: "편안한 여행을 위한 컴포트 솔루션",
    descEn: "Comfort solutions for a more relaxing journey.",
    highlights: ["비행기에서도, 차 안에서도 — 어디서든 깊은 인체공학적 휴식", "내 손안에 들어가는 간편한 목베개", "목베개 · 요추쿠션 · 여행 컴포트 — 당신의 여행과 건강에 필요한 필수품만"],
    highlightsEn: ["Deep, ergonomic rest anywhere — on the plane or in the car.", "A travel pillow compact enough to fit in your hand.", "Neck pillows, lumbar cushions, travel comfort — only the essentials for your trip and well-being."],
    delay: 7, logoW: 288, logoH: 300,
    photo: "square",
  },
];
