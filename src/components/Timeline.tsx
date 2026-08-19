"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Icon } from "@/components/site/mdx-kit";

type TimelineItem = { year: string; title: string; desc: string; icon?: string };

const CARD_STEP = 348;

/** Horizontally scrollable timeline. Native scroll-snap does the work. */
export const Timeline: React.FC<{ items?: TimelineItem[] }> = ({ items = [] }) => {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) =>
    track.current?.scrollBy({ left: direction * CARD_STEP, behavior: "smooth" });

  if (items.length === 0) return null;

  return (
    <div className="ds-timeline">
      <button
        type="button"
        className="ds-timeline-arrow ds-timeline-prev"
        onClick={() => scroll(-1)}
        aria-label="Scroll timeline left"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        className="ds-timeline-arrow ds-timeline-next"
        onClick={() => scroll(1)}
        aria-label="Scroll timeline right"
      >
        <ChevronRight size={18} />
      </button>

      <div className="ds-timeline-track" ref={track}>
        {items.map((item) => (
          <article key={`${item.year}-${item.title}`} className="ds-timeline-item">
            <div className="ds-card">
              <div className="ds-row" style={{ gap: 10, marginBottom: 8 }}>
                <Icon name={item.icon || "sparkle"} size="m" />
                <strong>{item.title}</strong>
              </div>
              <p className="ds-dek" style={{ fontSize: 14 }}>
                {item.desc}
              </p>
            </div>
            <span className="ds-timeline-node" aria-hidden="true" />
            <span className="ds-meta ds-meta-s">{item.year}</span>
          </article>
        ))}
      </div>
    </div>
  );
};
