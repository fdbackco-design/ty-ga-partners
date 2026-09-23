export const NAV = [
  { href: "/#GA", label: "GA파트너스란?" },
  { href: "/#Product", label: "전용 상품" },
  { href: "/#Structure", label: "사업구조" },
  { href: "/#earnings", label: "예상 수익" },
  { href: "/news", label: "파트너 소식" },
  { href: "/resources", label: "자료실" },
  { href: "/inquiries", label: "문의 게시판" },
] as const;

export const ADMIN_NAV = [
  { href: "/resources", label: "자료실" },
  { href: "/inquiries", label: "문의하기" },
  { href: "/admin/partners", label: "사원등록 관리" },
  { href: "/admin/channels", label: "채널 관리" },
] as const;

export const PRODUCTS = [
  {
    name: "올라이프케어",
    price: "35,000원",
    icon: "/images/product-alllife.png",
    income: "400,000원",
  },
  {
    name: "스페셜라이프케어",
    price: "38,000원",
    icon: "/images/product-special.png",
    income: "400,000원",
  },
  {
    name: "썬크루즈",
    sub: "(선지원크루즈)",
    price: "48,000원",
    icon: "/images/product-cruise.png",
    income: "400,000원",
  },
] as const;

export const FAQ = [
  {
    q: "파트너 정산 유의사항",
    a: [
      "개인 파트너 : 3.3% 공제 후 입금",
      "사업자 파트너 : 세금계산서 발행 후 입금",
    ],
  },
  {
    q: "어떻게 수익이 발생하나요?",
    a: [
      "파트너스 가입 시 발급되는 파트너 링크를 통해 고객이 상담을 신청하고, 실제 상품 계약이 완료되면 수익금이 적립됩니다.",
      "티와이 전용상품은 아래와 같습니다.",
      "(티와이전용상품별로 지급수수료는 다를 수 있습니다.)",
    ],
  },
  {
    q: "프로그램 신청 시 비용이 드나요?",
    a: [
      "프로그램은 무료 참여이며, 참가비나 추가 비용은 일절 발생하지 않습니다.",
    ],
  },
  {
    q: "컨텐츠 수량 제한이 있나요?",
    a: [
      "컨텐츠 수량에는 제한이 없습니다. 활발한 활동을 권장드립니다.",
      "다만, 신뢰를 위해 아래 기준을 반드시 지켜주세요.",
      "• 허위,과장 광고 금지 : 사실과 다른 정보, 근거없는 비교,혜택 주장 금지",
      "• 정확한 정보 사용 : 티와이파트너스가 제공하는 상품소개 가이드와 홈페이지 정보 활용",
    ],
  },
  {
    q: "수익은 언제 지급되나요?",
    a: ["당월 가입일 기준 익월 지급됩니다."],
  },
] as const;

export const NEWS = [
  {
    slug: "dasol-mou",
    title: "태양라이프, 세무법인 다솔 1지점과 상속·증여 세무서비스 협력 위한 MOU 체결",
    date: "2026.07.23",
    image: "/images/news/news-1.png",
    excerpt:
      "태양라이프가 세무법인 다솔 1지점과 상속·증여 세무서비스 협력을 위한 업무협약(MOU)을 체결했습니다.",
    body: "태양라이프 주식회사가 세무법인 다솔 1지점과 고객의 상속·증여 세무 서비스를 강화하기 위한 업무협약(MOU)을 체결했습니다. 이번 협약을 통해 파트너와 고객에게 보다 전문적인 세무 자문 체계를 제공합니다.",
  },
  {
    slug: "anpak-legal",
    title: "태양라이프, 법무법인(유한) 안팍과 고객 법률자문 체계 구축 위한 업무협약 체결",
    date: "2026.07.23",
    image: "/images/news/news-2.png",
    excerpt:
      "태양라이프가 법무법인(유한) 안팍과 고객 법률자문 체계 구축을 위한 업무협약을 체결했습니다.",
    body: "태양라이프는 법무법인(유한) 안팍과 고객 법률자문 체계 구축을 위한 업무협약을 체결했습니다. 계약, 분쟁 예방, 법률 상담 등 파트너스 활동에 필요한 법률 지원을 강화합니다.",
  },
  {
    slug: "ponamishu",
    title: "태양라이프-뽀나미슈, 뷰티·헬스케어 융합상품 개발 협약",
    date: "2026.07.23",
    image: "/images/news/news-3.png",
    excerpt:
      "태양라이프와 뽀나미슈가 뷰티·헬스케어 융합상품 개발을 위한 협약을 체결했습니다.",
    body: "태양라이프와 뽀나미슈가 뷰티·헬스케어 융합상품 개발 협약을 체결했습니다. 라이프케어 상품 라인업을 넓혀 파트너스가 더 다양한 고객 니즈에 대응할 수 있도록 지원합니다.",
  },
] as const;

export const COMPANY = {
  name: "태양라이프 주식회사",
  tradeName: "태양라이프",
  slogan: "고객과 함께하는 또 하나의 가족",
  ceo: "김옥",
  bizNo: "6138137622",
  jinju: "경상남도 진주시 사들로123번길 42, 라온프라이빗위버, 501호",
  seoul: "서울 영등포구 의사당대로1길 25, 404호",
  phone: "1833-2682",
  customerCenter: "1588-0393",
  email: "ty-life@ty-life.co.kr",
  copyright: "Copyright ⓒ 2026 태양라이프 All rights reserved.",
  blog: "https://blog.naver.com/taeyanglife_",
  instagram: "https://www.instagram.com/ty_trip_official/",
  site: "https://ty-life.co.kr/",
} as const;

export const FOOTER_LEGAL = [
  { href: "/email-refusal", label: "이메일 무단 수집거부" },
  { href: "/disclosure-notice", label: "중요정보 고시사항" },
  { href: "/info-disclosure", label: "정보공개" },
  { href: "/sangjo-terms", label: "상조이용약관" },
  { href: "/privacy", label: "개인정보 취급방침" },
  { href: "/release-request", label: "해촉신청" },
  { href: "/site-info", label: "홈페이지 정보이용" },
  { href: "/terms", label: "이용약관" },
] as const;

export const INFO_DISCLOSURE = [
  {
    year: "2025",
    title: "태양라이프 2025년 외부회계감사보고서",
    date: "2026-08-04",
    excerpt: "태양라이프 2025년 외부회계감사보고서",
    href: "https://ty-life.co.kr/info-disclosure/?bmode=view&idx=172863715",
  },
  {
    year: "2024",
    title: "태양라이프 2024년 외부회계감사보고서",
    date: "2026-08-04",
    excerpt: "태양라이프 2024년 외부회계감사보고서 입니다. 첨부파일을 확인해주세요.",
    href: "https://ty-life.co.kr/info-disclosure/?bmode=view&idx=172863704",
  },
  {
    year: "2023",
    title: "태양라이프 2023년 외부회계감사보고서",
    date: "2026-08-04",
    excerpt: "태양라이프 2023년 외부회계감사보고서 입니다. 첨부파일을 확인해주세요.",
    href: "https://ty-life.co.kr/info-disclosure/?bmode=view&idx=172863695",
  },
  {
    year: "2022",
    title: "태양라이프 2022년 외부회계감사보고서",
    date: "2026-08-04",
    excerpt: "태양라이프 2021년 외부회계감사보고서 입니다. 첨부파일을 확인해주세요.",
    href: "https://ty-life.co.kr/info-disclosure/?bmode=view&idx=172863687",
  },
  {
    year: "2021",
    title: "태양라이프 2021년 외부회계감사보고서",
    date: "2026-08-04",
    excerpt: "태양라이프 2021년 외부회계감사보고서입니다. 첨부파일을 확인해주세요.",
    href: "https://ty-life.co.kr/info-disclosure/?bmode=view&idx=172863681",
  },
] as const;

export const SANGJO_TERMS = [
  {
    slug: "cruise",
    title: "크루즈 여행 이용약관",
    excerpt:
      "제 1조 (목적) 이 계약은 태양라이프(주)(이하 ‘회사’라 한다)의 회원으로 가입한 사람이 매월 일정액의 납부 의무를 지고 회사는 크루즈여행서비스를 제공하는 의무를 지는 것을 목적으로 합니다.",
  },
  {
    slug: "funeral",
    title: "상조 이용약관",
    excerpt:
      "제 1조 (목적) 이 계약은 태양라이프 (이하 ‘회사’ 라 한다)의 회원으로 가입한 사람이 매월 일정액의 납부의무를 지고 회사는 가정의례 발생 시 약정된 물품과 서비스를 제공하는 의무를 지는 것을 목적으로 합니다.",
  },
] as const;

export const GALLERY = [
  { src: "/images/gallery-landing.png", title: "맞춤 랜딩페이지" },
  { src: "/images/gallery-detail.png", title: "상품 상세페이지" },
  { src: "/images/gallery-promo.png", title: "간편 홍보" },
  { src: "/images/gallery-docs.png", title: "전문자료 지원" },
] as const;
