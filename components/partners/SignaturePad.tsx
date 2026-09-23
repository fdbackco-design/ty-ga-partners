"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MIN_LENGTH = 180;

type Point = { x: number; y: number };

export default function SignaturePad() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const length = useRef(0);
  const strokes = useRef<Point[][]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function setupCtx(ctx: CanvasRenderingContext2D, dpr: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#111";
  }

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupCtx(ctx, dpr);
    for (const stroke of strokes.current) {
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, 1.2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }

  function resize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const nextW = Math.max(1, Math.floor(rect.width * dpr));
    const nextH = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    redraw();
  }

  useEffect(() => {
    resize();
    const onResize = () => {
      if (drawing.current) return;
      resize();
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  function pos(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const point = pos(event);
    strokes.current.push([point]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const stroke = strokes.current[strokes.current.length - 1];
    if (!ctx || !stroke?.length) return;
    const next = pos(event);
    const prev = stroke[stroke.length - 1];
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    length.current += Math.hypot(next.x - prev.x, next.y - prev.y);
    stroke.push(next);
    const nextReady = length.current >= MIN_LENGTH;
    setReady((was) => (was === nextReady ? was : nextReady));
  }

  function onPointerUp() {
    drawing.current = false;
    resize();
  }

  function clear() {
    strokes.current = [];
    length.current = 0;
    setReady(false);
    redraw();
  }

  async function confirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1000;
    exportCanvas.height = Math.max(1, Math.round((box.height / box.width) * 1000));
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    setPending(true);
    setError("");
    const res = await fetch("/api/partners/contract/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: exportCanvas.toDataURL("image/png") }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "서명 저장에 실패했습니다.");
      return;
    }
    router.push("/partners/apply/contract/review");
  }

  return (
    <div className="signature-wrap">
      <canvas
        ref={canvasRef}
        className="signature-canvas"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="signature-actions">
        <button type="button" className="contract-ghost" onClick={clear}>
          다시 쓰기
        </button>
        <button type="button" className="btn-apply" disabled={!ready || pending} onClick={() => void confirm()}>
          {pending ? "저장 중..." : "확인"}
        </button>
      </div>
    </div>
  );
}
