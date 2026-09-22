import { createHash, randomBytes } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import fontkitModule from "@pdf-lib/fontkit";
import { PDFDocument, rgb, degrees, type PDFPage, type PDFFont, type PDFImage } from "pdf-lib";
import { CONTRACT_REVISED_AT, CONTRACT_VERSION } from "@/content/contract/hc-v4";
import { FIELD_COORDS, PAGE_HEIGHT, type ImageField, type TextField } from "@/lib/contract/coordinates";
import { formatSsn } from "@/lib/contract/validate";
import type { PartnerApplication } from "@/lib/partnerApplication";
import type { StoredAgreement } from "@/lib/contract/agreements";

const TEMPLATE = path.join(process.cwd(), "assets", "contract", "hc-v4-template.pdf");
const FONT = path.join(process.cwd(), "assets", "fonts", "NanumGothic-Regular.ttf");

export type ContractPdfInput = {
  application: PartnerApplication;
  ssnFull: string;
  accountNo: string;
  signaturePng: Buffer;
  preview?: boolean;
  debug?: boolean;
  ip?: string;
  userAgent?: string;
};

function drawText(page: PDFPage, font: PDFFont, value: string, field: TextField) {
  page.drawText(value, {
    x: field.x,
    y: field.y,
    size: field.size,
    font,
    color: rgb(0.05, 0.05, 0.08),
    maxWidth: field.maxWidth,
  });
}

function drawImage(page: PDFPage, image: PDFImage, field: ImageField) {
  page.drawImage(image, { x: field.x, y: field.y, width: field.w, height: field.h });
}

function drawDebug(page: PDFPage, field: TextField | ImageField) {
  const w = "w" in field ? field.w : field.maxWidth || 80;
  const h = "h" in field ? field.h : 14;
  page.drawRectangle({
    x: field.x,
    y: field.y,
    width: w,
    height: h,
    borderColor: rgb(0.85, 0.15, 0.15),
    borderWidth: 0.8,
  });
}

function kstStamp(iso?: string | null) {
  const date = iso ? new Date(iso) : new Date();
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    dateLabel: `${get("year")}년 ${get("month")}월 ${get("day")}일`,
    dateCompact: `${get("year")}${get("month")}${get("day")}`,
    dateTime: `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

function formatPhone(digits: string) {
  const value = digits.replace(/\D/g, "");
  if (value.length === 11) return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
  if (value.length === 10) return `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
  return value;
}

function wrapLine(font: PDFFont, text: string, size: number, maxWidth: number) {
  const lines: string[] = [];
  let current = "";
  for (const ch of text) {
    const next = current + ch;
    if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

type PdfFontkit = Parameters<PDFDocument["registerFontkit"]>[0];

function resolveFontkit(mod: { create?: unknown; default?: { create?: unknown } }): PdfFontkit {
  if (typeof mod.create === "function") return mod as PdfFontkit;
  if (mod.default && typeof mod.default.create === "function") return mod.default as PdfFontkit;
  throw new Error("fontkit을 불러오지 못했습니다.");
}

const fontkit = resolveFontkit(fontkitModule as { create?: unknown; default?: { create?: unknown } });

function agreementLines(agreements: StoredAgreement[] | null) {
  const labels: Record<string, string> = {
    independent_contractor: "위촉 영업사원 지위 확인",
    sales_compliance: "부정판매·불완전판매 이해",
    annex_receipt: "부속합의서 제1·2호 교부 확인",
    privacy: "개인정보 수집·이용 동의",
  };
  return (agreements || []).map((item) => `${labels[item.key] || item.key}    ${kstStamp(item.agreedAt).dateTime}`);
}

export async function generateContractPdf(input: ContractPdfInput) {
  const template = await readFile(TEMPLATE);
  const fontBytes = await readFile(FONT);
  const pdf = await PDFDocument.load(template);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: false });
  const signImage = await pdf.embedPng(input.signaturePng);
  const pages = pdf.getPages();
  const page10 = pages[9];
  const page20 = pages[19];
  if (!page10 || !page20) throw new Error("계약서 템플릿 페이지가 올바르지 않습니다.");

  const name = input.application.certName || "";
  const address = [input.application.zipCode, input.application.address1, input.application.address2]
    .filter(Boolean)
    .join(" ");
  const phone = formatPhone(input.application.certMobile || "");
  const signed = kstStamp(input.application.signedAt);
  const ssn = formatSsn(input.ssnFull);
  const coords = FIELD_COORDS;

  drawText(page10, font, name, coords.page10.partyName);
  drawText(page10, font, ssn, coords.page10.partySsn);
  drawText(page10, font, signed.dateLabel, coords.page10.contractDate);
  drawImage(page10, signImage, coords.page10.empConfirmSign);
  drawImage(page10, signImage, coords.page10.partySign);

  if (input.application.privacyAgreed) {
    drawCheck(page20, coords.page20.agreeYes.x + 1.2, coords.page20.agreeYes.y + 3);
  }
  drawText(page20, font, name, coords.page20.name);
  drawText(page20, font, ssn, coords.page20.ssn);
  drawText(page20, font, address, coords.page20.address);
  drawText(page20, font, phone, coords.page20.phone);
  drawText(page20, font, input.application.bankName || "", coords.page20.bankName);
  drawText(page20, font, input.accountNo, coords.page20.accountNo);
  drawText(page20, font, input.application.accountHolder || "", coords.page20.accountHolder);
  drawText(page20, font, input.application.bizRegNo || "", coords.page20.bizRegNo);
  drawImage(page20, signImage, coords.page20.sign);

  if (input.debug) {
    Object.values(coords.page10).forEach((field) => drawDebug(page10, field));
    Object.values(coords.page20).forEach((field) => drawDebug(page20, field));
  }

  if (input.preview) {
    for (const page of pages) {
      page.drawText("미리보기 · 서명 전", {
        x: 90,
        y: 360,
        size: 36,
        font,
        rotate: degrees(32),
        color: rgb(0.75, 0.2, 0.15),
        opacity: 0.18,
      });
    }
    return { bytes: Buffer.from(await pdf.save()), bodyHash: "", fileName: previewName(name, input.application.id) };
  }

  const bodyBytes = await pdf.save();
  const bodyHash = sha256(bodyBytes);
  const history = pdf.addPage([595.32, PAGE_HEIGHT]);
  const lines = [
    "전자계약 체결 이력",
    "─────────────────────────────",
    `계약서 버전       ${CONTRACT_VERSION} (${CONTRACT_REVISED_AT} 개정)`,
    `신청 번호         ${input.application.id}`,
    `본인인증          NICE 휴대폰 인증 / ${kstStamp(input.application.certAt).dateTime} / 응답번호 ${input.application.certResponseNo || "-"}`,
    "동의 이력",
    ...agreementLines(input.application.agreements).map((line) => `                 ${line}`),
    `전자서명          ${kstStamp(input.application.signatureAt || input.application.signedAt).dateTime}`,
    `접속 정보         IP ${input.ip || "-"} / ${(input.userAgent || "").slice(0, 80)}`,
    `문서 해시         SHA-256 ${bodyHash}`,
  ];
  let y = 780;
  for (const line of lines) {
    const size = line.startsWith("전자계약") ? 16 : 9;
    for (const part of wrapLine(font, line, size, 500)) {
      history.drawText(part, { x: 48, y, size, font, color: rgb(0.1, 0.1, 0.12) });
      y -= line.startsWith("전자계약") ? 28 : 14;
    }
  }

  const finalBytes = Buffer.from(await pdf.save());
  return {
    bytes: finalBytes,
    bodyHash,
    fullHash: sha256(finalBytes),
    fileName: `TY_위촉계약서_${name}_${signed.dateCompact}_${input.application.id.slice(0, 8)}.pdf`,
  };
}

function drawCheck(page: PDFPage, x: number, y: number) {
  page.drawLine({
    start: { x, y: y + 3 },
    end: { x: x + 3.5, y: y - 1 },
    thickness: 1.4,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawLine({
    start: { x: x + 3.5, y: y - 1 },
    end: { x: x + 11, y: y + 8 },
    thickness: 1.4,
    color: rgb(0.1, 0.1, 0.1),
  });
}

function previewName(name: string, id: string) {
  return `TY_위촉계약서_미리보기_${name}_${id.slice(0, 8)}.pdf`;
}

export function newDocToken() {
  return randomBytes(16).toString("hex");
}
