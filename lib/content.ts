export type Lang = "ko" | "en";

type Stat = { num: string; label: string };
type Tile = { num: string; title: string; desc: string };
type Position = { title: string; meta: string };

export type SiteContent = {
  nav: { about: string; brands: string; business: string; careers: string; contact: string; cta: string };
  hero: { tagline: string; exploreBrands: string; learnMore: string; scrollHint: string };
  about: {
    eyebrow: string;
    headLead: string;
    headWords: string[];
    statementHtml: string;
    stats: Stat[];
  };
  brandsSection: { eyebrow: string; head: string; body: string; officialStore: string; expand: string; collapse: string };
  business: { eyebrow: string; head: string; body: string; tiles: Tile[] };
  channels: { eyebrow: string; head: string; body: string; pills: string[] };
  careers: {
    eyebrow: string;
    head: string;
    ceoLabel: string;
    quoteHtml: string[];
    sigName: string;
    sigTitle: string;
    apply: string;
    orEmailPre: string;
    orEmailLink: string;
    hiring: string;
    positions: Position[];
  };
  contact: {
    eyebrow: string;
    head: string;
    body: string;
    sub: string;
    labels: { address: string; phone: string; email: string; website: string };
    address: string;
    rightHead: string;
    rightBody: string;
    emailBtn: string;
  };
  footer: { links: string[]; copyright: string; address: string };
};

export const content: Record<Lang, SiteContent> = {
  ko: {
    nav: { about: "회사소개", brands: "브랜드", business: "사업영역", careers: "채용", contact: "문의", cta: "문의하기" },
    hero: { tagline: "여행의 본질을 담다", exploreBrands: "브랜드 살펴보기", learnMore: "더 알아보기", scrollHint: "스크롤하여 펼치기" },
    about: {
      eyebrow: "About",
      headLead: "여행을 더",
      headWords: ["안전하게.", "가볍게.", "스마트하게.", "재밌게."],
      statementHtml:
        '주식회사 트레벤스는 전신인 <strong>에스비에스코리아</strong>에서부터 30여년간 <strong>Pacsafe, President, CabinZero</strong> 등 세계적으로 인정받는 프리미엄 여행 브랜드를 한국 시장에서 운영합니다. 네이버 스마트스토어, 자사몰, 쿠팡 등 <span class="blue-em">수많은 판매 채널</span>을 통해 대한민국 여행자에게 최적의 제품을 제안합니다.',
      stats: [
        { num: "8+", label: "보유 브랜드" },
        { num: "40+", label: "판매 채널" },
        { num: "600+", label: "운영 SKU" },
        { num: "20만+", label: "최근 2년간 주문수" },
      ],
    },
    brandsSection: { eyebrow: "Brands", head: "글로벌 여행 브랜드<br/>포트폴리오.", body: "보안, 경량, 디자인, 기능성 — 각 영역의 글로벌 리더를 선별하여 운영합니다.", officialStore: "공식 스토어", expand: "자세히 보기", collapse: "접기" },
    business: {
      eyebrow: "Business",
      head: "트래블 커머스의<br/>모든 것.",
      body: "브랜드 발굴부터 운영, 마케팅, 데이터 분석까지 — 전 과정을 직접 운영합니다.",
      tiles: [
        { num: "01", title: "브랜드 소싱 & 운영", desc: "글로벌 시장에서 경쟁력 있는 여행 브랜드를 발굴하고, 한국 시장에 최적화된 포지셔닝 전략을 수립합니다." },
        { num: "02", title: "브랜딩 & 마케팅 전략", desc: "하나의 브랜드로 성장하기 위해 시장과 고객을 다방면으로 분석하고, 브랜드 정체성에 맞는 창의적인 마케팅 전략을 설계합니다." },
        { num: "03", title: "온라인 커머스 운영", desc: "네이버 스마트스토어, 자사몰, 쿠팡 등 주요 플랫폼에서 최적의 구매 환경을 만들어 갑니다." },
        { num: "04", title: "데이터 기반 성장", desc: "자체 개발 데이터 시스템으로 매출, 리뷰, 고객 행동을 실시간 분석하여 의사결정에 활용합니다." },
        { num: "05", title: "고객 케어 & A/S", desc: "판매가 끝이 아닙니다. 체계적인 사후 A/S 시스템으로 고객과의 관계를 이어가며, 브랜드에 대한 신뢰를 끝까지 지켜냅니다." },
      ],
    },
    channels: {
      eyebrow: "Channels",
      head: "어디서든 만날 수 있습니다.",
      body: "주요 이커머스 플랫폼과 자사 채널에서 최적의 구매 경험을 제공합니다.",
      pills: ["Naver SmartStore", "Cafe24 자사몰", "쿠팡", "11번가", "G마켓", "SSG닷컴", "롯데ON", "+More"],
    },
    careers: {
      eyebrow: "Careers",
      head: "함께 만들어갈<br/>동료를 찾습니다.",
      ceoLabel: "대표 메시지",
      quoteHtml: [
        "업무와 마케팅에 정답이라는 것은 없습니다. 더 나은 방향을 찾기 위해 유연하게 사고하고, 직접 시도하며 답을 찾아나가는 <strong>시도가 중요</strong>하다고 생각합니다. 답은 그 과정 속에서 자연스럽게 나올 것입니다.",
        '저희는 <span class="blue-em">트렌디한 기술과 AI를 적극적으로 활용</span>하며 업무를 최대한 효율화시키는 방법에 대해 연구하고, 시장과 고객을 이해하며 사람들의 선택을 받는 창의적인 마케팅을 추구합니다.',
        "저는 <strong>개인의 성장이 곧 회사의 경쟁력</strong>이라고 믿습니다. 그래서 각자의 성장이 자연스럽게 성과로 이어지는 환경을 만드는 데 진심입니다. 성장하고자 하는 의지와 열정만 있다면 지원을 아끼지 않겠습니다.",
        '트레벤스는 단순히 일을 하는 곳이 아니라 <span class="blue-em">자신의 야망과 방향을 실현할 수 있는 곳</span>입니다. 이곳에 들어와서 오래 함께하면 가장 좋겠지만, 언젠가 더 큰 도전을 위해 떠나게 되더라도 <strong>"여기서 진짜 많이 배웠다"</strong>라는 말을 남기고 나갈 수 있도록 저 또한 최선을 다하겠습니다.',
        "<strong>저희와 함께할 유능한 인재를 모집합니다.</strong>",
      ],
      sigName: "정진수",
      sigTitle: "주식회사 트레벤스 대표",
      apply: "지원하기",
      orEmailPre: "또는 ",
      orEmailLink: "이메일 문의",
      hiring: "채용중",
      positions: [
        { title: "콘텐츠 마케터", meta: "SNS 콘텐츠 · 바이럴 콘텐츠 · 마케팅 콘텐츠 · 정규직" },
        { title: "마케팅 디렉터 (MD)", meta: "마케팅 총괄 · 브랜드 전략 · 매출 성장 · 정규직" },
      ],
    },
    contact: {
      eyebrow: "Contact",
      head: "비즈니스 문의.",
      body: "새로운 브랜드 제안, 유통 협력, 딜러십 문의를 환영합니다.",
      sub: "주식회사 트레벤스",
      labels: { address: "Address", phone: "Phone", email: "Email", website: "Website" },
      address: "서울특별시 중구 을지로 5가 40-3<br/>서울패션벤처타운 178호",
      rightHead: "브랜드 제안 및<br/>비즈니스 문의",
      rightBody: "새로운 여행 브랜드 제안, 유통 협력, 딜러십 문의 등 비즈니스 관련 문의를 환영합니다.",
      emailBtn: "이메일 문의",
    },
    footer: {
      links: ["회사소개", "사업영역", "브랜드", "채용", "문의"],
      copyright: "© 2026 주식회사 트레벤스 (TRAVENCE Inc.) All rights reserved.",
      address: "서울특별시 중구 을지로 5가 40-3 서울패션벤처타운 178호",
    },
  },

  en: {
    nav: { about: "About", brands: "Brands", business: "Business", careers: "Partnership", contact: "Contact", cta: "Contact Us" },
    hero: { tagline: "Capturing the essence of travel", exploreBrands: "Explore Brands", learnMore: "Learn More", scrollHint: "Scroll to expand" },
    about: {
      eyebrow: "About",
      headLead: "Make Travel",
      headWords: ["safer.", "lighter.", "smarter.", "brighter."],
      statementHtml:
        'For over 30 years — tracing back to its predecessor <strong>SBS Korea</strong> — Travence has brought world-class premium travel brands such as <strong>Pacsafe, President, and CabinZero</strong> to the Korean market. Through <span class="blue-em">a wide range of sales channels</span> including Naver Smart Store, our own online mall, and Coupang, we deliver the right products to travelers across Korea.',
      stats: [
        { num: "8+", label: "Brands" },
        { num: "40+", label: "Sales Channels" },
        { num: "600+", label: "SKUs" },
        { num: "200K+", label: "Orders (last 2 yrs)" },
      ],
    },
    brandsSection: { eyebrow: "Brands", head: "A portfolio of global<br/>travel brands.", body: "Security, lightness, design, functionality — we curate and operate the global leader in each category.", officialStore: "Official Brand Store", expand: "Details", collapse: "Close" },
    business: {
      eyebrow: "Business",
      head: "Everything in<br/>travel commerce.",
      body: "From brand discovery to operations, marketing, and data analysis — we run the entire process in-house.",
      tiles: [
        { num: "01", title: "Brand Sourcing & Operations", desc: "We discover competitive travel brands in the global market and build positioning strategies optimized for Korea." },
        { num: "02", title: "Branding & Marketing", desc: "To grow each brand, we analyze the market and customers from every angle and design creative marketing aligned with the brand's identity." },
        { num: "03", title: "Online Commerce", desc: "We craft the best buying experience across major platforms — Naver Smart Store, our own mall, Coupang, and more." },
        { num: "04", title: "Data-Driven Growth", desc: "Our in-house data system analyzes sales, reviews, and customer behavior in real time to power our decisions." },
        { num: "05", title: "Customer Care & After-Sales", desc: "The sale is not the end. A systematic after-sales process keeps our customer relationships alive and protects trust in the brand to the very end." },
      ],
    },
    channels: {
      eyebrow: "Channels",
      head: "Available everywhere.",
      body: "We deliver the best buying experience across major e-commerce platforms and our own channels.",
      pills: ["Naver SmartStore", "Cafe24 Mall", "Coupang", "11st", "Gmarket", "SSG.COM", "LOTTE ON", "+More"],
    },
    careers: {
      eyebrow: "Partnership",
      head: "Looking for global<br/>business partners.",
      ceoLabel: "A Message from Our CEO",
      quoteHtml: [
        "At Travence, we don't just distribute products — we build brands for the long term. For over 30 years, we've grown world-class travel brands in one of Asia's most demanding markets.",
        "At the heart of this longevity is a simple belief: <strong>great brands are built on great partnerships</strong>. Trust isn't just one of our values — it is the operating foundation of everything we do.",
        'We pair <span class="blue-em">data-driven operations with creative marketing</span> across every major channel — from Naver Smart Store and Coupang to our own online malls — turning great products into trusted brands.',
        "If you're a <strong>brand looking to enter or scale in the Korean market</strong>, or a partner seeking dependable distribution and dealership, we'd love to talk.",
        "<strong>Let's build the next chapter of travel — together.</strong>",
      ],
      sigName: "Jinsoo Jung",
      sigTitle: "CEO, Travence Inc.",
      apply: "Partner with Us",
      orEmailPre: "",
      orEmailLink: "",
      hiring: "Open",
      positions: [
        { title: "Brand Distribution", meta: "Enter & scale in Korea · Operations · Marketing · Data" },
        { title: "Wholesale & Dealership", meta: "Reliable supply · Multi-channel · Long-term" },
      ],
    },
    contact: {
      eyebrow: "Contact",
      head: "Get in touch.",
      body: "We welcome new brand proposals, distribution partnerships, and dealership inquiries.",
      sub: "Travence Inc.",
      labels: { address: "Address", phone: "Phone", email: "Email", website: "Website" },
      address: "178, Seoul Fashion Venture Town,<br/>40-3 Eulji-ro 5-ga, Jung-gu, Seoul, Korea",
      rightHead: "Brand Proposals &<br/>Business Inquiries",
      rightBody: "We welcome business inquiries including new travel brand proposals, distribution partnerships, and dealerships.",
      emailBtn: "Email Us",
    },
    footer: {
      links: ["About", "Business", "Brands", "Partnership", "Contact"],
      copyright: "© 2026 Travence Inc. All rights reserved.",
      address: "178, Seoul Fashion Venture Town, 40-3 Eulji-ro 5-ga, Jung-gu, Seoul, Korea",
    },
  },
};
