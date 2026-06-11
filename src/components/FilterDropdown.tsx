"use client";

import { useState, useRef, useEffect } from "react";

type FilterDropdownProps = {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  );
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Use mousedown so it fires before any click that might reopen
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors " +
          (selected
            ? "border-accent bg-accent/10 text-accent-light"
            : "border-border text-foreground hover:border-accent/50")
        }
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-44 rounded-lg border border-border bg-surface-elevated p-1 shadow-xl"
          role="listbox"
          aria-label={label}
        >
          <div className="max-h-60 overflow-y-auto">
            {/* "All" option = deselect */}
            <button
              onClick={() => handleSelect("")}
              role="option"
              aria-selected={selected === ""}
              className={
                "flex w-full items-center rounded-md px-3 py-1.5 text-left text-[11px] uppercase tracking-wider transition-colors " +
                (!selected
                  ? "text-accent-light"
                  : "text-muted hover:text-foreground")
              }
            >
              All
            </button>

            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                role="option"
                aria-selected={selected === opt}
                className={
                  "flex w-full items-center rounded-md px-3 py-1.5 text-left text-xs transition-colors " +
                  (selected === opt
                    ? "bg-accent/10 text-accent-light"
                    : "text-foreground hover:bg-accent/5")
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
