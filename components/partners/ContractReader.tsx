"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { articleCaption, CONTRACT_DOCS, CONTRACT_REVISED_AT, CONTRACT_VERSION } from "@/content/contract/hc-v4";
import { AGREEMENT_ITEMS, PRIVACY_REFUSAL_NOTICE } from "@/lib/contract/agreements";

function tabLabel(title: string) {
  return title.replace("부속합의서 제", "부속 ").replace("[별지 1] ", "");
}

type Heading = { id: string; docKey: string; label: string };

function headingsFor(doc: (typeof CONTRACT_DOCS)[number]): Heading[] {
  const start: Heading = { id: `${doc.key}-title`, docKey: doc.key, label: "서문" };
  const articles = doc.articles ?? [];
  if (articles.length) {
    return [
      start,
      ...articles.map((article) => ({
        id: `${doc.key}-${article.no}`,
        docKey: doc.key,
        label: articleCaption(article.no, article.title),
      })),
    ];
  }
  const sections = "sections" in doc ? doc.sections ?? [] : [];
  if (sections.length) {
    return [
      start,
      ...sections.map((section) => ({
        id: `${doc.key}-${section.title}`,
        docKey: doc.key,
        label: section.title || doc.title,
      })),
    ];
  }
  return [start];
}

const ALL_HEADINGS = CONTRACT_DOCS.flatMap(headingsFor);

export default function ContractReader({ alreadyAgreed = false }: { alreadyAgreed?: boolean }) {
  const router = useRouter();
  const [finished, setFinished] = useState(alreadyAgreed);
  const [readPercent, setReadPercent] = useState(alreadyAgreed ? 100 : 0);
  const [headingIndex, setHeadingIndex] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    alreadyAgreed ? Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, true])) : {},
  );
  const [privacy, setPrivacy] = useState<"yes" | "no" | "">(alreadyAgreed ? "yes" : "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const headingRefs = useRef<Record<string, HTMLElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const finishedRef = useRef(alreadyAgreed);
  finishedRef.current = finished;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const updateProgress = () => {
      if (finishedRef.current) {
        setReadPercent(100);
      } else {
        const max = window.scrollY + sentinel.getBoundingClientRect().top - window.innerHeight + 48;
        const percent = max <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));
        setReadPercent(percent);
      }

      const docked = window.matchMedia("(min-width: 1100px)").matches;
      const offset = docked
        ? 96
        : (stickyRef.current?.getBoundingClientRect().bottom ?? 120) + 8;
      let index = 0;
      ALL_HEADINGS.forEach((heading, i) => {
        const el = headingRefs.current[heading.id];
        if (el && el.getBoundingClientRect().top <= offset) index = i;
      });
      setHeadingIndex(index);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          finishedRef.current = true;
          setFinished(true);
          setReadPercent(100);
          setHeadingIndex(ALL_HEADINGS.length - 1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      observer.disconnect();
    };
  }, []);

  const activeHeading = ALL_HEADINGS[headingIndex] || ALL_HEADINGS[0];
  const activeKey = activeHeading?.docKey || CONTRACT_DOCS[0]?.key || "main";
  const activeDoc = CONTRACT_DOCS.find((doc) => doc.key === activeKey) || CONTRACT_DOCS[0];
  const activeIndex = Math.max(0, CONTRACT_DOCS.findIndex((doc) => doc.key === activeKey));
  const allChecked = AGREEMENT_ITEMS.every((item) => checks[item.key]) && privacy === "yes";
  const canSubmit = finished && allChecked;
  const remaining = Math.max(0, 100 - readPercent);
  const headingCount = ALL_HEADINGS.length;
  const headingNo = Math.min(headingCount, headingIndex + 1);

  function toggleAll(next: boolean) {
    if (!finished) return;
    setChecks(Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, next])));
    setPrivacy(next ? "yes" : "");
  }

  function jumpTo(docKey: string) {
    headingRefs.current[`${docKey}-title`]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit() {
    setError("");
    if (privacy === "no") {
      setError(PRIVACY_REFUSAL_NOTICE);
      return;
    }
    setPending(true);
    const res = await fetch("/api/partners/contract/agreements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        independent_contractor: true,
        sales_compliance: true,
        annex_receipt: true,
        privacy: true,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "동의 저장에 실패했습니다.");
      return;
    }
    router.push("/partners/apply/contract/info");
  }

  return (
    <>
      <p className="partner-apply-lead">
        {CONTRACT_VERSION} · {CONTRACT_REVISED_AT} 개정본입니다. 계약서 전문을 끝까지 읽은 뒤 동의할 수 있습니다.
      </p>
      <div className="contract-read-sticky" ref={stickyRef}>
        <div className="contract-tabs" aria-label="문서 바로가기">
          {CONTRACT_DOCS.map((doc, index) => (
            <button
              key={doc.key}
              type="button"
              className={index === activeIndex ? "is-on" : index < activeIndex ? "is-done" : ""}
              onClick={() => jumpTo(doc.key)}
            >
              <span className="contract-tab-num">{index + 1}</span>
              <span className="contract-tab-label">{tabLabel(doc.title)}</span>
            </button>
          ))}
        </div>
        <p className="contract-now">
          <strong>
            {activeIndex + 1}/{CONTRACT_DOCS.length} {activeDoc?.title}
          </strong>
          <span>{activeHeading?.label === "서문" ? "서문" : activeHeading?.label}</span>
        </p>
        <div className="contract-read-progress" aria-label="읽기 진행률">
          <span style={{ width: `${readPercent}%` }} />
        </div>
        <p className="contract-read-pct">
          전체 {readPercent}% · 위치 {headingNo}/{headingCount}
          {finished ? " · 읽기 완료" : ` · ${remaining}% 남음`}
        </p>
      </div>
      <div className="contract-stream">
        {CONTRACT_DOCS.map((doc, index) => (
          <section key={doc.key} className="contract-doc-block">
            {index > 0 ? <hr className="contract-doc-rule" /> : null}
            <h2
              className="contract-doc-title"
              ref={(node) => {
                headingRefs.current[`${doc.key}-title`] = node;
              }}
            >
              {doc.title}
            </h2>
            {doc.preamble ? <p className="contract-preamble">{doc.preamble}</p> : null}
            {doc.articles?.map((article) => (
              <section
                key={`${doc.key}-${article.no}`}
                className="contract-article"
                ref={(node) => {
                  headingRefs.current[`${doc.key}-${article.no}`] = node;
                }}
              >
                <h3>{articleCaption(article.no, article.title)}</h3>
                {article.paragraphs?.map((paragraph, index) => (
                  <div key={`${article.no}-${paragraph.mark ?? index}`}>
                    <p>
                      {paragraph.mark ? `${paragraph.mark} ` : null}
                      {paragraph.text}
                    </p>
                    {paragraph.items?.length ? (
                      <ol>
                        {paragraph.items.map((item) => (
                          <li key={item.slice(0, 32)}>{item.replace(/^\d+\.\s*/, "")}</li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                ))}
              </section>
            ))}
            {"sections" in doc && doc.sections
              ? doc.sections.map((section) => (
                  <section
                    key={section.title}
                    className="contract-article"
                    ref={(node) => {
                      headingRefs.current[`${doc.key}-${section.title}`] = node;
                    }}
                  >
                    {section.title ? <h3>{section.title}</h3> : null}
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </section>
                ))
              : null}
          </section>
        ))}
        <div className="contract-sentinel" ref={sentinelRef} />
      </div>
      <div className="contract-agree">
        <label className="contract-check is-all">
          <input type="checkbox" checked={allChecked} disabled={!finished} onChange={(e) => toggleAll(e.target.checked)} />
          전체 동의
        </label>
        {AGREEMENT_ITEMS.map((item) => (
          <label key={item.key} className="contract-check">
            <input
              type="checkbox"
              checked={Boolean(checks[item.key])}
              disabled={!finished}
              onChange={(e) => setChecks((prev) => ({ ...prev, [item.key]: e.target.checked }))}
            />
            {item.required ? (
              <span>
                <span className="contract-req">(필수)</span> {item.label}
              </span>
            ) : (
              item.label
            )}
          </label>
        ))}
        <div className="contract-radio" role="group" aria-labelledby="contract-privacy-title">
          <p id="contract-privacy-title" className="contract-radio-title">
            <span className="contract-req">(필수)</span> [별지 1] 개인정보 수집·이용 동의
          </p>
          <label>
            <input
              type="radio"
              name="privacy"
              value="yes"
              disabled={!finished}
              checked={privacy === "yes"}
              onChange={() => setPrivacy("yes")}
            />
            동의함
          </label>
          <label>
            <input
              type="radio"
              name="privacy"
              value="no"
              disabled={!finished}
              checked={privacy === "no"}
              onChange={() => setPrivacy("no")}
            />
            동의하지 않음
          </label>
          {privacy === "no" ? <p className="partner-apply-alert">{PRIVACY_REFUSAL_NOTICE}</p> : null}
        </div>
      </div>
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="partner-apply-cta">
        {!finished ? (
          <div className="contract-cta-remain">
            <p className="contract-cta-hint">
              지금 {tabLabel(activeDoc?.title || "")} · {activeHeading?.label}
            </p>
            <div className="contract-cta-bar" aria-hidden="true">
              <span style={{ width: `${readPercent}%` }} />
            </div>
            <p className="contract-cta-hint">계약서를 끝까지 읽어주세요 · {remaining}% 남음</p>
          </div>
        ) : null}
        <button type="button" className="btn-apply" disabled={!canSubmit || pending} onClick={() => void onSubmit()}>
          {pending ? "저장 중..." : "동의하고 다음"}
        </button>
      </div>
    </>
  );
}
