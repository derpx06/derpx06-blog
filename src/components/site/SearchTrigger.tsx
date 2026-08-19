"use client";

/** Opens the palette; ⌘K is bound inside SearchPalette itself. */
export function SearchTrigger() {
  return (
    <button
      type="button"
      className="ds-box"
      onClick={() => window.dispatchEvent(new CustomEvent("derpx06:search"))}
    >
      Search ⌘K
    </button>
  );
}
