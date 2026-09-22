import data from "./hc-v4.json";

/** 원본 PDF: `@docs/20260522_위촉계약서_H.C_ver4.pdf` — 화면 렌더링용 조문. 실제 체결본은 `assets/contract/hc-v4-template.pdf` 오버레이. */
export const CONTRACT_SOURCE_PDF = "docs/20260522_위촉계약서_H.C_ver4.pdf";

export const CONTRACT_VERSION = data.CONTRACT_VERSION;
export const CONTRACT_REVISED_AT = data.CONTRACT_REVISED_AT;

export type ContractParagraph = {
  mark?: string;
  text: string;
  items?: string[];
};

export type ContractArticle = {
  no: string;
  title: string;
  paragraphs: ContractParagraph[];
};

export type ContractSection = {
  title: string;
  paragraphs: string[];
};

export type ContractDoc = {
  key: string;
  title: string;
  preamble?: string;
  articles?: ContractArticle[];
  sections?: ContractSection[];
};

export const CONTRACT_DOCS = data.CONTRACT_DOCS as ContractDoc[];
export type ContractDocKey = (typeof data.CONTRACT_DOCS)[number]["key"];

export function articleCaption(no: string, title: string) {
  const head = no.includes("조") ? `제${no}` : `제${no}조`;
  return `${head}(${title})`;
}
