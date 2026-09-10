import Link from "next/link";
import { COMPANY, FOOTER_LEGAL } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-grid">
        <div>
          <p className="site-footer-brand">{COMPANY.tradeName}</p>
          <p className="site-footer-slogan">{COMPANY.slogan}</p>
          <p>
            상호명: {COMPANY.tradeName}　대표자: {COMPANY.ceo}　사업자등록번호: {COMPANY.bizNo}
          </p>
          <p>대표자 이메일: {COMPANY.email}</p>
          <p className="site-footer-copy">{COMPANY.copyright}</p>
        </div>
        <ul className="site-footer-links">
          {FOOTER_LEGAL.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
