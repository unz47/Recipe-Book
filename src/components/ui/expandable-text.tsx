"use client";

import { useRef, useState, useEffect } from "react";

import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  text: string;
  lines?: number;
  className?: string;
};

export function ExpandableText({
  text,
  lines = 3,
  className,
}: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setClamped(el.scrollHeight > el.clientHeight);
    }
  }, [text]);

  return (
    <div>
      <p
        ref={ref}
        className={cn(className, !expanded && "line-clamp-[var(--lines)]")}
        style={{ "--lines": lines } as React.CSSProperties}
      >
        {text}
      </p>
      {clamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-primary hover:underline"
        >
          {expanded ? "閉じる" : "もっと見る"}
        </button>
      )}
    </div>
  );
}
