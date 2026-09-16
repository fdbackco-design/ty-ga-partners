import nodemailer from "nodemailer";
import { formatInquiryPhone } from "@/lib/inquiries";
import { getSiteUrl } from "@/lib/siteUrl";

export const INQUIRY_NOTIFY_EMAIL =
  process.env.INQUIRY_NOTIFY_EMAIL ||
  process.env.LEAD_NOTIFY_TO ||
  "jasonkim@ty-life.co.kr";

export async function sendInquiryNotice(item: {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorPhone?: string;
}) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.warn("[mail] SMTP_USER/SMTP_PASS가 없어 문의 알림 메일을 건너뜁니다.");
    return false;
  }

  const site = getSiteUrl();
  const link = `${site}/inquiries/${item.id}`;
  const phone = formatInquiryPhone(item.authorPhone || "") || "(전화번호 없음)";
  const content = item.content.trim() || "(내용 없음)";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const fromAddress = process.env.MAIL_FROM || user;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"TY파트너스" <${fromAddress}>`,
    to: INQUIRY_NOTIFY_EMAIL,
    subject: `[TY파트너스] 새 문의: ${item.title}`,
    text: [
      "문의 게시판에 새 글이 등록되었습니다.",
      "",
      `이름: ${item.authorName}`,
      `전화번호: ${phone}`,
      `제목: ${item.title}`,
      "",
      "문의 내용:",
      content,
      "",
      `게시판 바로가기: ${link}`,
    ].join("\n"),
    html: `
      <p>문의 게시판에 새 글이 등록되었습니다.</p>
      <p>
        <strong>이름</strong> ${escapeHtml(item.authorName)}<br />
        <strong>전화번호</strong> ${escapeHtml(phone)}<br />
        <strong>제목</strong> ${escapeHtml(item.title)}
      </p>
      <p><strong>문의 내용</strong></p>
      <p>${escapeHtml(content).replace(/\n/g, "<br />")}</p>
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
