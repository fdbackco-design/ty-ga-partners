"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatConsultBirthdate, formatConsultPhone, type ConsultationSummary } from "@/lib/consultations";

export default function ConsultBoard({
  itemHrefBase = "/consult",
  showWrite = true,
}: {
  itemHrefBase?: string;
  showWrite?: boolean;
}) {
  const { ready, isAdmin } = useAuth();
  const [items, setItems] = useState<ConsultationSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setLoaded(false);
    void fetch("/api/consultations", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { items?: ConsultationSummary[] }) => {
        setItems(data.items || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [ready, isAdmin]);

  return (
    <>
      {showWrite ? (
        <div className="inquiry-toolbar">
          <a href="#consult-form" className="btn-apply h-11 px-6">
            상담 신청
          </a>
        </div>
      ) : null}

      {!loaded ? (
        <p className="resource-empty">상담신청 목록을 불러오는 중입니다.</p>
      ) : items.length === 0 ? (
        <p className="resource-empty">접수된 상담신청이 없습니다.</p>
      ) : (
        <div className="inquiry-table-wrap">
          <table className="inquiry-table">
            <thead>
              <tr>
                <th className="col-no">번호</th>
                <th>상담 내용</th>
                <th className="col-author">신청자</th>
                {isAdmin ? <th className="col-birth">생년월일</th> : null}
                {isAdmin ? <th className="col-phone">연락처</th> : null}
                <th className="col-date">작성일</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="col-no">{items.length - index}</td>
                  <td>
                    <Link href={`${itemHrefBase}/${item.id}`}>
                      {item.secret ? <span className="inquiry-lock">비밀</span> : null}
                      {item.title}
                    </Link>
                  </td>
                  <td className="col-author">{item.name}</td>
                  {isAdmin ? <td className="col-birth">{formatConsultBirthdate(item.birthdate) || "-"}</td> : null}
                  {isAdmin ? <td className="col-phone">{formatConsultPhone(item.phone) || "-"}</td> : null}
                  <td className="col-date">{item.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
