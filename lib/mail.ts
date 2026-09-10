import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/siteUrl";

export const INQUIRY_NOTIFY_EMAIL = process.env.INQUIRY_NOTIFY_EMAIL || "taeyanglife@naver.com";

export async function sendInquiryNotice(item: {
  id: string;
  title: string;
  content: string;
  authorName: string;
}) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.warn("[mail] SMTP_USER/SMTP_PASS가 없어 문의 알림 메일을 건너뜁니다.");
    return false;
  }

  const host = process.env.SMTP_HOST || "smtp.naver.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const site = getSiteUrl();
  const link = `${site}/inquiries/${item.id}`;
  const preview = item.content.replace(/\s+/g, " ").trim().slice(0, 240);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: INQUIRY_NOTIFY_EMAIL,
    subject: `[TY파트너스] 새 문의: ${item.title}`,
    text: [
      "새 문의가 등록되었습니다.",
      "",
      `작성자: ${item.authorName}`,
      `제목: ${item.title}`,
      "",
      preview || "(내용 없음)",
      "",
      `게시판 바로가기: ${link}`,
    ].join("\n"),
    html: `
      <p>새 문의가 등록되었습니다.</p>
      <p><strong>작성자</strong> ${escapeHtml(item.authorName)}<br />
      <strong>제목</strong> ${escapeHtml(item.title)}</p>
      <p>${escapeHtml(preview || "(내용 없음)")}</p>
      <p><a href="${escapeHtml(link)}">게시판에서 확인하기</a><br />
      ${escapeHtml(link)}</p>
    `,
  });
  return true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
