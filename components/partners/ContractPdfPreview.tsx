"use client";

import { useEffect, useRef, useState } from "react";

export default function ContractPdfPreview({ src = "/api/partners/contract/preview" }: { src?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let pdf: { numPages: number; getPage: (n: number) => Promise<any> } | null = null;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    let renderGen = 0;
    let lastWidth = -1;
    let timer: number | undefined;
    const wrap = wrapRef.current;

    async function renderPages() {
      const host = pagesRef.current;
      if (!host || !wrap || !pdf || cancelled) return;
      const cssWidth = wrap.clientWidth;
      if (cssWidth < 32) return;
      if (cssWidth === lastWidth && host.childElementCount === pdf.numPages) return;
      const gen = ++renderGen;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const frag = document.createDocumentFragment();
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        if (cancelled || gen !== renderGen) return;
        const unscaled = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (cssWidth / unscaled.width) * dpr });
        const canvas = document.createElement("canvas");
        canvas.className = "contract-preview-page";
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.setAttribute("aria-label", `계약서 ${n}페이지`);
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
        if (cancelled || gen !== renderGen) return;
        frag.appendChild(canvas);
      }
      host.replaceChildren(frag);
      lastWidth = cssWidth;
    }

    function scheduleRender() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void renderPages();
      }, 180);
    }

    async function load() {
      setStatus("loading");
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const res = await fetch(src, { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) throw new Error("fetch");
      const bytes = new Uint8Array(await res.arrayBuffer());
      const task = pdfjs.getDocument({ data: bytes });
      loadingTask = task;
      const loaded = await task.promise;
      if (cancelled) {
        await task.destroy();
        return;
      }
      pdf = loaded;
      setPageCount(loaded.numPages);
      await renderPages();
      if (!cancelled) setStatus("ready");
    }

    load().catch(() => {
      if (!cancelled) setStatus("error");
    });

    const ro = wrap ? new ResizeObserver(scheduleRender) : null;
    if (wrap && ro) ro.observe(wrap);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      ro?.disconnect();
      void loadingTask?.destroy();
    };
  }, [src]);

  return (
    <div className="contract-preview-stack" ref={wrapRef}>
      {status === "loading" ? <p className="partner-apply-hint">계약서를 불러오는 중입니다…</p> : null}
      {status === "error" ? (
        <p className="partner-apply-alert">
          미리보기를 표시하지 못했습니다.{" "}
          <a href={src} target="_blank" rel="noreferrer">
            새 창에서 열기
          </a>
        </p>
      ) : null}
      {status === "ready" && pageCount ? (
        <p className="partner-apply-hint">전체 {pageCount}페이지 · 화면 너비에 맞춰 표시합니다</p>
      ) : null}
      <div className="contract-preview-pages" ref={pagesRef} />
    </div>
  );
}
