import { describe, expect, it } from "vitest";
import { articleCaption, CONTRACT_DOCS } from "./hc-v4";

function articlesOf(key: string) {
  const doc = CONTRACT_DOCS.find((item) => item.key === key);
  if (!doc?.articles) throw new Error(key);
  return doc.articles;
}

function articleOf(key: string, no: string) {
  const article = articlesOf(key).find((item) => item.no === no);
  if (!article) throw new Error(`${key}:${no}`);
  return article;
}

function itemsOf(key: string, no: string, mark?: string) {
  const article = articleOf(key, no);
  const paragraph = mark ? article.paragraphs.find((item) => item.mark === mark) : article.paragraphs[0];
  return paragraph?.items ?? [];
}

describe("hc-v4 조문 수", () => {
  it("본문 29개, 부속1호 14개, 부속2호 15개 조를 가진다", () => {
    expect(articlesOf("main")).toHaveLength(29);
    expect(articlesOf("annex1")).toHaveLength(14);
    expect(articlesOf("annex2")).toHaveLength(15);
  });

  it("제15조의2 표기가 원문과 같다", () => {
    const article = articleOf("main", "15조의2");
    expect(articleCaption(article.no, article.title)).toBe(
      "제15조의2(영업사원 개인정보의 수집·이용 및 처리)",
    );
  });
});

describe("hc-v4 호 개수", () => {
  it("본문 제2조 8호, 제10조 11호, 부속2호 제6조 11호", () => {
    expect(itemsOf("main", "2")).toHaveLength(8);
    expect(itemsOf("main", "10")).toHaveLength(11);
    expect(itemsOf("annex2", "6")).toHaveLength(11);
  });

  it("각 호가 해당 항 바로 아래에 붙는다", () => {
    expect(itemsOf("main", "6", "①")).toHaveLength(4);
    expect(itemsOf("main", "7", "①")).toHaveLength(6);
    expect(itemsOf("main", "9", "①")).toHaveLength(6);
    expect(itemsOf("main", "17", "①")).toHaveLength(4);
    expect(itemsOf("main", "20", "①")).toHaveLength(5);
    expect(itemsOf("main", "28", "①")).toHaveLength(5);
    expect(itemsOf("annex1", "3", "①")).toHaveLength(4);
    expect(itemsOf("annex1", "4", "②")).toHaveLength(5);
    expect(itemsOf("annex1", "8", "①")).toHaveLength(5);
    expect(itemsOf("annex2", "4", "①")).toHaveLength(6);
    expect(itemsOf("annex2", "9", "①")).toHaveLength(3);
    expect(itemsOf("annex2", "10", "①")).toHaveLength(7);
  });

  it("부속1호 제5조·제9조는 항별로 호를 나눈다", () => {
    expect(itemsOf("annex1", "5", "①")).toHaveLength(4);
    expect(itemsOf("annex1", "5", "②")).toHaveLength(3);
    expect(itemsOf("annex1", "9", "①")).toHaveLength(5);
    expect(itemsOf("annex1", "9", "②")).toHaveLength(3);
  });
});

describe("hc-v4 문장 복원", () => {
  it("제15조의2 ➂ 문장을 합쳐 ➁ 다음, ➃ 앞에 둔다", () => {
    const paragraphs = articleOf("main", "15조의2").paragraphs;
    expect(paragraphs.map((item) => item.mark)).toEqual(["①", "②", "③", "④"]);
    expect(paragraphs[1]?.items).toHaveLength(3);
    expect(paragraphs[2]?.text).toBe(
      "영업사원이 제1항의 목적 달성을 위하여 필요한 필수 정보를 제공하지 않거나 허위로 제공하여 회사의 정산·지급 또는 법정 신고가 불가능하거나 지연되는 경우, 회사는 해당 기간 수수료의 정산·지급을 유보할 수 있으며, 그로 인한 불이익은 영업사원이 부담한다.",
    );
  });

  it("부속1호 제11조(세무 처리)를 ➀~➄ 항으로 분리한다", () => {
    const paragraphs = articleOf("annex1", "11").paragraphs;
    expect(paragraphs).toHaveLength(5);
    expect(paragraphs.map((item) => item.mark)).toEqual(["①", "②", "③", "④", "⑤"]);
    expect(paragraphs.every((item) => !item.text.includes("➁") && !item.text.includes("②"))).toBe(true);
  });
});
