export default function LegalHtml({ html }: { html: string }) {
  return <div className="legal-html" dangerouslySetInnerHTML={{ __html: html }} />;
}
