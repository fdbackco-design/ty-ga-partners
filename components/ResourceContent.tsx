import { parseResourceContent } from "@/lib/resources";

export default function ResourceContent({ content }: { content: string }) {
  const parts = parseResourceContent(content);
  return (
    <div className="resource-content">
      {parts.map((part, index) =>
        part.type === "image" ? (
          <img key={`${part.src}-${index}`} src={part.src} alt={part.alt || "자료 이미지"} className="resource-inline-image" />
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </div>
  );
}
