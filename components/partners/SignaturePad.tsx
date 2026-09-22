"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MIN_LENGTH = 180;

export default function SignaturePad() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const length = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [landscape, setLandscape] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function resize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#111";
  }

  useEffect(() => {
    const onResize = () => {
      setLandscape(window.innerWidth >= window.innerHeight);
      resize();
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function pos(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    last.current = pos(event);
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !last.current) return;
    const next = pos(event);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    length.current += Math.hypot(next.x - last.current.x, next.y - last.current.y);
    last.current = next;
    setReady(length.current >= MIN_LENGTH);
  }

  function onPointerUp() {
    drawing.current = false;
    last.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    length.current = 0;
    setReady(false);
  }

  async function confirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1000;
    exportCanvas.height = Math.round((canvas.getBoundingClientRect().height / canvas.getBoundingClientRect().width) * 1000);
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
      {!landscape ? <p className="partner-apply-alert">휴대폰을 가로로 돌려주세요</p> : null}
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
