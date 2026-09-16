"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ResourceDeleteButton({ id }: { id: string }) {
  const { ready, isAdmin } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!ready || !isAdmin) return null;

  async function onDelete() {
    if (!confirm("이 자료를 삭제할까요?")) return;
    setPending(true);
    setError("");
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error || "삭제에 실패했습니다.");
      setPending(false);
      return;
    }
    router.push("/resources");
    router.refresh();
  }

  return (
    <div className="resource-detail-actions">
      <button type="button" className="resource-delete-btn" onClick={() => void onDelete()} disabled={pending}>
        {pending ? "삭제 중..." : "삭제"}
      </button>
      {error ? <p className="resource-detail-error">{error}</p> : null}
    </div>
  );
}
