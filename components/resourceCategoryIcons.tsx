import type { ReactNode } from "react";

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <span className="resource-hub-icon" aria-hidden>
      {children}
    </span>
  );
}

function normalizeCategoryKey(name: string) {
  return name.replace(/\s+/g, "").toLowerCase();
}

const CATEGORY_ICON_KEYS: Record<string, "brochure" | "promo" | "edu" | "faq" | "system"> = {
  브로슈어: "brochure",
  홍보영상: "promo",
  교육영상: "edu",
  교육자료: "edu",
  자주묻는질문: "faq",
  전산이용방법: "system",
};

function iconKey(name: string) {
  const key = normalizeCategoryKey(name);
  if (CATEGORY_ICON_KEYS[name]) return CATEGORY_ICON_KEYS[name];
  const compact = Object.entries(CATEGORY_ICON_KEYS).find(([label]) => normalizeCategoryKey(label) === key);
  if (compact) return compact[1];
  if (key.includes("브로슈") || key.includes("brochure")) return "brochure";
  if (key.includes("홍보") || key.includes("promo")) return "promo";
  if (key.includes("교육") || key.includes("edu")) return "edu";
  if (key.includes("faq") || key.includes("질문") || key.includes("묻는")) return "faq";
  if (key.includes("전산") || key.includes("system")) return "system";
  return null;
}

function BrochureIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M5 6.5c0-.8.6-1.5 1.4-1.5H11v15H6.4A1.4 1.4 0 0 1 5 18.5V6.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 5h5.6c.8 0 1.4.7 1.4 1.5v12c0 .8-.6 1.5-1.4 1.5H13V5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 5.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 9h3M7.5 12h3M7.5 15h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14.5 9H18M14.5 12H18M14.5 15h-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PromoVideoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="6" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 10.2v3.6l3.6-1.8L11 10.2Z" fill="currentColor" />
    </svg>
  );
}

function EduVideoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M5 9.5 12 6l7 3.5-7 3.5-7-3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 11v3.8c0 1.1 2.2 2.2 5 2.2s5-1.1 5-2.2V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 8.5v6.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FaqIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.8 9.4c0-1.2 1-2 2.4-2 1.3 0 2.3.7 2.3 1.9 0 1.1-.7 1.6-1.6 2.1-.6.3-1 .7-1 1.4v.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DefaultIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M6 5h12v14H6V5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ResourceCategoryIcon({ name }: { name: string }) {
  switch (iconKey(name)) {
    case "brochure":
      return (
        <IconWrap>
          <BrochureIcon />
        </IconWrap>
      );
    case "promo":
      return (
        <IconWrap>
          <PromoVideoIcon />
        </IconWrap>
      );
    case "edu":
      return (
        <IconWrap>
          <EduVideoIcon />
        </IconWrap>
      );
    case "faq":
      return (
        <IconWrap>
          <FaqIcon />
        </IconWrap>
      );
    case "system":
      return (
        <IconWrap>
          <SystemIcon />
        </IconWrap>
      );
    default:
      return (
        <IconWrap>
          <DefaultIcon />
        </IconWrap>
      );
  }
}
