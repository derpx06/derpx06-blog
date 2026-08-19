"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export type CodeTab = { label: string; language: string; code: string; html: string; output?: string };

/**
 * Tabs, copy and the collapsed state. Highlighting already happened on the
 * server — this only ships the interaction.
 */
export function CodeBlock({
  tabs,
  minimized = false,
}: {
  tabs: CodeTab[];
  minimized?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(!minimized);

  if (tabs.length === 0) return null;
  const current = tabs[Math.min(active, tabs.length - 1)];
  // Labels can repeat across tabs, so keys are made unique up front.
  const keys = tabs.map((tab, index) => `${tab.label}-${tab.language}-${index}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the code is still selectable */
    }
  };

  return (
    <div className="ds-code">
      <div className="ds-code-bar">
        <div className="ds-code-tabs">
          {tabs.length > 1 ? (
            tabs.map((tab, index) => (
              <button
                key={keys[index]}
                type="button"
                className={index === active ? "on" : undefined}
                onClick={() => setActive(index)}
              >
                {tab.label}
              </button>
            ))
          ) : (
            <span className="ds-code-lang">{current.label}</span>
          )}
        </div>
        <div className="ds-code-actions">
          {minimized && (
            <button type="button" onClick={() => setOpen((value) => !value)}>
              {open ? "Hide" : "Show"}
            </button>
          )}
          <button type="button" onClick={copy} aria-label="Copy code">
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output, generated server-side from our own content */}
          <div className="ds-code-body" dangerouslySetInnerHTML={{ __html: current.html }} />
          {current.output && (
            <div className="ds-code-output">
              <span className="ds-kickq">Output</span>
              <pre>{current.output}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
