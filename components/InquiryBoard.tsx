"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatInquiryPhone, type InquirySummary } from "@/lib/inquiries";

export default function InquiryBoard() {
  const { user, ready, isAdmin } = useAuth();
  const [items, setItems] = useState<InquirySummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setLoaded(false);
    void fetch("/api/inquiries", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { items?: InquirySummary[] }) => {
        setItems(data.items || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [ready, isAdmin]);

  return (
    <>
      <div className="inquiry-toolbar">
        {!ready ? null : user ? (
          <Link href="/inquiries/new" className="btn-apply h-11 px-6">
            문의 작성
          </Link>
        ) : (
          <Link href="/login?next=/inquiries/new" className="btn-apply h-11 px-6">
            로그인 후 문의하기
          </Link>
        )}
      </div>

      {!loaded ? (
        <p className="resource-empty">문의 목록을 불러오는 중입니다.</p>
      ) : items.length === 0 ? (
        <p className="resource-empty">등록된 문의가 없습니다.</p>
      ) : (
        <div className="inquiry-table-wrap">
          <table className="inquiry-table">
            <thead>
              <tr>
                <th className="col-no">번호</th>
                <th>제목</th>
                <th className="col-author">작성자</th>
                {isAdmin ? <th className="col-phone">연락처</th> : null}
                <th className="col-date">작성일</th>
                <th className="col-status">답변</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="col-no">{items.length - index}</td>
                  <td>
                    <Link href={`/inquiries/${item.id}`}>
                      {item.secret ? <span className="inquiry-lock">비밀</span> : null}
                      {item.title}
                    </Link>
                  </td>
                  <td className="col-author">{item.authorName}</td>
                  {isAdmin ? (
                    <td className="col-phone">{formatInquiryPhone(item.authorPhone) || "-"}</td>
                  ) : null}
                  <td className="col-date">{item.createdAt.slice(0, 10)}</td>
                  <td className="col-status">
                    <span className={item.answered ? "inquiry-badge is-done" : "inquiry-badge"}>
                      {item.answered ? "답변완료" : "대기"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
