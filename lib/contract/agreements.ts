export const AGREEMENT_ITEMS = [
  {
    key: "independent_contractor",
    required: true,
    label: "본인은 태양라이프의 직원이 아니라 위촉 영업사원(독립 사업자)임을 이해합니다.",
    docKey: "main",
  },
  {
    key: "sales_compliance",
    required: true,
    label: "본인은 부정판매 및 불완전판매에 대해 설명을 듣고 이해했으며, 이에 동의합니다.",
    docKey: "main",
  },
  {
    key: "annex_receipt",
    required: true,
    label:
      "본인은 본 계약서와 함께 교부된 ① 부속합의서 제1호(수수료·정산 규정), ② 부속합의서 제2호(판매준칙 및 제재 기준)의 내용을 교부·설명 받았으며, 이를 충분히 이해하고 동의합니다.",
    docKey: "annex2",
  },
] as const;

export const PRIVACY_REFUSAL_NOTICE =
  "필수 항목에 동의하지 않거나 제공하지 않는 경우 수수료 정산·지급 및 세무처리가 불가능하거나 지연되어 지급이 유보될 수 있습니다.";

export type AgreementKey = (typeof AGREEMENT_ITEMS)[number]["key"] | "privacy";

export type StoredAgreement = {
  key: AgreementKey;
  agreedAt: string;
  ip: string;
  userAgent: string;
};
