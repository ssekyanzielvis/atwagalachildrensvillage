import { useState } from "react";

interface TruncatedTextProps {
  text: string;
  lines?: number;
}

export default function TruncatedText({ text, lines = 3 }: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className={`overflow-hidden transition-all duration-200 ${expanded ? "" : "line-clamp-" + lines}`}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : lines,
          WebkitBoxOrient: "vertical",
        }}
      >
        {text}
      </div>
      {text && text.length > 120 && !expanded && (
        <button
          className="text-blue-600 hover:underline mt-2"
          onClick={() => setExpanded(true)}
        >
          View More
        </button>
      )}
      {expanded && (
        <button
          className="text-blue-600 hover:underline mt-2"
          onClick={() => setExpanded(false)}
        >
          Show Less
        </button>
      )}
    </div>
  );
}
